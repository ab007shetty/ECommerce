// Frontend/src/context/CartContext.jsx
import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { cartAPI, couponAPI } from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [couponCode, setCouponCode] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Use ref to track if we're validating to prevent multiple simultaneous validations
  const isValidatingRef = useRef(false);

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCartItems([]);
      setDiscount(0);
      setCouponCode('');
    }
  }, [user]);

  // Auto-validate coupon when cart items change
  useEffect(() => {
    const validateCurrentCoupon = async () => {
      // Skip if no user, no coupon, already validating, or cart is empty
      if (!user || !couponCode || isValidatingRef.current || cartItems.length === 0) {
        // If cart is empty but coupon exists, remove it
        if (couponCode && cartItems.length === 0) {
          setDiscount(0);
          setCouponCode('');
          toast.error('Coupon removed - cart is empty', { icon: '⚠️' });
        }
        return;
      }

      isValidatingRef.current = true;

      try {
        // Re-validate the coupon with current cart
        const response = await couponAPI.validate({
          code: couponCode,
          cartTotal: getCartTotal(),
          cartItems: cartItems.map(item => ({
            product: item.product?._id || item.product,
            quantity: item.quantity,
          })),
        });

        if (response.data.success) {
          // Update discount in case cart total changed
          const newDiscount = parseFloat(response.data.data.discountAmount);
          if (newDiscount !== discount) {
            setDiscount(newDiscount);
          }
        }
      } catch (error) {
        // Coupon is no longer valid, remove it
        setDiscount(0);
        setCouponCode('');
        
        // Show a toast notification with the reason
        const message = error.response?.data?.message || 'Coupon removed due to cart changes';
        toast.error(message, {
          duration: 4000,
          icon: '⚠️',
        });
      } finally {
        isValidatingRef.current = false;
      }
    };

    // Debounce validation to avoid too many API calls
    const timeoutId = setTimeout(() => {
      validateCurrentCoupon();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [cartItems, couponCode, user]); // Re-run when cart, coupon, or user changes

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
    setCouponCode('');
    setDiscount(0);
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