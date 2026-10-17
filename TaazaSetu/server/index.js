import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { GoogleGenAI } from '@google/genai';
import { INITIAL_PRODUCTS, INITIAL_SALES } from './seedData.js';
import { ProductModel, SaleModel } from './models.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const MONGODB_URI = process.env.MONGODB_URI || '';

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// In-Memory Database store for resilient transparent Demo Mode fallback
let memoryProducts = JSON.parse(JSON.stringify(INITIAL_PRODUCTS));
let memorySales = JSON.parse(JSON.stringify(INITIAL_SALES));
let isMongoConnected = false;

// Attempt MongoDB Connection if URI provided
if (MONGODB_URI && MONGODB_URI.trim()) {
  mongoose.connect(MONGODB_URI)
    .then(async () => {
      isMongoConnected = true;
      console.log('✅ Connected to MongoDB persistent database');
      // Seed if collection empty
      const count = await ProductModel.countDocuments();
      if (count === 0) {
        await ProductModel.insertMany(INITIAL_PRODUCTS);
        await SaleModel.insertMany(INITIAL_SALES);
        console.log('🌱 Seeded MongoDB with realistic initial products and sales');
      }
    })
    .catch((err) => {
      console.warn('⚠️ MongoDB connection failed. Running in transparent Demo Mode with in-memory persistence:', err.message);
      isMongoConnected = false;
    });
} else {
  console.log('ℹ️ No MONGODB_URI provided. Running in Demo Mode with high-speed in-memory persistence.');
}

// Helper: Get Products
async function getProducts(businessType) {
  if (isMongoConnected) {
    const filter = businessType ? { businessType } : {};
    return await ProductModel.find(filter).lean();
  }
  if (businessType) {
    return memoryProducts.filter(p => p.businessType === businessType);
  }
  return memoryProducts;
}

// Helper: Get Single Product
async function getProductById(id) {
  if (isMongoConnected) {
    return await ProductModel.findOne({ id }).lean();
  }
  return memoryProducts.find(p => p.id === id) || null;
}

// Helper: Save/Update Product
async function saveProduct(productData) {
  if (isMongoConnected) {
    return await ProductModel.findOneAndUpdate(
      { id: productData.id },
      productData,
      { upsert: true, new: true }
    ).lean();
  }
  const idx = memoryProducts.findIndex(p => p.id === productData.id);
  if (idx >= 0) {
    memoryProducts[idx] = { ...memoryProducts[idx], ...productData };
    return memoryProducts[idx];
  } else {
    memoryProducts.unshift(productData);
    return productData;
  }
}

// Helper: Delete Product
async function deleteProduct(id) {
  if (isMongoConnected) {
    return await ProductModel.findOneAndDelete({ id }).lean();
  }
  const idx = memoryProducts.findIndex(p => p.id === id);
  if (idx >= 0) {
    const deleted = memoryProducts.splice(idx, 1);
    return deleted[0];
  }
  return null;
}

// Helper: Get Sales
async function getSales(businessType) {
  if (isMongoConnected) {
    const filter = businessType ? { businessType } : {};
    return await SaleModel.find(filter).sort({ createdAt: -1 }).lean();
  }
  if (businessType) {
    return memorySales.filter(s => s.businessType === businessType);
  }
  return memorySales;
}

// Helper: Record Sale
async function recordSale(saleData) {
  if (isMongoConnected) {
    const newSale = new SaleModel(saleData);
    return await newSale.save();
  }
  memorySales.unshift(saleData);
  return saleData;
}

// ==========================================
// API ROUTES
// ==========================================

// 1. Health & Server Status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    appName: 'Taaza Setu Engine',
    time: new Date().toISOString(),
    databaseMode: isMongoConnected ? 'mongodb_connected' : 'demo_mode_memory',
    geminiConfigured: !!(GEMINI_API_KEY && GEMINI_API_KEY.trim()),
    version: '1.0.0'
  });
});

// 2. Products List (Filter, Search, Sort)
app.get('/api/products', async (req, res) => {
  try {
    const { businessType, search, category, sort } = req.query;
    let list = await getProducts(businessType);

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.brand && p.brand.toLowerCase().includes(q))
      );
    }

    if (category && category !== 'all') {
      list = list.filter(p => p.category === category);
    }

    if (sort) {
      if (sort === 'name_asc') list.sort((a, b) => a.name.localeCompare(b.name));
      if (sort === 'name_desc') list.sort((a, b) => b.name.localeCompare(a.name));
      if (sort === 'stock_asc') list.sort((a, b) => a.currentStock - b.currentStock);
      if (sort === 'stock_desc') list.sort((a, b) => b.currentStock - a.currentStock);
      if (sort === 'price_asc') list.sort((a, b) => a.sellingPrice - b.sellingPrice);
      if (sort === 'price_desc') list.sort((a, b) => b.sellingPrice - a.sellingPrice);
      if (sort === 'expiry_asc') list.sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
    }

    res.json({
      success: true,
      count: list.length,
      products: list,
      databaseMode: isMongoConnected ? 'mongodb' : 'demo_mode'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Single Product Detail
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Create Product (Validation)
app.post('/api/products', async (req, res) => {
  try {
    const {
      name,
      businessType,
      category,
      unit,
      currentStock,
      reorderLevel,
      costPrice,
      sellingPrice,
      expiryDate,
      supplierName,
      sku
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Product name is required.' });
    }
    if (!businessType || !['grocery', 'cafe', 'restaurant', 'bakery'].includes(businessType)) {
      return res.status(400).json({ success: false, error: 'Valid businessType is required.' });
    }
    if (currentStock === undefined || currentStock < 0) {
      return res.status(400).json({ success: false, error: 'Stock quantity cannot be negative.' });
    }
    if (costPrice === undefined || costPrice < 0) {
      return res.status(400).json({ success: false, error: 'Cost price must be non-negative.' });
    }
    if (sellingPrice === undefined || sellingPrice < 0) {
      return res.status(400).json({ success: false, error: 'Selling price must be non-negative.' });
    }
    if (!expiryDate) {
      return res.status(400).json({ success: false, error: 'Expiry date is required for inventory and safety tracking.' });
    }

    const newId = req.body.id || `${businessType[0]}-${Date.now()}`;
    const generatedSku = sku || `SKU-${Date.now().toString().slice(-6)}`;
    const batchCode = req.body.batchNumber || `LOT-${Date.now().toString().slice(-4)}`;

    const newProduct = {
      id: newId,
      businessType,
      name: name.trim(),
      sku: generatedSku,
      category: category || 'General',
      unit: unit || 'pieces',
      currentStock: Number(currentStock),
      reorderLevel: Number(reorderLevel || 10),
      targetStock: Number(req.body.targetStock || (reorderLevel ? reorderLevel * 3 : 30)),
      costPrice: Number(costPrice),
      sellingPrice: Number(sellingPrice),
      supplierId: req.body.supplierId || 'sup-1',
      supplierName: supplierName || 'Direct Vendor',
      leadTimeDays: Number(req.body.leadTimeDays || 2),
      shelfLifeDays: Number(req.body.shelfLifeDays || 14),
      storageCondition: req.body.storageCondition || 'ambient',
      expiryDate,
      barcode: req.body.barcode,
      brand: req.body.brand || 'Store Brand',
      imageUrl: req.body.imageUrl,
      batches: req.body.batches || [
        {
          id: `b-${Date.now()}`,
          batchNumber: batchCode,
          quantity: Number(currentStock),
          receivedDate: new Date().toISOString().split('T')[0],
          expiryDate,
          costPrice: Number(costPrice),
          initialQuantity: Number(currentStock),
          storageLocation: 'Main Shelf',
          status: 'active'
        }
      ],
      historicalDailySales: [4, 5, 3, 6, 7, 8, 6, 5, 6, 7, 8, 7, 5, 6],
      tags: req.body.tags || ['custom-item']
    };

    const saved = await saveProduct(newProduct);
    res.status(201).json({ success: true, product: saved });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. Update Product
app.put('/api/products/:id', async (req, res) => {
  try {
    const existing = await getProductById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Product not found.' });
    }

    if (req.body.currentStock !== undefined && req.body.currentStock < 0) {
      return res.status(400).json({ success: false, error: 'Stock quantity cannot be negative.' });
    }

    const updated = {
      ...existing,
      ...req.body,
      id: existing.id // preserve ID
    };

    const saved = await saveProduct(updated);
    res.json({ success: true, product: saved });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 6. Delete Product
app.delete('/api/products/:id', async (req, res) => {
  try {
    const deleted = await deleteProduct(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Product not found.' });
    }
    res.json({ success: true, message: 'Product deleted successfully', product: deleted });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 7. Record Sale and Decrement Stock (Prevents negative inventory)
app.post('/api/sales', async (req, res) => {
  try {
    const { productId, quantity, channel, businessType } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, error: 'Product ID is required.' });
    }
    const saleQty = Number(quantity);
    if (!saleQty || saleQty <= 0) {
      return res.status(400).json({ success: false, error: 'Sale quantity must be greater than zero.' });
    }

    const product = await getProductById(productId);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found.' });
    }

    // Prevent negative stock
    if (product.currentStock < saleQty) {
      return res.status(400).json({
        success: false,
        error: `Insufficient stock for ${product.name}. Available: ${product.currentStock} ${product.unit}, Requested: ${saleQty} ${product.unit}. Operation prevented to avoid negative inventory.`
      });
    }

    // Deduct stock using FEFO order across batches
    const updatedStock = Math.round((product.currentStock - saleQty) * 100) / 100;
    let needed = saleQty;
    const sortedBatches = [...(product.batches || [])].sort(
      (a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
    );

    const updatedBatches = sortedBatches.map(b => {
      if (needed <= 0 || b.quantity <= 0) return b;
      if (b.quantity >= needed) {
        const u = { ...b, quantity: Math.round((b.quantity - needed) * 100) / 100 };
        needed = 0;
        return u;
      } else {
        needed -= b.quantity;
        return { ...b, quantity: 0, status: 'depleted' };
      }
    });

    const updatedProduct = {
      ...product,
      currentStock: updatedStock,
      batches: updatedBatches
    };
    await saveProduct(updatedProduct);

    // Record Sale
    const totalAmount = Math.round(saleQty * product.sellingPrice * 100) / 100;
    const costAmount = Math.round(saleQty * product.costPrice * 100) / 100;
    const profit = Math.round((totalAmount - costAmount) * 100) / 100;

    const saleRecord = {
      id: `sale-${Date.now()}`,
      businessType: businessType || product.businessType,
      productId: product.id,
      productName: product.name,
      quantity: saleQty,
      unitPrice: product.sellingPrice,
      totalAmount,
      costAmount,
      profit,
      saleDate: new Date().toISOString(),
      channel: channel || 'counter'
    };

    const savedSale = await recordSale(saleRecord);

    res.status(201).json({
      success: true,
      sale: savedSale,
      updatedProductStock: updatedStock,
      product: updatedProduct
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 8. Sales History
app.get('/api/sales', async (req, res) => {
  try {
    const { businessType } = req.query;
    const sales = await getSales(businessType);
    res.json({ success: true, count: sales.length, sales });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 9. Dynamic Dashboard Metrics (Calculated from actual data)
app.get('/api/dashboard/metrics', async (req, res) => {
  try {
    const { businessType } = req.query;
    const products = await getProducts(businessType);
    const sales = await getSales(businessType);

    const now = new Date('2026-10-17').getTime(); // App current date baseline
    const totalProducts = products.length;
    const totalInventoryValue = products.reduce((acc, p) => acc + (p.currentStock * p.costPrice), 0);
    const lowStockItems = products.filter(p => p.currentStock <= p.reorderLevel);

    let expiringSoonCount = 0;
    let expiredCount = 0;

    products.forEach(p => {
      if (p.batches && p.batches.length > 0) {
        p.batches.forEach(b => {
          if (b.quantity > 0) {
            const exp = new Date(b.expiryDate).getTime();
            const days = Math.ceil((exp - now) / 86400000);
            if (days < 0) expiredCount++;
            else if (days <= 3) expiringSoonCount++;
          }
        });
      } else if (p.expiryDate) {
        const exp = new Date(p.expiryDate).getTime();
        const days = Math.ceil((exp - now) / 86400000);
        if (days < 0) expiredCount++;
        else if (days <= 3) expiringSoonCount++;
      }
    });

    const totalSalesAmount = sales.reduce((acc, s) => acc + (s.totalAmount || 0), 0);
    const totalProfit = sales.reduce((acc, s) => acc + (s.profit || 0), 0);

    res.json({
      success: true,
      businessType: businessType || 'all',
      metrics: {
        totalProducts,
        totalInventoryValue: Math.round(totalInventoryValue),
        lowStockCount: lowStockItems.length,
        expiringSoonCount,
        expiredCount,
        totalSalesAmount: Math.round(totalSalesAmount),
        totalProfit: Math.round(totalProfit),
        totalSalesCount: sales.length
      },
      lowStockProducts: lowStockItems.slice(0, 5).map(p => ({
        id: p.id,
        name: p.name,
        currentStock: p.currentStock,
        reorderLevel: p.reorderLevel,
        unit: p.unit
      })),
      databaseMode: isMongoConnected ? 'mongodb' : 'demo_mode_memory'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 10. AI Demand Forecasting via Google Gemini API (@google/genai SDK)
app.post('/api/ai/forecast', async (req, res) => {
  const { businessType, productId } = req.body;
  const products = await getProducts(businessType);

  // If specific product requested, find it; otherwise pick priority products
  let targetProducts = products;
  if (productId) {
    targetProducts = products.filter(p => p.id === productId);
  }
  targetProducts = targetProducts.slice(0, 6);

  // Check if GEMINI_API_KEY is available
  if (!GEMINI_API_KEY || !GEMINI_API_KEY.trim()) {
    // Graceful demo mode fallback explaining clearly that demo data is used
    return res.json({
      success: true,
      isDemoMode: true,
      notice: 'Demo Mode: GEMINI_API_KEY is not configured in server/.env. Generated transparent mathematical estimates using 14-day historical consumption velocities.',
      forecasts: targetProducts.map(p => {
        const avgDaily = p.historicalDailySales && p.historicalDailySales.length > 0
          ? p.historicalDailySales.reduce((a, b) => a + b, 0) / p.historicalDailySales.length
          : 5;
        const forecast1Day = Math.round(avgDaily * 1.1 * 10) / 10;
        const forecast7Days = Math.round(avgDaily * 7 * 1.15);
        const daysToStockout = avgDaily > 0 ? Math.round((p.currentStock / avgDaily) * 10) / 10 : 99;
        const suggestedRestock = p.currentStock <= p.reorderLevel ? Math.max(0, p.targetStock - p.currentStock) : 0;
        const isOverstocked = p.currentStock > (p.targetStock * 1.5);

        return {
          productId: p.id,
          productName: p.name,
          category: p.category,
          unit: p.unit,
          currentStock: p.currentStock,
          reorderLevel: p.reorderLevel,
          forecast1Day,
          forecast7Days,
          daysToStockout,
          stockoutRisk: daysToStockout <= p.leadTimeDays ? 'high' : daysToStockout <= p.leadTimeDays + 2 ? 'medium' : 'low',
          suggestedRestock,
          overstockWarning: isOverstocked ? `Excess inventory (${p.currentStock} ${p.unit}) exceeds 1.5x target stock.` : null,
          foodWasteRecommendation: daysToStockout < 4 ? `Fast-track batch rotation using First-Expired-First-Out (FEFO) fronting.` : `Optimal storage buffer maintained.`
        };
      })
    });
  }

  // Live Google Gemini API Integration using @google/genai SDK
  try {
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const productSummaries = targetProducts.map(p => ({
      id: p.id,
      name: p.name,
      category: p.category,
      unit: p.unit,
      currentStock: p.currentStock,
      reorderLevel: p.reorderLevel,
      costPrice: p.costPrice,
      sellingPrice: p.sellingPrice,
      expiryDate: p.expiryDate,
      recentSalesAverage: p.historicalDailySales && p.historicalDailySales.length > 0
        ? (p.historicalDailySales.reduce((a, b) => a + b, 0) / p.historicalDailySales.length).toFixed(1)
        : 5
    }));

    const prompt = `
You are the AI inventory intelligence engine for Taaza Setu (Business Type: ${businessType || 'General Retail/Hospitality'}).
Analyze these real products from our database:
${JSON.stringify(productSummaries, null, 2)}

Provide actionable demand estimates, restocking suggestions, overstock warnings, and food waste reduction recommendations.
Return ONLY valid raw JSON with this exact schema (no markdown, no extra explanation text):
{
  "summary": "Short 2-sentence executive summary of stock health",
  "forecasts": [
    {
      "productId": "id from input",
      "productName": "product name",
      "forecast1Day": number,
      "forecast7Days": number,
      "daysToStockout": number,
      "stockoutRisk": "high" | "medium" | "low",
      "suggestedRestock": number,
      "overstockWarning": string or null,
      "foodWasteRecommendation": "Actionable advice to prevent expiry waste"
    }
  ]
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
    });

    const text = response.text || '';
    // Clean potential markdown blocks
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);

    res.json({
      success: true,
      isDemoMode: false,
      aiModel: 'Google Gemini 1.5 Flash (@google/genai)',
      summary: parsed.summary,
      forecasts: parsed.forecasts
    });
  } catch (apiError) {
    console.error('Gemini API Error:', apiError.message);
    // Graceful fallback with clear error message
    res.status(200).json({
      success: true,
      isDemoMode: true,
      apiError: `Gemini API quota/network issue: ${apiError.message}. Fell back to local mathematical forecasting.`,
      forecasts: targetProducts.map(p => {
        const avgDaily = 5;
        return {
          productId: p.id,
          productName: p.name,
          category: p.category,
          unit: p.unit,
          currentStock: p.currentStock,
          reorderLevel: p.reorderLevel,
          forecast1Day: Math.round(avgDaily * 1.1 * 10) / 10,
          forecast7Days: Math.round(avgDaily * 7),
          daysToStockout: Math.round((p.currentStock / avgDaily) * 10) / 10,
          stockoutRisk: p.currentStock <= p.reorderLevel ? 'high' : 'low',
          suggestedRestock: Math.max(0, p.targetStock - p.currentStock),
          overstockWarning: null,
          foodWasteRecommendation: 'Rotate oldest batch forward (FEFO).'
        };
      })
    });
  }
});

// 11. Reset Demo Data
app.post('/api/reset-demo', async (req, res) => {
  try {
    memoryProducts = JSON.parse(JSON.stringify(INITIAL_PRODUCTS));
    memorySales = JSON.parse(JSON.stringify(INITIAL_SALES));
    if (isMongoConnected) {
      await ProductModel.deleteMany({});
      await SaleModel.deleteMany({});
      await ProductModel.insertMany(INITIAL_PRODUCTS);
      await SaleModel.insertMany(INITIAL_SALES);
    }
    res.json({ success: true, message: 'Demo data reset successfully to initial state.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Taaza Setu Express Server running on http://localhost:${PORT}`);
  console.log(`📡 Health Check endpoint: http://localhost:${PORT}/api/health`);
});
