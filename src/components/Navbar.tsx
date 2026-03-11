import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, User, LogOut, Package, Search, Settings } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { getCartCount } = useCart();
  const { clearCartSession } = useCart();
  const { getWishlistCount } = useWishlist();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const cartCount = getCartCount();
  const wishlistCount = getWishlistCount();

  const handleSignOut = async () => {
    clearCartSession();
    await signOut();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Package className="h-8 w-8 text-green-600" />
            <span className="text-xl font-bold text-gray-900">Smart Basket</span>
          </Link>

          <div className="flex items-center space-x-6">
            <Link
              to="/products"
              className="text-gray-700 hover:text-green-600 font-medium transition"
            >
              Products
            </Link>

            <Link
              to="/track"
              className="text-gray-700 hover:text-green-600 font-medium transition"
            >
              Track Order
            </Link>

            {user && (
              <>
                <Link
                  to="/orders"
                  className="text-gray-700 hover:text-green-600 font-medium transition"
                >
                  Orders
                </Link>

                <Link
                  to="/account"
                  className="text-gray-700 hover:text-green-600 font-medium transition"
                >
                  Account
                </Link>
              </>
            )}

            {user && (
              <Link
                to="/wishlist"
                className="relative text-gray-700 hover:text-red-500 transition"
              >
                <Heart className="h-6 w-6" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>
            )}

            <Link
              to="/cart"
              className="relative text-gray-700 hover:text-green-600 transition"
            >
              <ShoppingCart className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-1 text-gray-700 hover:text-green-600 transition"
              >
                <LogOut className="h-5 w-5" />
                <span className="font-medium">Sign Out</span>
              </button>
            ) : (
              <Link
                to="/login"
                className="flex items-center space-x-1 text-gray-700 hover:text-green-600 transition"
              >
                <User className="h-5 w-5" />
                <span className="font-medium">Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
