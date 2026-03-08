import { useState, useEffect } from 'react';
import { Package, Clock, Truck, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Order } from '../types';

const statusConfig = {
  Pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-800', iconColor: 'text-yellow-600' },
  'Out for Delivery': { icon: Truck, color: 'bg-blue-100 text-blue-800', iconColor: 'text-blue-600' },
  Delivered: { icon: CheckCircle, color: 'bg-green-100 text-green-800', iconColor: 'text-green-600' },
};

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOrders();
    } else {
      fetchGuestOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGuestOrders = async () => {
    const guestOrders = localStorage.getItem('guestOrders');
    if (guestOrders) {
      try {
        const orderIds = JSON.parse(guestOrders);
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .in('id', orderIds)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setOrders(data || []);
      } catch (error) {
        console.error('Error fetching guest orders:', error);
      }
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading orders...</div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-24 w-24 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No orders yet</h2>
          <p className="text-gray-600">Your order history will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">My Orders</h1>

        <div className="space-y-4">
          {orders.map((order) => {
            const status = order.status as keyof typeof statusConfig;
            const config = statusConfig[status];
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
                      Placed on {new Date(order.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
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
                      ${order.total_amount.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
