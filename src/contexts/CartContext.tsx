import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, Product } from '../types';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  clearCartSession: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Validation function to ensure cart item structure is correct
const isValidCartItem = (item: any): item is CartItem => {
  return (
    item &&
    typeof item === 'object' &&
    item.product &&
    typeof item.product === 'object' &&
    typeof item.product.id === 'string' &&
    typeof item.product.name === 'string' &&
    typeof item.product.price === 'number' &&
    typeof item.quantity === 'number' &&
    item.quantity > 0
  );
};

// Function to load cart from localStorage safely
const loadCartFromStorage = (): CartItem[] => {
  const CART_STORAGE_KEY = 'cart';
  const CART_VERSION = 1;
  
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    
    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);

    // Handle both old format (array) and new format with version
    let items: any[] = [];
    if (Array.isArray(parsed)) {
      items = parsed;
    } else if (parsed.version === CART_VERSION && Array.isArray(parsed.items)) {
      items = parsed.items;
    } else {
      console.warn('Cart data format mismatch, clearing cart');
      return [];
    }

    // Validate each item
    const validItems = items.filter(isValidCartItem);

    // If some items were invalid, log warning but continue with valid ones
    if (validItems.length < items.length) {
      console.warn(
        `Cart contained ${items.length - validItems.length} invalid items, removed them`
      );
    }

    return validItems;
  } catch (error) {
    console.error('Error loading cart from storage:', error);
    // Return empty cart on error to prevent app crash
    return [];
  }
};

// Function to save cart to localStorage safely
const saveCartToStorage = (items: CartItem[]): void => {
  const CART_STORAGE_KEY = 'cart';
  const CART_VERSION = 1;
  
  try {
    // Save with version for future migrations
    const cartData = {
      version: CART_VERSION,
      items: items,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartData));
  } catch (error) {
    console.error('Error saving cart to storage:', error);
    // Handle quota exceeded error
    if (error instanceof DOMException && error.code === 22) {
      console.error('LocalStorage quota exceeded. Cart may not persist.');
    }
  }
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>(loadCartFromStorage);

  // Persist cart whenever it changes
  useEffect(() => {
    saveCartToStorage(cartItems);
  }, [cartItems]);

  const addToCart = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const clearCartSession = () => {
    // Completely remove cart from storage and state (used on logout)
    setCartItems([]);
    try {
      localStorage.removeItem('cart');
    } catch (error) {
      console.error('Error clearing cart session:', error);
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        clearCartSession,
        getCartTotal,
        getCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
