import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Truck, Zap, Crown, MapPin } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { usePayment } from '../contexts/PaymentContext';
import PaymentModal from '../components/PaymentModal';
import { PaymentDetails } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const SHIPPING_OPTIONS = [
  {
    id: 'standard',
    name: 'Standard Delivery',
    cost: 50,
    days: '5-7',
    icon: Truck,
    description: 'Regular delivery',
  },
  {
    id: 'express',
    name: 'Express Delivery',
    cost: 100,
    days: '2-3',
    icon: Zap,
    description: 'Faster delivery',
  },
  {
    id: 'premium',
    name: 'Premium Delivery',
    cost: 150,
    days: '1',
    icon: Crown,
    description: 'Next day delivery',
  },
];

export default function CheckoutPage() {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { processPayment } = usePayment();
  const navigate = useNavigate();
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentTransactionId, setPaymentTransactionId] = useState('');

  // Saved addresses
  interface SavedAddress {
    id: string;
    name: string;
    phone: string;
    address: string;
    pincode: string;
    is_default: boolean;
  }

  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [usingSavedAddress, setUsingSavedAddress] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    pincode: '',
  });

  const [shippingOption, setShippingOption] = useState<string>('standard');

  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    phone?: string;
    address?: string;
    pincode?: string;
  }>({});

  // Fetch saved addresses on mount if user is logged in
  useEffect(() => {
    if (user) {
      fetchSavedAddresses();
    }
  }, [user]);

  const fetchSavedAddresses = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/api/user/addresses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSavedAddresses(data);
        
        // Pre-select default address
        const defaultAddr = data.find((addr: SavedAddress) => addr.is_default);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
          setUsingSavedAddress(true);
          setFormData({
            name: defaultAddr.name,
            phone: defaultAddr.phone,
            address: defaultAddr.address,
            pincode: defaultAddr.pincode,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching saved addresses:', error);
    }
  };

  const handleSelectSavedAddress = (addressId: string) => {
    const selected = savedAddresses.find(addr => addr.id === addressId);
    if (selected) {
      setSelectedAddressId(addressId);
      setFormData({
        name: selected.name,
        phone: selected.phone,
        address: selected.address,
        pincode: selected.pincode,
      });
      setFieldErrors({});
    }
  };

  const validateName = (name: string): string | null => {
    if (!name.trim()) {
      return 'Full name is required';
    }
    if (name.trim().length < 2) {
      return 'Name must be at least 2 characters';
    }
    if (!/^[a-zA-Z\s'-]+$/.test(name)) {
      return 'Name can only contain letters, spaces, hyphens, and apostrophes';
    }
    return null;
  };

  const validatePhone = (phone: string): string | null => {
    if (!phone.trim()) {
      return 'Phone number is required';
    }
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone.replace(/\D/g, ''))) {
      return 'Phone number must be a valid 10-digit number';
    }
    return null;
  };

  const validateAddress = (address: string): string | null => {
    if (!address.trim()) {
      return 'Delivery address is required';
    }
    if (address.trim().length < 10) {
      return 'Address must be at least 10 characters';
    }
    return null;
  };

  const validatePincode = (pincode: string): string | null => {
    if (!pincode.trim()) {
      return 'Pincode is required';
    }
    const pincodeRegex = /^[0-9]{6}$/;
    if (!pincodeRegex.test(pincode.trim())) {
      return 'Pincode must be a valid 6-digit number';
    }
    return null;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setUsingSavedAddress(false);
    
    // Clear field error on change
    if (fieldErrors[name as keyof typeof fieldErrors]) {
      setFieldErrors({ ...fieldErrors, [name]: '' });
    }
  };

  const generateOrderNumber = () => {
    return 'ORD' + Date.now() + Math.floor(Math.random() * 1000);
  };

  const getShippingCost = () => {
    const selected = SHIPPING_OPTIONS.find(opt => opt.id === shippingOption);
    return selected?.cost || 50;
  };

  const handlePaymentSubmit = async (paymentDetails: PaymentDetails) => {
    const shippingCost = getShippingCost();
    const total = getCartTotal() + shippingCost;
    setPaymentError('');

    try {
      const response = await processPayment(paymentDetails, total);

      if (response.success) {
        setPaymentSuccess(true);
        setPaymentTransactionId(response.transactionId);

        // Create order after successful payment
        setTimeout(async () => {
          try {
            const orderNum = generateOrderNumber();
            const token = localStorage.getItem('auth_token');

            const orderRes = await fetch(`${API_URL}/api/orders`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
              body: JSON.stringify({
                order_number: orderNum,
                user_id: user?.id || null,
                customer_name: formData.name,
                customer_phone: formData.phone,
                delivery_address: formData.address,
                pincode: formData.pincode,
                total_amount: total,
                status: 'Confirmed',
                items: cartItems.map((item) => ({
                  product_id: item.product.id,
                  quantity: item.quantity,
                  price: item.product.price,
                })),
                payment_method: paymentDetails.method,
                transaction_id: response.transactionId,
                shipping_method: shippingOption,
                shipping_cost: shippingCost,
              }),
            });

            if (!orderRes.ok) {
              const err = await orderRes.json();
              throw new Error(err.error || 'Failed to create order');
            }

            // Auto-save address for logged-in users if not using saved address
            if (user && !usingSavedAddress) {
              try {
                const token = localStorage.getItem('auth_token');
                await fetch(`${API_URL}/api/user/addresses`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({
                    name: formData.name,
                    phone: formData.phone,
                    address: formData.address,
                    pincode: formData.pincode,
                  }),
                });
              } catch (error) {
                console.error('Error saving address:', error);
              }
            }

            // Auto-save payment method for logged-in users if flag is set
            if (user && paymentDetails.shouldSave) {
              try {
                const token = localStorage.getItem('auth_token');
                const cardHolder = paymentDetails.cardHolder || 'Saved Card';
                const cardNumber = paymentDetails.cardNumber || '';
                const paymentMethod = paymentDetails.method;

                await fetch(`${API_URL}/api/user/payments`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({
                    card_holder: cardHolder,
                    card_number: cardNumber,
                    payment_method: paymentMethod,
                  }),
                });
              } catch (error) {
                console.error('Error saving payment method:', error);
              }
            }

            setOrderNumber(orderNum);
            setOrderComplete(true);
            clearCart();
          } catch (error) {
            console.error('Error creating order:', error);
            alert('Order creation failed. Please contact support with transaction ID: ' + response.transactionId);
          }
        }, 2000);
      } else {
        setPaymentError(response.message);
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentError('Payment processing failed. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const nameError = validateName(formData.name);
    const phoneError = validatePhone(formData.phone);
    const addressError = validateAddress(formData.address);
    const pincodeError = validatePincode(formData.pincode);

    if (nameError || phoneError || addressError || pincodeError) {
      setFieldErrors({
        name: nameError || '',
        phone: phoneError || '',
        address: addressError || '',
        pincode: pincodeError || '',
      });
      return;
    }

    // Open payment modal instead of creating order directly
    setPaymentModalOpen(true);
  };

  if (cartItems.length === 0 && !orderComplete) {
    navigate('/cart');
    return null;
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4 text-center">
          <CheckCircle className="h-20 w-20 text-green-600 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Order Confirmed!</h2>
          <p className="text-gray-600 mb-6">
            Your order has been placed successfully.
          </p>
          <div className="bg-green-50 border-2 border-green-600 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-1">Order Number</p>
            <p className="text-2xl font-bold text-green-600">{orderNumber}</p>
          </div>
          <p className="text-sm text-gray-600 mb-6">
            We'll deliver your order to the address you provided. Thank you for shopping with us!
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/orders')}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition"
            >
              View Orders
            </button>
            <button
              onClick={() => navigate('/products')}
              className="w-full bg-white border-2 border-green-600 text-green-600 hover:bg-green-50 py-3 rounded-lg font-semibold transition"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  const total = getCartTotal();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Delivery Information</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Saved Addresses Section for Logged-in Users */}
              {user && savedAddresses.length > 0 && !usingSavedAddress && (
                <button
                  type="button"
                  onClick={() => {
                    const defaultAddr = savedAddresses.find(addr => addr.is_default);
                    if (defaultAddr) {
                      handleSelectSavedAddress(defaultAddr.id);
                    }
                  }}
                  className="w-full text-center text-sm bg-green-50 border border-green-300 text-green-700 hover:bg-green-100 font-semibold py-2 rounded-lg transition"
                >
                  ← Use Saved Address
                </button>
              )}

              {user && savedAddresses.length > 0 && usingSavedAddress && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <MapPin className="inline mr-2 h-4 w-4" />
                    Saved Addresses
                  </label>
                  <div className="space-y-2 mb-4">
                    {savedAddresses.map((addr) => (
                      <label key={addr.id} className="flex items-start p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                        <input
                          type="radio"
                          name="savedAddress"
                          checked={selectedAddressId === addr.id}
                          onChange={() => handleSelectSavedAddress(addr.id)}
                          className="w-4 h-4 text-green-600 mt-1"
                        />
                        <div className="ml-3 flex-1">
                          <p className="font-medium text-gray-900">{addr.name}</p>
                          <p className="text-xs text-gray-600">{addr.phone}</p>
                          <p className="text-xs text-gray-600">{addr.address}, {addr.pincode}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setUsingSavedAddress(false);
                      setFormData({ name: '', phone: '', address: '', pincode: '' });
                      setFieldErrors({});
                    }}
                    className="w-full text-center text-sm text-green-600 hover:text-green-700 font-semibold py-2 border border-green-600 rounded-lg hover:bg-green-50 mb-4 transition"
                  >
                    Use Different Address
                  </button>
                </div>
              )}

              {user && savedAddresses.length === 0 && (
                <div className="bg-blue-50 border border-blue-300 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-700">
                    💡 Save your delivery addresses to <a href="/account" className="font-semibold hover:underline">Account Settings</a> for faster checkout!
                  </p>
                </div>
              )}

              {!usingSavedAddress && (
                <>
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        fieldErrors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {fieldErrors.name && (
                      <p className="mt-1 text-sm text-red-600">{fieldErrors.name}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        fieldErrors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="10-digit phone number"
                    />
                    {fieldErrors.phone && (
                      <p className="mt-1 text-sm text-red-600">{fieldErrors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                      Delivery Address
                    </label>
                    <textarea
                      id="address"
                      name="address"
                      required
                      rows={3}
                      value={formData.address}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        fieldErrors.address ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your complete delivery address"
                    />
                    {fieldErrors.address && (
                      <p className="mt-1 text-sm text-red-600">{fieldErrors.address}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-1">
                      Pincode
                    </label>
                    <input
                      type="text"
                      id="pincode"
                      name="pincode"
                      required
                      value={formData.pincode}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        fieldErrors.pincode ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="6-digit pincode"
                    />
                    {fieldErrors.pincode && (
                      <p className="mt-1 text-sm text-red-600">{fieldErrors.pincode}</p>
                    )}
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Shipping Option
                </label>
                <div className="space-y-2">
                  {SHIPPING_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    return (
                      <label key={option.id} className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                        <input
                          type="radio"
                          name="shipping"
                          value={option.id}
                          checked={shippingOption === option.id}
                          onChange={(e) => setShippingOption(e.target.value)}
                          className="w-4 h-4 text-green-600"
                        />
                        <Icon className="w-5 h-5 text-green-600 ml-3" />
                        <div className="ml-2 flex-1">
                          <p className="font-medium text-gray-900">{option.name}</p>
                          <p className="text-xs text-gray-600">{option.days} days • {option.description}</p>
                        </div>
                        <span className="font-semibold text-gray-900">₹{option.cost}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition"
              >
                Proceed to Payment
              </button>
            </form>
          </div>

          <div>
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>
              <div className="space-y-3 mb-6">
                {cartItems.map(({ product, quantity }) => (
                  <div key={product.id} className="flex justify-between text-gray-600">
                    <span>
                      {product.name} x {quantity}
                    </span>
                    <span>₹{(product.price * quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t pt-3">
                  <div className="flex justify-between text-gray-600 mb-2">
                    <span>Subtotal</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 mb-3">
                    <span>{SHIPPING_OPTIONS.find(opt => opt.id === shippingOption)?.name}</span>
                    <span>₹{getShippingCost().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-gray-900">
                    <span>Total</span>
                    <span>₹{(total + getShippingCost()).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={paymentModalOpen && !paymentSuccess}
        amount={getCartTotal() + getShippingCost()}
        onClose={() => {
          setPaymentModalOpen(false);
          setPaymentError('');
        }}
        onSubmit={handlePaymentSubmit}
        error={paymentError}
        success={paymentSuccess}
        transactionId={paymentTransactionId}
        user={user}
      />

      {/* Success Overlay for Payment Modal */}
      {paymentSuccess && (
        <PaymentModal
          isOpen={true}
          amount={getCartTotal() + getShippingCost()}
          onClose={() => {
            setPaymentModalOpen(false);
            setPaymentSuccess(false);
          }}
          onSubmit={handlePaymentSubmit}
          success={true}
          transactionId={paymentTransactionId}
          user={user}
        />
      )}
    </div>
  );
}
