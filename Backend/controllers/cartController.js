// Backend/controllers/cartController.js
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

export const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate(
      "items.product"
    );

    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
      await cart.save();
    }

    res.json({ success: true, data: cart });
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const addToCart = async (req, res) => {
  const { productId, quantity } = req.body;

  console.log("Add to cart request:", {
    productId,
    quantity,
    userId: req.user.id,
  });

  if (!productId || !quantity || quantity < 1) {
    return res.status(400).json({
      success: false,
      message: "Product ID and valid quantity required",
    });
  }

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex > -1) {
      const newQuantity = cart.items[itemIndex].quantity + quantity;
      if (newQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} units available in stock`,
        });
      }
      cart.items[itemIndex].quantity = newQuantity;
    } else {
      if (quantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} units available in stock`,
        });
      }
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    await cart.populate("items.product");

    console.log("Cart saved successfully:", cart);

    res.json({ success: true, data: cart });
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateCartItem = async (req, res) => {
  const { productId, quantity } = req.body;

  if (!productId || quantity === undefined) {
    return res.status(400).json({
      success: false,
      message: "Product ID and quantity required",
    });
  }

  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex > -1) {
      if (quantity <= 0) {
        cart.items.splice(itemIndex, 1);
      } else {
        const product = await Product.findById(productId);
        if (!product) {
          return res.status(404).json({
            success: false,
            message: "Product not found",
          });
        }

        if (quantity > product.stock) {
          return res.status(400).json({
            success: false,
            message: `Only ${product.stock} units available in stock`,
          });
        }

        cart.items[itemIndex].quantity = quantity;
      }

      await cart.save();
      await cart.populate("items.product");
      res.json({ success: true, data: cart });
    } else {
      res.status(404).json({
        success: false,
        message: "Item not found in cart",
      });
    }
  } catch (error) {
    console.error("Update cart error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const removeFromCart = async (req, res) => {
  const { productId } = req.params;

  if (!productId) {
    return res.status(400).json({
      success: false,
      message: "Product ID required",
    });
  }

  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const initialLength = cart.items.length;
    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    if (cart.items.length === initialLength) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
      });
    }

    await cart.save();
    await cart.populate("items.product");
    res.json({ success: true, data: cart });
  } catch (error) {
    console.error("Remove from cart error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
