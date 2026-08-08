const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require('multer');
const path = require('path');
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
console.log("Mongo URI:", process.env.MONGODB_URI);

mongoose
  .connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => {
    console.log("✅ Connected to MongoDB");
  })
  .catch((err) => {
    console.log("Error Name:", err.name);
    console.log("Error Message:", err.message);
    console.log("Error Cause:", err.cause);
  });

// User Schema (Regular Users)
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user"], default: "user" },
});

const User = mongoose.model("User", UserSchema);

// Admin Schema
const AdminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "admin" },
});

const Admin = mongoose.model("Admin", AdminSchema);

// Product Schema
const ProductSchema = new mongoose.Schema({
  name: String,
  description: String,
  quantity: Number,
  price: Number,
  supplier: String,
  image: String, // Add this line for image URL storage
  timestamp: { type: Date, default: Date.now },
});

const Product = mongoose.model("Product", ProductSchema);

// Cart Schema
const CartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      quantity: { type: Number, required: true, default: 1 },
    },
  ],
  updatedAt: { type: Date, default: Date.now },
});

const Cart = mongoose.model("Cart", CartSchema);

// Add this near the top of your file with your other schemas

// Order Schema (if not already defined)
const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
    }
  ],
  shippingAddress: {
    fullName: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    phone: { type: String, required: true }
  },
  paymentMethod: { type: String, required: true },
  totalAmount: { type: Number, required: true },
  orderStatus: { type: String, default: "Pending" },
  createdAt: { type: Date, default: Date.now }
});

const Order = mongoose.model("Order", OrderSchema);
// Middleware to verify JWT
const verifyToken = (req, res, next) => {
  const token = req.headers["x-access-token"];
  if (!token) return res.status(403).send("A token is required for authentication");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }
  return next();
};

// Middleware to check admin role
const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).send("Access denied: Admin privileges required");
  }
  next();
};

// Register User
app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: "Username, email, and password are required" });
    }
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: "Email or username already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Failed to register user", details: err.message });
  }
});

// Login User
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ token, user: { id: user._id, username: user.username, role: user.role } });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Failed to login", details: err.message });
  }
});

// Admin Login
app.post("/api/auth/admin-login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    const admin = await Admin.findOne({ email });
    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      return res.status(400).json({ error: "Invalid admin credentials" });
    }
    const token = jwt.sign({ userId: admin._id, role: admin.role }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ token, user: { id: admin._id, username: admin.username, role: admin.role } });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ error: "Failed to login as admin", details: err.message });
  }
});

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: function(req, file, cb) {
    cb(null, 'product-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });
app.use('/uploads', express.static('uploads'));

// Image upload endpoint
app.post('/api/upload', upload.single('image'), (req, res) => {
  try {
    const imageUrl = `https://mithun-electricals.onrender.com/uploads/${req.file.filename}`;
    res.json({ imageUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add Product (Admin Only)
app.post("/api/inventory/add", verifyToken, isAdmin, async (req, res) => {
  try {
    const { name, description, quantity, price, supplier, image } = req.body;
    const newProduct = new Product({ 
      name, 
      description, 
      quantity, 
      price, 
      supplier,
      image 
    });
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get All Products (Public)
app.get("/api/inventory", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Low Stock Products (Public)
app.get("/api/inventory/low-stock", async (req, res) => {
  try {
    const lowStockProducts = await Product.find({ quantity: { $lte: 10 } }); // Assuming low stock is ≤ 10
    res.json(lowStockProducts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Recent Activities (Public)
app.get("/api/inventory/recent-activities", async (req, res) => {
  try {
    const recentActivities = await Product.find()
      .sort({ timestamp: -1 }) // Sort by timestamp descending (most recent first)
      .limit(10) // Limit to 10 recent activities
      .select("name timestamp"); // Select only name and timestamp for simplicity
    const activities = recentActivities.map((product) => ({
      _id: product._id,
      description: `Product "${product.name}" updated/added`,
      timestamp: product.timestamp,
    }));
    res.json(activities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Product (Admin Only)
app.put("/api/inventory/update/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { ...req.body, timestamp: new Date() },
      { new: true }
    );
    res.json(updatedProduct);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Product (Admin Only)
app.delete("/api/inventory/delete/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add to Cart (User Only)
app.post("/api/cart/add", verifyToken, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.userId;

    if (req.user.role === "admin") {
      return res.status(403).json({ error: "Admins cannot add items to cart" });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const itemIndex = cart.items.findIndex((item) => item.productId.toString() === productId);
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity || 1;
    } else {
      cart.items.push({ productId, quantity: quantity || 1 });
    }

    cart.updatedAt = new Date();
    await cart.save();
    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Cart (User Only)
app.get("/api/cart", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const cart = await Cart.findOne({ userId }).populate("items.productId");
    if (!cart) {
      return res.status(200).json({ items: [] });
    }
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get User Profile
app.get('/api/profile', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Profile
app.put('/api/profile/update', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { username, email } = req.body;

    // Check if email or username already exists
    const existingUser = await User.findOne({
      $and: [
        { _id: { $ne: userId } },
        { $or: [{ email }, { username }] }
      ]
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email or username already taken' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { username, email },
      { new: true }
    ).select('-password');

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Change Password
app.put('/api/profile/change-password', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove from Cart (User Only)
app.delete("/api/cart/remove/:productId", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.params;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    cart.items = cart.items.filter((item) => item.productId.toString() !== productId);
    cart.updatedAt = new Date();
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// Add this endpoint
app.get("/api/admin/dashboard/stats", verifyToken, isAdmin, async (req, res) => {
  try {
    const currentDate = new Date();
    const lastMonth = new Date(currentDate.setMonth(currentDate.getMonth() - 1));

    const [
      totalProducts,
      lowStockProducts,
      totalOrders,
      activeUsers,
      totalRevenue,
      recentActivities
    ] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ quantity: { $lte: 10 } }),
      Order.countDocuments(),
      User.countDocuments({ role: 'user' }),
      Order.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: '$totalAmount' }
          }
        }
      ]),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('userId', 'username')
    ]);

    res.json({
      metrics: {
        totalProducts,
        lowStockProducts,
        totalOrders,
        activeUsers,
        totalRevenue: totalRevenue[0]?.total || 0
      },
      recentActivities
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

// Initialize Default Admin
const initializeDefaultAdmin = async () => {
  try {
    const adminExists = await Admin.findOne({ username: "admin2" });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash("mithun", 10);
      const defaultAdmin = new Admin({
        username: "admin2",
        email: "admin@gmail.com",
        password: hashedPassword,
        role: "admin",
      });
      await defaultAdmin.save();
      console.log("Default admin created: admin2/mithun");
    } else {
      console.log("Default admin already exists");
    }
  } catch (err) {
    console.error("Error creating default admin:", err);
  }
};

mongoose.connection.once("open", () => {
  initializeDefaultAdmin();
});

// Admin Dashboard Routes
app.get("/api/admin/dashboard/stats", verifyToken, isAdmin, async (req, res) => {
  try {
    const currentDate = new Date();
    const lastMonth = new Date(currentDate.setMonth(currentDate.getMonth() - 1));

    const [
      totalProducts,
      lowStockProducts,
      totalOrders,
      activeUsers,
      totalRevenue,
      recentActivities
    ] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ quantity: { $lte: 10 } }),
      Order.countDocuments(),
      User.countDocuments({ role: 'user' }),
      Order.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: '$totalAmount' }
          }
        }
      ]),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('userId', 'username')
    ]);

    res.json({
      metrics: {
        totalProducts,
        lowStockProducts,
        totalOrders,
        activeUsers,
        totalRevenue: totalRevenue[0]?.total || 0
      },
      recentActivities
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

// Get Low Stock Products
app.get("/api/admin/inventory/low-stock", verifyToken, isAdmin, async (req, res) => {
  try {
    const lowStockProducts = await Product.find({ quantity: { $lte: 10 } })
      .sort({ quantity: 1 })
      .select('name quantity price supplier');
    res.json(lowStockProducts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Recent Activities
app.get("/api/admin/activities", verifyToken, isAdmin, async (req, res) => {
  try {
    const [recentOrders, recentProducts] = await Promise.all([
      Order.find().sort({ createdAt: -1 }).limit(5),
      Product.find().sort({ timestamp: -1 }).limit(5)
    ]);

    const activities = [
      ...recentOrders.map(order => ({
        id: order._id,
        type: 'order',
        description: `New order placed - ₹${order.totalAmount}`,
        timestamp: order.createdAt
      })),
      ...recentProducts.map(product => ({
        id: product._id,
        type: 'product',
        description: `Product "${product.name}" updated`,
        timestamp: product.timestamp
      }))
    ].sort((a, b) => b.timestamp - a.timestamp)
     .slice(0, 5);

    res.json(activities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Inventory Management Routes
// Add Product (with image upload)
app.post("/api/admin/inventory/add", verifyToken, isAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, description, quantity, price, supplier } = req.body;
    const imageUrl = req.file ? `https://mithun-electricals.onrender.com/uploads/${req.file.filename}` : '';

    const newProduct = new Product({
      name,
      description,
      quantity: Number(quantity),
      price: Number(price),
      supplier,
      image: imageUrl,
    });
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Product (with image)
app.put("/api/admin/inventory/update/:id", verifyToken, isAdmin, upload.single('image'), async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) {
      updateData.image = `https://mithun-electricals.onrender.com/uploads/${req.file.filename}`;
    }
    
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { ...updateData, timestamp: new Date() },
      { new: true }
    );
    res.json(updatedProduct);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Product
app.delete("/api/admin/inventory/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Inventory Stats
app.get("/api/admin/inventory/stats", verifyToken, isAdmin, async (req, res) => {
  try {
    const stats = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalValue: { $sum: { $multiply: ["$price", "$quantity"] } },
          averagePrice: { $avg: "$price" },
          lowStock: {
            $sum: { $cond: [{ $lte: ["$quantity", 10] }, 1, 0] }
          }
        }
      }
    ]);
    res.json(stats[0] || {
      totalProducts: 0,
      totalValue: 0,
      averagePrice: 0,
      lowStock: 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add these routes before the "Start Server" section
// Get Total Sales
app.get("/api/sales/total", verifyToken, isAdmin, async (req, res) => {
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1); // Set to first day of current month
    startOfMonth.setHours(0, 0, 0, 0);

    const result = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" }
        }
      }
    ]);

    res.json({ total: result[0]?.total || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Active Users Count
app.get("/api/users/active", verifyToken, isAdmin, async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activeUsers = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
        }
      },
      {
        $group: {
          _id: "$userId"
        }
      },
      {
        $count: "activeCount"
      }
    ]);

    res.json({ activeCount: activeUsers[0]?.activeCount || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Add this to your Dashboard.jsx fetchDashboardData function
