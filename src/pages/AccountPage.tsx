import { useState, useEffect } from 'react';
import { MapPin, CreditCard, Plus, Edit2, Trash2, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface SavedAddress {
  id: string;
  name: string;
  phone: string;
  address: string;
  pincode: string;
  is_default: boolean;
}

interface SavedPayment {
  id: string;
  card_holder: string;
  last_four: string;
  payment_method: string;
  is_default: boolean;
}

export default function AccountPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [payments, setPayments] = useState<SavedPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'addresses' | 'payments'>('addresses');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(null);
  const [editingPayment, setEditingPayment] = useState<SavedPayment | null>(null);

  const [addressFormData, setAddressFormData] = useState({
    name: '',
    phone: '',
    address: '',
    pincode: '',
  });

  const [paymentFormData, setPaymentFormData] = useState({
    card_holder: '',
    card_number: '',
    payment_method: 'credit_card',
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  if (!user) {
    navigate('/login');
    return null;
  }

  useEffect(() => {
    fetchAddresses();
    fetchPayments();
  }, [user]);

  const fetchAddresses = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/api/user/addresses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAddresses(data);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/api/user/payments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPayments(data);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  const validateAddressForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!addressFormData.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!addressFormData.phone.trim()) {
      errors.phone = 'Phone is required';
    } else if (!/^[0-9]{10}$/.test(addressFormData.phone.replace(/\D/g, ''))) {
      errors.phone = 'Phone must be 10 digits';
    }

    if (!addressFormData.address.trim()) {
      errors.address = 'Address is required';
    } else if (addressFormData.address.trim().length < 10) {
      errors.address = 'Address must be at least 10 characters';
    }

    if (!addressFormData.pincode.trim()) {
      errors.pincode = 'Pincode is required';
    } else if (!/^[0-9]{6}$/.test(addressFormData.pincode.trim())) {
      errors.pincode = 'Pincode must be 6 digits';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePaymentForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!paymentFormData.card_holder.trim()) {
      errors.card_holder = 'Card holder name is required';
    }

    if (!paymentFormData.card_number.trim()) {
      errors.card_number = 'Card number is required';
    } else if (!/^[0-9]{13,19}$/.test(paymentFormData.card_number.replace(/\s/g, ''))) {
      errors.card_number = 'Card number must be 13-19 digits';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const saveAddress = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateAddressForm()) return;

    try {
      const token = localStorage.getItem('auth_token');
      const method = editingAddress ? 'PUT' : 'POST';
      const endpoint = editingAddress
        ? `${API_URL}/api/user/addresses/${editingAddress.id}`
        : `${API_URL}/api/user/addresses`;

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(addressFormData),
      });

      if (res.ok) {
        setEditingAddress(null);
        setAddressFormData({ name: '', phone: '', address: '', pincode: '' });
        setShowAddressForm(false);
        setFieldErrors({});
        fetchAddresses();
      }
    } catch (error) {
      console.error('Error saving address:', error);
    }
  };

  const savePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePaymentForm()) return;

    try {
      const token = localStorage.getItem('auth_token');
      const method = editingPayment ? 'PUT' : 'POST';
      const endpoint = editingPayment
        ? `${API_URL}/api/user/payments/${editingPayment.id}`
        : `${API_URL}/api/user/payments`;

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(paymentFormData),
      });

      if (res.ok) {
        setEditingPayment(null);
        setPaymentFormData({ card_holder: '', card_number: '', payment_method: 'credit_card' });
        setShowPaymentForm(false);
        setFieldErrors({});
        fetchPayments();
      }
    } catch (error) {
      console.error('Error saving payment:', error);
    }
  };

  const deleteAddress = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/api/user/addresses/${addressId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        fetchAddresses();
      }
    } catch (error) {
      console.error('Error deleting address:', error);
    }
  };

  const deletePayment = async (paymentId: string) => {
    if (!confirm('Are you sure you want to delete this payment method?')) return;

    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/api/user/payments/${paymentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        fetchPayments();
      }
    } catch (error) {
      console.error('Error deleting payment:', error);
    }
  };

  const setDefaultAddress = async (addressId: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/api/user/addresses/${addressId}/default`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        fetchAddresses();
      }
    } catch (error) {
      console.error('Error setting default address:', error);
    }
  };

  const setDefaultPayment = async (paymentId: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/api/user/payments/${paymentId}/default`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        fetchPayments();
      }
    } catch (error) {
      console.error('Error setting default payment:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Account Settings</h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b">
          <button
            onClick={() => setActiveTab('addresses')}
            className={`pb-3 px-4 font-semibold border-b-2 transition ${
              activeTab === 'addresses'
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <MapPin className="inline mr-2 h-5 w-5" />
            Addresses
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`pb-3 px-4 font-semibold border-b-2 transition ${
              activeTab === 'payments'
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <CreditCard className="inline mr-2 h-5 w-5" />
            Payment Methods
          </button>
        </div>

        {/* Addresses Tab */}
        {activeTab === 'addresses' && (
          <div>
            <button
              onClick={() => {
                setShowAddressForm(!showAddressForm);
                setEditingAddress(null);
                setAddressFormData({ name: '', phone: '', address: '', pincode: '' });
                setFieldErrors({});
              }}
              className="mb-6 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add New Address
            </button>

            {showAddressForm && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {editingAddress ? 'Edit Address' : 'Add New Address'}
                </h3>
                <form onSubmit={saveAddress} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={addressFormData.name}
                      onChange={(e) => {
                        setAddressFormData({ ...addressFormData, name: e.target.value });
                        if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: '' });
                      }}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        fieldErrors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {fieldErrors.name && <p className="mt-1 text-sm text-red-600">{fieldErrors.name}</p>}
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={addressFormData.phone}
                      onChange={(e) => {
                        setAddressFormData({ ...addressFormData, phone: e.target.value });
                        if (fieldErrors.phone) setFieldErrors({ ...fieldErrors, phone: '' });
                      }}
                      placeholder="10-digit phone number"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        fieldErrors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {fieldErrors.phone && <p className="mt-1 text-sm text-red-600">{fieldErrors.phone}</p>}
                  </div>

                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <textarea
                      id="address"
                      value={addressFormData.address}
                      onChange={(e) => {
                        setAddressFormData({ ...addressFormData, address: e.target.value });
                        if (fieldErrors.address) setFieldErrors({ ...fieldErrors, address: '' });
                      }}
                      rows={3}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        fieldErrors.address ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {fieldErrors.address && <p className="mt-1 text-sm text-red-600">{fieldErrors.address}</p>}
                  </div>

                  <div>
                    <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-1">
                      Pincode
                    </label>
                    <input
                      type="text"
                      id="pincode"
                      value={addressFormData.pincode}
                      onChange={(e) => {
                        setAddressFormData({ ...addressFormData, pincode: e.target.value });
                        if (fieldErrors.pincode) setFieldErrors({ ...fieldErrors, pincode: '' });
                      }}
                      placeholder="6-digit pincode"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        fieldErrors.pincode ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {fieldErrors.pincode && <p className="mt-1 text-sm text-red-600">{fieldErrors.pincode}</p>}
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold transition"
                    >
                      {editingAddress ? 'Update Address' : 'Save Address'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddressForm(false);
                        setEditingAddress(null);
                        setAddressFormData({ name: '', phone: '', address: '', pincode: '' });
                        setFieldErrors({});
                      }}
                      className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Addresses List */}
            <div className="space-y-4">
              {addresses.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No addresses saved yet</p>
              ) : (
                addresses.map((addr) => (
                  <div key={addr.id} className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{addr.name}</h3>
                        <p className="text-gray-600 text-sm">{addr.phone}</p>
                      </div>
                      {addr.is_default && (
                        <span className="flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                          <CheckCircle className="h-4 w-4" />
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{addr.address}</p>
                    <p className="text-gray-600 text-sm mb-4">Pincode: {addr.pincode}</p>
                    <div className="flex gap-3">
                      {!addr.is_default && (
                        <button
                          onClick={() => setDefaultAddress(addr.id)}
                          className="flex-1 border border-green-600 text-green-600 py-2 rounded-lg font-semibold hover:bg-green-50 transition"
                        >
                          Set as Default
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setEditingAddress(addr);
                          setAddressFormData({
                            name: addr.name,
                            phone: addr.phone,
                            address: addr.address,
                            pincode: addr.pincode,
                          });
                          setShowAddressForm(true);
                          setFieldErrors({});
                        }}
                        className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-lg font-semibold hover:bg-gray-50 transition"
                      >
                        <Edit2 className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => deleteAddress(addr.id)}
                        className="text-red-600 hover:text-red-700 p-2 transition"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div>
            <button
              onClick={() => {
                setShowPaymentForm(!showPaymentForm);
                setEditingPayment(null);
                setPaymentFormData({ card_holder: '', card_number: '', payment_method: 'credit_card' });
                setFieldErrors({});
              }}
              className="mb-6 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add New Payment Method
            </button>

            {showPaymentForm && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {editingPayment ? 'Edit Payment Method' : 'Add New Payment Method'}
                </h3>
                <form onSubmit={savePayment} className="space-y-4">
                  <div>
                    <label htmlFor="card_holder" className="block text-sm font-medium text-gray-700 mb-1">
                      Card Holder Name
                    </label>
                    <input
                      type="text"
                      id="card_holder"
                      value={paymentFormData.card_holder}
                      onChange={(e) => {
                        setPaymentFormData({ ...paymentFormData, card_holder: e.target.value });
                        if (fieldErrors.card_holder) setFieldErrors({ ...fieldErrors, card_holder: '' });
                      }}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        fieldErrors.card_holder ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {fieldErrors.card_holder && (
                      <p className="mt-1 text-sm text-red-600">{fieldErrors.card_holder}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="card_number" className="block text-sm font-medium text-gray-700 mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      id="card_number"
                      value={paymentFormData.card_number}
                      onChange={(e) => {
                        setPaymentFormData({ ...paymentFormData, card_number: e.target.value });
                        if (fieldErrors.card_number) setFieldErrors({ ...fieldErrors, card_number: '' });
                      }}
                      placeholder="13-19 digits"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        fieldErrors.card_number ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {fieldErrors.card_number && (
                      <p className="mt-1 text-sm text-red-600">{fieldErrors.card_number}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="payment_method" className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Type
                    </label>
                    <select
                      id="payment_method"
                      value={paymentFormData.payment_method}
                      onChange={(e) =>
                        setPaymentFormData({ ...paymentFormData, payment_method: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="credit_card">Credit Card</option>
                      <option value="debit_card">Debit Card</option>
                    </select>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold transition"
                    >
                      {editingPayment ? 'Update Payment Method' : 'Save Payment Method'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPaymentForm(false);
                        setEditingPayment(null);
                        setPaymentFormData({ card_holder: '', card_number: '', payment_method: 'credit_card' });
                        setFieldErrors({});
                      }}
                      className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Payments List */}
            <div className="space-y-4">
              {payments.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No payment methods saved yet</p>
              ) : (
                payments.map((payment) => (
                  <div key={payment.id} className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{payment.card_holder}</h3>
                        <p className="text-gray-600 text-sm">
                          {payment.payment_method === 'credit_card' ? 'Credit Card' : 'Debit Card'} ending in{' '}
                          {payment.last_four}
                        </p>
                      </div>
                      {payment.is_default && (
                        <span className="flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                          <CheckCircle className="h-4 w-4" />
                          Default
                        </span>
                      )}
                    </div>
                    <div className="flex gap-3">
                      {!payment.is_default && (
                        <button
                          onClick={() => setDefaultPayment(payment.id)}
                          className="flex-1 border border-green-600 text-green-600 py-2 rounded-lg font-semibold hover:bg-green-50 transition"
                        >
                          Set as Default
                        </button>
                      )}
                      <button
                        onClick={() => deletePayment(payment.id)}
                        className="text-red-600 hover:text-red-700 p-2 transition"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
