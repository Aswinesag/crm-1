require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const { Server } = require("socket.io");
const http = require("http");

const connectDB = require("./config/database");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const leadRoutes = require("./routes/leads");
const logRoutes = require("./routes/logs");
const remainderRoutes = require("./routes/reminder");
const reportRoutes = require("./routes/reports");
const ticketRoutes = require("./routes/tickets");
const procurementRoutes = require("./routes/procurement");
const materialRoutes = require("./routes/materialRoutes");
const stockRoutes = require("./routes/stockRoutes");
const alertRoutes = require("./routes/alertRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const warehouseRoutes = require("./routes/warehouseRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const vendorRoutes = require("./routes/vendor/vendorRoutes");
const vendorMaterialRoutes = require("./routes/vendorMaterialRoutes");
//const rfqRoutes = require("./routes/rfqRoutes");
//const purchaseOrderRoutes = require("./routes/purchaseOrderRoutes");
const stockMovementRoutes = require("./routes/stockMovementRoutes");
const inventoryDashboardRoutes = require("./routes/inventoryDashboardRoutes");
const stockIssueRoutes = require("./routes/stockIssue/stockIssueRoutes");
const quotationRoutes = require("./routes/quotationRoutes");

const categoryRoutes = require("./routes/categoryRoutes");
const brandRoutes = require("./routes/brandRoutes");
const productRoutes = require("./routes/productRoutes");
const subCategoryRoutes = require("./routes/subCategoryRoutes");
const unitRoutes = require("./routes/unitRoutes");
const hsnRoutes = require("./routes/hsnRoutes");
const taxRoutes = require("./routes/taxRoutes");
const bundleRoutes = require("./routes/bundleRoutes");

const supplierRoutes = require("./routes/supplierRoutes");
const rawMaterialRoutes = require("./routes/rawMaterialRoutes");
const componentRoutes = require("./routes/componentRoutes");
const stockInRoutes=require("./routes/stockInRoutes");
const stockOutRoutes = require("./routes/stockOutRoutes");
const stockTransferRoutes = require("./routes/stockTransferRoutes");
const stockAuditRoutes = require("./routes/stockAuditRoutes");
const reorderAlertRoutes = require("./routes/reorderAlertRoutes");
const purchaseRequisitionsRoutes = require("./routes/purchaseRequisitionsRoutes");
const requestForQuotationRoutes = require("./routes/requestForQuotationRoutes");
const purchaseOrdersRoutes = require("./routes/purchaseOrdersRoutes");
const goodsReceiptNoteRoutes = require("./routes/goodsReceiptNoteRoutes");
const purchaseBillRoutes = require("./routes/purchaseBillRoutes");
const purchaseReturnRoutes = require("./routes/purchaseReturnRoutes");
const supplierPaymentRoutes = require("./routes/supplierPaymentRoutes");


const path = require("path");

connectDB();

const app = express();
const server = http.createServer(app);

app.use(cors({ origin: process.env.API_URL, credentials: true }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// ✅ ADD THIS (VERY IMPORTANT)

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/logs", logRoutes);
app.use("/api/remainders", remainderRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/procurement", procurementRoutes);
app.use("/api/materials", materialRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/warehouses", warehouseRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/vendor-materials", vendorMaterialRoutes);
//app.use("/api/rfqs", rfqRoutes);
//app.use("/api/purchase-orders", purchaseOrderRoutes);
//app.use("/api/grns", require("./routes/grnRoutes"));
app.use("/api/stock-movements", stockMovementRoutes);
app.use("/api/dashboard", inventoryDashboardRoutes);
app.use("/api/stock-issues", stockIssueRoutes);
app.use("/api/erp-dashboard", require("./routes/dashboard/erpDashboardRoutes"));
app.use("/api/quotations", quotationRoutes);

app.use("/api/categories", categoryRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/products", productRoutes);
app.use("/api/subcategories", subCategoryRoutes);
app.use("/api/units", unitRoutes);
app.use("/api/hsn", hsnRoutes);
app.use("/api/taxes", taxRoutes);
app.use("/api/bundles", bundleRoutes);

app.use("/api/suppliers", supplierRoutes);
app.use("/api/raw-materials", rawMaterialRoutes);
app.use("/api/components", componentRoutes);
app.use("/api/stock-ins",stockInRoutes);
app.use("/api/stock-outs", stockOutRoutes);
app.use("/api/stock-transfers", stockTransferRoutes);
app.use("/api/stock-audits", stockAuditRoutes);
app.use("/api/reorder-alerts", reorderAlertRoutes);
app.use("/api/purchase-requisitions", purchaseRequisitionsRoutes);
app.use("/api/request-for-quotations", requestForQuotationRoutes);
app.use("/api/purchase-orders", purchaseOrdersRoutes);
app.use("/api/grns", goodsReceiptNoteRoutes);
app.use("/api/purchase-bills", purchaseBillRoutes);
app.use("/api/purchase-returns", purchaseReturnRoutes);
app.use("/api/supplier-payments", supplierPaymentRoutes);

// Change this line in server.js
app.use("/api/reports", reportRoutes); // Change from "/api/report" to "/api/reports"
app.get('/api', (req, res) => {
  res.send('Backend API is running, ping data');
});

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

const io = new Server(server, {
  cors: {
    origin: process.env.API_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});
app.set("io", io);

const onlineUsers = new Map();

io.on("connection", (socket) => {  
  const { userId, role } = socket.handshake.auth;

  // Join role-based and personal rooms
  socket.join(`role:${role}`);
  socket.join(`user:${userId}`);

  if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
  onlineUsers.get(userId).add(socket.id);

  console.log("onlineUsers Map:", onlineUsers);

  // Emit this user's online status to admins/super-admins
  io.to("role:Admin")
    .to("role:Super Admin")
    .emit("userOnline", {
      userId,
      role,
      socketCount: onlineUsers.get(userId).size,
    });

  // ✅ Send the full online users list to the newly connected client
  const allOnlineUsers = [];
  onlineUsers.forEach((sockets, uId) => {
    allOnlineUsers.push({
      userId: uId,
      socketCount: sockets.size,
      // You can include role here if needed
    });
  });
  socket.emit("userOnline", allOnlineUsers);

  console.log(`🔌 User connected: ${userId}, Role: ${role}, SocketID: ${socket.id}`);
  console.log("   Joined rooms:", socket.rooms);

  // Disconnect handler
  socket.on("disconnect", () => {
    if (!onlineUsers.has(userId)) return;

    const userSockets = onlineUsers.get(userId);
    userSockets.delete(socket.id);

    const count = userSockets.size;
    if (count === 0) onlineUsers.delete(userId);

    io.to("role:Admin")
      .to("role:Super Admin")
      .emit("userOnline", {
        userId,
        role,
        socketCount: count,
      });

    console.log(`User disconnected: ${userId}, Role: ${role}, SocketID: ${socket.id}`);
  });
});

app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR:", err.message);

  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  if (err.message === "Only JPG/PNG images allowed") {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  res.status(500).json({
    success: false,
    message: err.message || "Server Error",
  });
});

const PORT = process.env.PORT;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
