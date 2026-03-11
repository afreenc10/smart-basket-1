import { useState } from 'react';
import { Search, Package, Clock, Truck, CheckCircle, AlertCircle } from 'lucide-react';
import { Order } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const statusConfig = {
  Pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-800', iconColor: 'text-yellow-600' },
  'Out for Delivery': { icon: Truck, color: 'bg-blue-100 text-blue-800', iconColor: 'text-blue-600' },
  Delivered: { icon: CheckCircle, color: 'bg-green-100 text-green-800', iconColor: 'text-green-600' },
  Confirmed: { icon: Package, color: 'bg-purple-100 text-purple-800', iconColor: 'text-purple-600' },
};

export default function OrderTrackingPage() {
  const [searchType, setSearchType] = useState<'orderId' | 'phone'>('orderId');
  const [searchValue, setSearchValue] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');
  const [fieldError, setFieldError] = useState('');

  const validateOrderId = (orderId: string): string | null => {
    if (!orderId.trim()) {
      return 'Order ID is required';
    }
    if (!/^ORD\d+/.test(orderId.trim())) {
      return 'Please enter a valid order ID (e.g., ORD1234567890)';
    }
    return null;
  };

  const validatePhone = (phone: string): string | null => {
    if (!phone.trim()) {
      return 'Phone number is required';
    }
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone.replace(/\D/g, ''))) {
      return 'Please enter a valid 10-digit phone number';
    }
    return null;
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldError('');

    // Validate input
    if (searchType === 'orderId') {
      const error = validateOrderId(searchValue);
      if (error) {
        setFieldError(error);
        return;
      }
    } else {
      const error = validatePhone(searchValue);
      if (error) {
        setFieldError(error);
        return;
      }
    }

    setLoading(true);
    setSearched(true);
    setOrders([]);

    try {
      const endpoint =
        searchType === 'orderId'
          ? `${API_URL}/api/orders/track/${searchValue.trim()}`
          : `${API_URL}/api/orders/search-by-phone`;

      const options: RequestInit = {
        method: searchType === 'phone' ? 'POST' : 'GET',
        headers: { 'Content-Type': 'application/json' },
      };

      if (searchType === 'phone') {
        options.body = JSON.stringify({ phone: searchValue.trim() });
      }

      const res = await fetch(endpoint, options);

      if (!res.ok) {
        if (res.status === 404) {
          setError('No orders found. Please check your search criteria and try again.');
          setOrders([]);
        } else {
          throw new Error('Failed to search orders');
        }
      } else {
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : [data]);
        if ((Array.isArray(data) ? data : [data]).length === 0) {
          setError('No orders found.');
        }
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('An error occurred while searching. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Track Your Order</h1>
          <p className="text-gray-600">
            Enter your order ID or phone number to track your delivery
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <form onSubmit={handleSearch} className="space-y-6">
            {/* Search Type Toggle */}
            <div className="flex gap-4 mb-6">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="searchType"
                  value="orderId"
                  checked={searchType === 'orderId'}
                  onChange={(e) => {
                    setSearchType(e.target.value as 'orderId' | 'phone');
                    setSearchValue('');
                    setFieldError('');
                  }}
                  className="w-4 h-4 text-green-600"
                />
                <span className="ml-2 text-gray-700 font-medium">Search by Order ID</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="searchType"
                  value="phone"
                  checked={searchType === 'phone'}
                  onChange={(e) => {
                    setSearchType(e.target.value as 'orderId' | 'phone');
                    setSearchValue('');
                    setFieldError('');
                  }}
                  className="w-4 h-4 text-green-600"
                />
                <span className="ml-2 text-gray-700 font-medium">Search by Phone Number</span>
              </label>
            </div>

            {/* Search Input */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                {searchType === 'orderId' ? 'Order ID' : 'Phone Number'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="search"
                  value={searchValue}
                  onChange={(e) => {
                    setSearchValue(e.target.value);
                    if (fieldError) setFieldError('');
                  }}
                  placeholder={
                    searchType === 'orderId'
                      ? 'e.g., ORD1234567890'
                      : 'e.g., 9876543210'
                  }
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent pr-12 ${
                    fieldError ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <Search className="absolute right-4 top-3.5 h-5 w-5 text-gray-400" />
              </div>
              {fieldError && (
                <p className="mt-2 text-sm text-red-600">{fieldError}</p>
              )}
            </div>

            {/* Search Button */}
            <button
              type="submit"
              disabled={loading || !searchValue.trim()}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold transition disabled:cursor-not-allowed"
            >
              {loading ? 'Searching...' : 'Track Order'}
            </button>
          </form>
        </div>

        {/* Results Section */}
        {searched && (
          <>
            {error && (
              <div className="bg-red-50 border border-red-300 rounded-lg p-6 mb-8">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            )}

            {orders.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {orders.length === 1 ? '1 Order Found' : `${orders.length} Orders Found`}
                </h2>

                {orders.map((order) => {
                  const status = order.status as keyof typeof statusConfig;
                  const config = statusConfig[status] || statusConfig['Pending'];
                  const StatusIcon = config.icon;

                  return (
                    <div
                      key={order.id}
                      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">
                            Order #{order.order_number}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Placed on{' '}
                            {new Date(order.created_at).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        <div className="mt-3 md:mt-0">
                          <span className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full ${config.color} font-semibold`}>
                            <StatusIcon className={`h-5 w-5 ${config.iconColor}`} />
                            <span>{order.status}</span>
                          </span>
                        </div>
                      </div>

                      <div className="border-t pt-4 grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Delivery Address</h4>
                          <p className="text-gray-600 text-sm">{order.customer_name}</p>
                          <p className="text-gray-600 text-sm">{order.customer_phone}</p>
                          <p className="text-gray-600 text-sm">{order.delivery_address}</p>
                          <p className="text-gray-600 text-sm">Pincode: {order.pincode}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                          <p className="text-3xl font-bold text-green-600">
                            ₹{Number(order.total_amount).toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {order.items && order.items.length > 0 && (
                        <div className="border-t mt-4 pt-4">
                          <h4 className="font-semibold text-gray-900 mb-3">Order Items</h4>
                          <div className="space-y-2">
                            {order.items.map((item: any, idx: number) => (
                              <div key={idx} className="flex justify-between text-gray-600 text-sm">
                                <span>{item.product_name || `Item ${idx + 1}`} x {item.quantity}</span>
                                <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {!error && orders.length === 0 && !loading && (
              <div className="bg-blue-50 border border-blue-300 rounded-lg p-6 text-center">
                <Package className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                <p className="text-blue-700">No orders found for your search.</p>
              </div>
            )}
          </>
        )}

        {/* Initial State */}
        {!searched && (
          <div className="bg-blue-50 border border-blue-300 rounded-lg p-8 text-center">
            <Package className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <p className="text-blue-700 text-lg">
              Enter your order ID or phone number to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
