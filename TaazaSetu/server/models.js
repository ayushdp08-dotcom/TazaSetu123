import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  businessType: { type: String, required: true, enum: ['grocery', 'cafe', 'restaurant', 'bakery'] },
  name: { type: String, required: true },
  sku: { type: String, required: true },
  category: { type: String, required: true },
  unit: { type: String, required: true },
  currentStock: { type: Number, required: true, min: 0 },
  reorderLevel: { type: Number, required: true, min: 0 },
  targetStock: { type: Number, default: 50 },
  costPrice: { type: Number, required: true, min: 0 },
  sellingPrice: { type: Number, required: true, min: 0 },
  supplierId: { type: String, default: 'sup-1' },
  supplierName: { type: String, default: 'Standard Partner' },
  leadTimeDays: { type: Number, default: 2 },
  shelfLifeDays: { type: Number, default: 14 },
  storageCondition: { type: String, default: 'ambient' },
  expiryDate: { type: String, required: true },
  barcode: { type: String },
  brand: { type: String },
  imageUrl: { type: String },
  batches: [{
    id: String,
    batchNumber: String,
    quantity: Number,
    receivedDate: String,
    expiryDate: String,
    costPrice: Number,
    initialQuantity: Number,
    storageLocation: String,
    status: { type: String, default: 'active' }
  }],
  historicalDailySales: { type: [Number], default: [] },
  tags: { type: [String], default: [] }
}, { timestamps: true });

const saleSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  businessType: { type: String, required: true },
  productId: { type: String, required: true },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  costAmount: { type: Number, default: 0 },
  profit: { type: Number, default: 0 },
  saleDate: { type: String, default: () => new Date().toISOString() },
  channel: { type: String, default: 'counter' }
}, { timestamps: true });

export const ProductModel = mongoose.models.Product || mongoose.model('Product', productSchema);
export const SaleModel = mongoose.models.Sale || mongoose.model('Sale', saleSchema);
