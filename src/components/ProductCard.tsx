import { Star, ShoppingCart, Heart } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const { addNotification } = useNotification();

  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart(product);
    addNotification({
      message: `${product.name} added to cart!`,
      type: 'success',
      duration: 2500,
    });
  };

  const handleWishlistToggle = async () => {
    if (!user) {
      addNotification({
        message: 'Please sign in to use wishlist',
        type: 'error',
        duration: 2500,
      });
      return;
    }

    if (inWishlist) {
      await removeFromWishlist(product.id);
      addNotification({
        message: 'Removed from wishlist',
        type: 'success',
        duration: 2000,
      });
    } else {
      await addToWishlist(product);
      addNotification({
        message: 'Added to wishlist!',
        type: 'success',
        duration: 2000,
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 relative">
      <div className="aspect-square overflow-hidden bg-gray-100 relative">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
        <button
          onClick={handleWishlistToggle}
          className={`absolute top-3 right-3 p-2 rounded-full shadow-md transition ${
            inWishlist
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-white hover:bg-gray-100 text-gray-600'
          }`}
          title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            className={`h-5 w-5 ${inWishlist ? 'fill-white' : ''}`}
          />
        </button>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {product.name}
          </h3>
          <div className="flex items-center space-x-1 text-yellow-500">
            <Star className="h-4 w-4 fill-current" />
            <span className="text-sm font-medium">{product.rating}</span>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-3">{product.category}</p>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-green-600">
              ₹{product.price}
            </span>
            <p className="text-xs text-gray-500 mt-1">
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </p>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition disabled:cursor-not-allowed"
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="font-medium">Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}
