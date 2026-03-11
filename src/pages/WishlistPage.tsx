import { Heart, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

export default function WishlistPage() {
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4 text-center">
          <Heart className="h-16 w-16 text-red-500 mx-auto mb-4 opacity-50" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign in to view wishlist</h2>
          <p className="text-gray-600 mb-6">
            You need to be logged in to save items to your wishlist.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition mb-3"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/products')}
            className="w-full border border-gray-300 hover:border-gray-400 text-gray-900 font-semibold py-3 rounded-lg transition"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4 text-center">
          <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your wishlist is empty</h2>
          <p className="text-gray-600 mb-6">
            Start adding items to your wishlist by clicking the heart icon on products.
          </p>
          <button
            onClick={() => navigate('/products')}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
          >
            <ShoppingCart className="h-5 w-5" />
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  const handleAddToCart = (product: any) => {
    addToCart(product);
    addNotification({
      message: `${product.name} added to cart!`,
      type: 'success',
      duration: 2500,
    });
  };

  const handleRemove = async (productId: string) => {
    await removeFromWishlist(productId);
    addNotification({
      message: 'Item removed from wishlist',
      type: 'success',
      duration: 2000,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Heart className="h-8 w-8 text-red-500 fill-red-500" />
            My Wishlist
          </h1>
          <p className="text-gray-600 mt-2">{wishlistItems.length} item(s) saved</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="aspect-square overflow-hidden bg-gray-100 relative">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                <button
                  onClick={() => handleRemove(product.id)}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-md transition"
                >
                  <Heart className="h-5 w-5 fill-white" />
                </button>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-2">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-600 mb-3">{product.category}</p>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-2xl font-bold text-green-600">
                      ₹{product.price}
                    </span>
                  </div>
                  <div className="text-yellow-500 text-sm font-medium">
                    ⭐ {product.rating}
                  </div>
                </div>
                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={product.stock === 0}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Add to Cart
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
