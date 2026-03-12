import { Link } from 'react-router-dom';
import { Apple, Milk, Coffee, Cookie, Salad } from 'lucide-react';

const categories = [
  { name: 'Fruits', icon: Apple, color: 'bg-red-100 text-red-600' },
  { name: 'Vegetables', icon: Salad, color: 'bg-green-100 text-green-600' },
  { name: 'Dairy', icon: Milk, color: 'bg-blue-100 text-blue-600' },
  { name: 'Snacks', icon: Cookie, color: 'bg-yellow-100 text-yellow-600' },
  { name: 'Beverages', icon: Coffee, color: 'bg-purple-100 text-purple-600' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-5xl font-bold mb-6">
                Fresh Groceries Delivered to Your Doorstep
              </h1>
              <p className="text-xl mb-8 text-green-50">
                Shop from our wide selection of fresh fruits, vegetables, dairy products, and more
              </p>
              <Link
                to="/products"
                className="inline-block bg-white text-green-600 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-green-50 transition"
              >
                Start Shopping
              </Link>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Shop by Category
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.name}
                to={`/products?category=${category.name}`}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-8 flex flex-col items-center justify-center space-y-4"
              >
                <div className={`${category.color} p-4 rounded-full`}>
                  <Icon className="h-8 w-8" />
                </div>
                <span className="font-semibold text-gray-900">{category.name}</span>
              </Link>
            );
          })}
        </div>
      </section>

        <section className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-green-600 mb-2">1000+</div>
                <p className="text-gray-600">Products Available</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-green-600 mb-2">24/7</div>
                <p className="text-gray-600">Customer Support</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-green-600 mb-2">Fast</div>
                <p className="text-gray-600">Same-Day Delivery</p>
              </div>
            </div>
          </div>
        </section>
    </div>
  );
}
