import { useState } from 'react';
import { X, CreditCard, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import { PaymentDetails, PaymentMethod } from '../types';
import { 
  formatCardNumber, 
  formatExpiryDate, 
  formatCVV
} from '../lib/paymentService';

interface PaymentModalProps {
  isOpen: boolean;
  amount: number;
  onClose: () => void;
  onSubmit: (details: PaymentDetails) => Promise<void>;
  isProcessing?: boolean;
  error?: string;
  success?: boolean;
  transactionId?: string;
  user?: { id: string | number; email: string; name?: string } | null;
}

export default function PaymentModal({
  isOpen,
  amount,
  onClose,
  onSubmit,
  isProcessing = false,
  error,
  success,
  transactionId,
  user,
}: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('credit_card');
  const [savePaymentMethod, setSavePaymentMethod] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
    upiId: '',
    bankName: '',
    walletProvider: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Apply formatting based on field
    if (name === 'cardNumber') {
      formattedValue = formatCardNumber(value);
    } else if (name === 'expiryDate') {
      formattedValue = formatExpiryDate(value);
    } else if (name === 'cvv') {
      formattedValue = formatCVV(value);
    }

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const paymentDetails: PaymentDetails = {
      method: selectedMethod,
      cardNumber: formData.cardNumber || undefined,
      cardHolder: formData.cardHolder || undefined,
      expiryDate: formData.expiryDate || undefined,
      cvv: formData.cvv || undefined,
      upiId: formData.upiId || undefined,
      bankName: formData.bankName || undefined,
      walletProvider: formData.walletProvider || undefined,
      shouldSave: user ? savePaymentMethod : false,
    };

    await onSubmit(paymentDetails);
  };

  if (!isOpen) return null;

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Payment Successful!</h3>
          <p className="text-gray-600 mb-6">
            Your payment of ₹{amount.toFixed(2)} has been processed successfully.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-1">Transaction ID</p>
            <p className="text-lg font-mono font-bold text-green-600 break-all">{transactionId}</p>
          </div>
          <button
            onClick={onClose}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition"
          >
            Continue to Order
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Payment</h2>
            <p className="text-gray-600 text-sm">Amount: ₹{amount.toFixed(2)}</p>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Payment Method Selection */}
        <div className="p-6">
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Select Payment Method
          </label>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { id: 'credit_card' as PaymentMethod, label: 'Credit Card', icon: '💳' },
              { id: 'debit_card' as PaymentMethod, label: 'Debit Card', icon: '🏦' },
              { id: 'upi' as PaymentMethod, label: 'UPI', icon: '📱' },
              { id: 'net_banking' as PaymentMethod, label: 'Net Banking', icon: '🏛️' },
              { id: 'wallet' as PaymentMethod, label: 'Wallet', icon: '💰' },
              { id: 'cash_on_delivery' as PaymentMethod, label: 'Cash on Delivery', icon: '🚚' },
            ].map(method => (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                disabled={isProcessing}
                className={`p-3 rounded-lg border-2 transition disabled:opacity-50 ${
                  selectedMethod === method.id
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-1">{method.icon}</div>
                <div className="text-xs font-semibold text-gray-900">{method.label}</div>
              </button>
            ))}
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {(selectedMethod === 'credit_card' || selectedMethod === 'debit_card') && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Card Number
                  </label>
                  <input
                    type="text"
                    name="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={formData.cardNumber}
                    onChange={handleChange}
                    maxLength={19}
                    disabled={isProcessing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">Test: 4532 1488 0343 6467</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    name="cardHolder"
                    placeholder="John Doe"
                    value={formData.cardHolder}
                    onChange={handleChange}
                    disabled={isProcessing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      name="expiryDate"
                      placeholder="MM/YY"
                      value={formData.expiryDate}
                      onChange={handleChange}
                      maxLength={5}
                      disabled={isProcessing}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CVV
                    </label>
                    <input
                      type="text"
                      name="cvv"
                      placeholder="123"
                      value={formData.cvv}
                      onChange={handleChange}
                      maxLength={4}
                      disabled={isProcessing}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    />
                  </div>
                </div>
              </>
            )}

            {selectedMethod === 'upi' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  UPI ID
                </label>
                <input
                  type="text"
                  name="upiId"
                  placeholder="yourname@upi"
                  value={formData.upiId}
                  onChange={handleChange}
                  disabled={isProcessing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                />
                <p className="text-xs text-gray-500 mt-1">Test: testuser@upi</p>
              </div>
            )}

            {selectedMethod === 'net_banking' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Bank
                </label>
                <select
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleChange}
                  disabled={isProcessing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                >
                  <option value="">Choose a bank...</option>
                  <option value="HDFC Bank">HDFC Bank</option>
                  <option value="ICICI Bank">ICICI Bank</option>
                  <option value="SBI">State Bank of India</option>
                  <option value="Axis Bank">Axis Bank</option>
                  <option value="Kotak Bank">Kotak Mahindra Bank</option>
                  <option value="Punjab National Bank">Punjab National Bank</option>
                </select>
              </div>
            )}

            {selectedMethod === 'wallet' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Wallet
                </label>
                <select
                  name="walletProvider"
                  value={formData.walletProvider}
                  onChange={handleChange}
                  disabled={isProcessing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                >
                  <option value="">Choose a wallet...</option>
                  <option value="Google Pay">Google Pay</option>
                  <option value="PhonePe">PhonePe</option>
                  <option value="Paytm">Paytm</option>
                  <option value="Amazon Pay">Amazon Pay</option>
                  <option value="WhatsApp Pay">WhatsApp Pay</option>
                </select>
              </div>
            )}

            {selectedMethod === 'cash_on_delivery' && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800 font-medium mb-2">💚 Cash on Delivery</p>
                <p className="text-sm text-green-700">
                  Pay ₹{amount.toFixed(2)} when your order arrives at your doorstep. No need to enter any payment details!
                </p>
              </div>
            )}

            {user && selectedMethod !== 'cash_on_delivery' && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <label className="flex items-start cursor-pointer">
                  <input
                    type="checkbox"
                    checked={savePaymentMethod}
                    onChange={(e) => setSavePaymentMethod(e.target.checked)}
                    disabled={isProcessing}
                    className="w-4 h-4 text-blue-600 mt-1 cursor-pointer disabled:opacity-50"
                  />
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">Save payment method</p>
                    <p className="text-xs text-gray-600">Save this payment method to your account for faster checkout next time</p>
                  </div>
                </label>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4" />
                  Pay ₹{amount.toFixed(2)}
                </>
              )}
            </button>
          </form>

          {/* Test Card Info */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs font-semibold text-blue-900 mb-2">Test Credentials:</p>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Card: 4532 1488 0343 6467 (any future date, any 3-4 digit CVV)</li>
              <li>• Name: Any name</li>
              <li>• UPI: testuser@upi</li>
              <li>• All Net Banking & Wallet options are available</li>
              <li>• Cash on Delivery: No details required, pay on delivery!</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
