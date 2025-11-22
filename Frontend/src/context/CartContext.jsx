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

  useEffect(() => {
    if (user) fetchCart();
  }, [user]);

  const fetchCart = async () => {
    try {
      const { data } = await cartAPI.get();
      setCartItems(data.data.items);
    } catch (error) {
      toast.error('Failed to load cart');
    }
  };

  const addToCart = async (product, quantity = 1) => {
    try {
      const { data } = await cartAPI.add({ productId: product._id, quantity });
      setCartItems(data.data.items);
      toast.success('Added to cart');
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      const { data } = await cartAPI.update({ productId, quantity });
      setCartItems(data.data.items);
    } catch (error) {
      toast.error('Failed to update quantity');
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const { data } = await cartAPI.remove(productId);
      setCartItems(data.data.items);
      toast.success('Removed from cart');
    } catch (error) {
      toast.error('Failed to remove from cart');
    }
  };

  const getItemCount = () => cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const getCartTotal = () => cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const getTax = () => (getCartTotal() - discount) * 0.18;

  const getFinalTotal = () => getCartTotal() - discount + getTax();

  const applyDiscount = (amount, code) => {
    setDiscount(amount);
    setCouponCode(code);
  };

  const clearCart = async () => {
    setCartItems([]);
    setDiscount(0);
    setCouponCode('');
    // Optionally clear backend cart
  };

  return (
    <CartContext.Provider value={{
      cartItems,
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
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);