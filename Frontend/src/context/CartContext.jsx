// Frontend/src/context/CartContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { cartAPI } from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [couponCode, setCouponCode] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCartItems([]);
      setDiscount(0);
      setCouponCode('');
    }
  }, [user]);

  const fetchCart = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data } = await cartAPI.get();
      setCartItems(data.data.items || []);
    } catch (error) {
      console.error('Failed to load cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product, quantity = 1) => {
    if (!user) {
      toast.error('Please login to add items to cart');
      return;
    }

    if (!product || !product._id) {
      toast.error('Invalid product');
      return;
    }

    try {
      console.log('Adding to cart:', { productId: product._id, quantity });
      
      const { data } = await cartAPI.add({ 
        productId: product._id, 
        quantity: parseInt(quantity) 
      });
      
      console.log('Cart response:', data);
      
      setCartItems(data.data.items || []);
      toast.success(`${product.name} added to cart!`);
    } catch (error) {
      console.error('Add to cart error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to add to cart';
      toast.error(errorMessage);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (!user) return;

    try {
      const { data } = await cartAPI.update({ 
        productId, 
        quantity: parseInt(quantity) 
      });
      setCartItems(data.data.items || []);
    } catch (error) {
      console.error('Update quantity error:', error);
      toast.error('Failed to update quantity');
    }
  };

  const removeFromCart = async (productId) => {
    if (!user) return;

    try {
      const { data } = await cartAPI.remove(productId);
      setCartItems(data.data.items || []);
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Remove from cart error:', error);
      toast.error('Failed to remove item');
    }
  };

  const getItemCount = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getCartTotal = () => {
    return cartItems.reduce((sum, item) => {
      const price = item.product?.price || 0;
      return sum + (price * item.quantity);
    }, 0);
  };

  const getTax = () => {
    const taxableAmount = getCartTotal() - discount;
    return Math.round(taxableAmount * 0.18 * 100) / 100;
  };

  const getFinalTotal = () => {
    return Math.round((getCartTotal() - discount + getTax()) * 100) / 100;
  };

  const applyDiscount = (amount, code) => {
    setDiscount(amount);
    setCouponCode(code);
  };

  const clearCart = () => {
    setCartItems([]);
    setDiscount(0);
    setCouponCode('');
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      loading,
      addToCart,
      updateQuantity,
      removeFromCart,
      getItemCount,
      getCartTotal,
      getTax,
      discount,
      couponCode,
      applyDiscount,
      getFinalTotal,
      clearCart,
      fetchCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};