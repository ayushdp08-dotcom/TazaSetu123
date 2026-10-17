import React, { useState } from 'react';
import {
  Boxes,
  Plus,
  Search,
  Filter,
  Download,
  AlertTriangle,
  History,
  ArrowUpDown,
  Edit2,
  Trash2,
  CheckCircle2,
  Package,
  Layers,
  ChevronRight,
  Sparkles,
  ScanLine,
  ShoppingCart,
  Calendar,
  Clock,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Product, ProductBatch } from '../types';
import { BUSINESS_CONFIGS } from '../data/initialData';

export const InventoryPage: React.FC = () => {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    recordStockAdjustment,
    recordStockIn,
    recordDirectSale,
    selectedBusinessType,
    activeProductId,
    setActiveProductId,
    setCurrentRoute,
    transactions
  } = useApp();

  const config = BUSINESS_CONFIGS[selectedBusinessType];

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'stock_asc' | 'stock_desc' | 'price_asc' | 'price_desc' | 'expiry'>('name');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStockInModal, setShowStockInModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [showSaleModal, setShowSaleModal] = useState(false);

  // Inspected & Targeted Products
  const [inspectProduct, setInspectProduct] = useState<Product | null>(() => {
    return products.find((p) => p.id === activeProductId) || null;
  });
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [saleProduct, setSaleProduct] = useState<Product | null>(null);

  // Add Product Form State
  const [newProductName, setNewProductName] = useState('');
  const [newSKU, setNewSKU] = useState('');
  const [newCategory, setNewCategory] = useState(config.categories[0] || 'General');
  const [newUnit, setNewUnit] = useState(config.units[0] || 'pieces');
  const [newCostPrice, setNewCostPrice] = useState<number | ''>(100);
  const [newSellingPrice, setNewSellingPrice] = useState<number | ''>(150);
  const [newReorderLevel, setNewReorderLevel] = useState<number | ''>(15);
  const [newInitialQty, setNewInitialQty] = useState<number | ''>(25);
  const [newSupplierName, setNewSupplierName] = useState('Direct Regional Vendor');
  const [newBatchNumber, setNewBatchNumber] = useState('LOT-NEW-01');
  const [newExpiryDate, setNewExpiryDate] = useState('2026-11-15');
  const [addFormError, setAddFormError] = useState<string | null>(null);

  // Edit Product Form State
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editUnit, setEditUnit] = useState('');
  const [editCostPrice, setEditCostPrice] = useState<number | ''>(0);
  const [editSellingPrice, setEditSellingPrice] = useState<number | ''>(0);
  const [editReorderLevel, setEditReorderLevel] = useState<number | ''>(0);
  const [editCurrentStock, setEditCurrentStock] = useState<number | ''>(0);
  const [editSupplierName, setEditSupplierName] = useState('');
  const [editExpiryDate, setEditExpiryDate] = useState('');
  const [editFormError, setEditFormError] = useState<string | null>(null);

  // Stock In Modal State
  const [stockInQty, setStockInQty] = useState<number | ''>(10);
  const [stockInBatch, setStockInBatch] = useState('LOT-RCV-01');
  const [stockInExpiry, setStockInExpiry] = useState('2026-11-20');

  // Audit Adjustment State
  const [auditDelta, setAuditDelta] = useState<number | ''>(0);
  const [auditReason, setAuditReason] = useState('Physical Count Variance Correction');

  // Direct Sale State
  const [saleQty, setSaleQty] = useState<number | ''>(1);
  const [saleChannel, setSaleChannel] = useState('In-Store POS');
  const [saleFeedback, setSaleFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);
  const [saleSubmitting, setSaleSubmitting] = useState(false);

  // Filtering
  const filteredProducts = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.tags && p.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())));
    const matchCategory = selectedCategory === 'all' || p.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  // Sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'stock_asc') return a.currentStock - b.currentStock;
    if (sortBy === 'stock_desc') return b.currentStock - a.currentStock;
    if (sortBy === 'price_asc') return a.costPrice - b.costPrice;
    if (sortBy === 'price_desc') return b.costPrice - a.costPrice;
    if (sortBy === 'expiry') {
      const expA = a.batches[0]?.expiryDate || a.expiryDate || '9999-99-99';
      const expB = b.batches[0]?.expiryDate || b.expiryDate || '9999-99-99';
      return expA.localeCompare(expB);
    }
    return 0;
  });

  // Expiry check helper
  const now = new Date('2026-10-17').getTime();
  const getProductExpiryStatus = (p: Product) => {
    let earliestExp = p.expiryDate;
    if (p.batches && p.batches.length > 0) {
      const active = p.batches.filter(b => b.quantity > 0);
      if (active.length > 0) {
        active.sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
        earliestExp = active[0].expiryDate;
      }
    }
    if (!earliestExp) return { status: 'safe', label: 'Adequate', days: 99 };
    const diffDays = Math.ceil((new Date(earliestExp).getTime() - now) / 86400000);
    if (diffDays < 0) return { status: 'expired', label: 'Expired', days: diffDays };
    if (diffDays <= 3) return { status: 'expiring_soon', label: `Expires in ${diffDays}d`, days: diffDays };
    return { status: 'safe', label: `${diffDays}d left`, days: diffDays };
  };

  // Add Product Handler with validation
  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    setAddFormError(null);

    if (!newProductName.trim()) {
      setAddFormError('Product name is required.');
      return;
    }
    if (newCostPrice === '' || Number(newCostPrice) < 0) {
      setAddFormError('Purchase cost price must be a non-negative number.');
      return;
    }
    if (newSellingPrice === '' || Number(newSellingPrice) < 0) {
      setAddFormError('Selling price must be a non-negative number.');
      return;
    }
    if (newInitialQty === '' || Number(newInitialQty) < 0) {
      setAddFormError('Initial quantity must be a non-negative number.');
      return;
    }
    if (newReorderLevel === '' || Number(newReorderLevel) < 0) {
      setAddFormError('Minimum stock threshold must be a non-negative number.');
      return;
    }
    if (!newExpiryDate) {
      setAddFormError('Expiry date is mandatory for inventory freshness tracking.');
      return;
    }

    addProduct({
      name: newProductName.trim(),
      sku: newSKU.trim() || `SKU-${Date.now().toString().slice(-4)}`,
      category: newCategory,
      unit: newUnit,
      currentStock: Number(newInitialQty),
      reorderLevel: Number(newReorderLevel),
      targetStock: Number(newReorderLevel) * 3,
      costPrice: Number(newCostPrice),
      sellingPrice: Number(newSellingPrice),
      supplierId: 'sup-1',
      supplierName: newSupplierName.trim() || 'Direct Regional Vendor',
      expiryDate: newExpiryDate,
      leadTimeDays: 2,
      shelfLifeDays: 14,
      storageCondition: 'ambient',
      tags: ['custom-item'],
      historicalDailySales: [5, 6, 4, 7, 8, 9, 7, 6, 8, 7, 9, 8, 6, 7],
      batches: [
        {
          id: `b-${Date.now()}`,
          batchNumber: newBatchNumber.trim() || `LOT-${Date.now().toString().slice(-4)}`,
          quantity: Number(newInitialQty),
          receivedDate: new Date().toISOString().split('T')[0],
          expiryDate: newExpiryDate,
          costPrice: Number(newCostPrice),
          initialQuantity: Number(newInitialQty),
          status: 'active'
        }
      ]
    });

    setShowAddModal(false);
    setNewProductName('');
    setNewSKU('');
    setAddFormError(null);
  };

  // Open Edit Modal
  const openEditModal = (p: Product) => {
    setEditProduct(p);
    setEditName(p.name);
    setEditCategory(p.category);
    setEditUnit(p.unit);
    setEditCostPrice(p.costPrice);
    setEditSellingPrice(p.sellingPrice);
    setEditReorderLevel(p.reorderLevel);
    setEditCurrentStock(p.currentStock);
    setEditSupplierName(p.supplierName || 'Direct Vendor');
    setEditExpiryDate(p.expiryDate || p.batches[0]?.expiryDate || '');
    setEditFormError(null);
    setShowEditModal(true);
  };

  // Save Edit Handler
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProduct) return;
    setEditFormError(null);

    if (!editName.trim()) {
      setEditFormError('Product name cannot be empty.');
      return;
    }
    if (editCostPrice === '' || Number(editCostPrice) < 0) {
      setEditFormError('Purchase cost price cannot be negative.');
      return;
    }
    if (editSellingPrice === '' || Number(editSellingPrice) < 0) {
      setEditFormError('Selling price cannot be negative.');
      return;
    }
    if (editCurrentStock === '' || Number(editCurrentStock) < 0) {
      setEditFormError('Stock quantity cannot be negative.');
      return;
    }
    if (editReorderLevel === '' || Number(editReorderLevel) < 0) {
      setEditFormError('Minimum stock threshold cannot be negative.');
      return;
    }

    const updatedStock = Number(editCurrentStock);
    const updatedCost = Number(editCostPrice);
    const updatedSelling = Number(editSellingPrice);
    const updatedReorder = Number(editReorderLevel);

    updateProduct(editProduct.id, {
      name: editName.trim(),
      category: editCategory,
      unit: editUnit,
      costPrice: updatedCost,
      sellingPrice: updatedSelling,
      reorderLevel: updatedReorder,
      targetStock: updatedReorder * 3,
      currentStock: updatedStock,
      supplierName: editSupplierName.trim(),
      expiryDate: editExpiryDate
    });

    // If inspected product was edited, refresh inspection state
    if (inspectProduct && inspectProduct.id === editProduct.id) {
      setInspectProduct({
        ...inspectProduct,
        name: editName.trim(),
        category: editCategory,
        unit: editUnit,
        costPrice: updatedCost,
        sellingPrice: updatedSelling,
        reorderLevel: updatedReorder,
        currentStock: updatedStock,
        supplierName: editSupplierName.trim(),
        expiryDate: editExpiryDate
      });
    }

    setShowEditModal(false);
    setEditProduct(null);
  };

  // Delete Confirmation Handler
  const handleDeleteConfirm = () => {
    if (!productToDelete) return;
    deleteProduct(productToDelete.id);
    if (inspectProduct && inspectProduct.id === productToDelete.id) {
      setInspectProduct(null);
    }
    setShowDeleteModal(false);
    setProductToDelete(null);
  };

  // Stock In Submit
  const handleStockInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectProduct) return;
    if (stockInQty === '' || Number(stockInQty) <= 0) return;

    recordStockIn(
      inspectProduct.id,
      Number(stockInQty),
      stockInBatch,
      stockInExpiry,
      inspectProduct.costPrice
    );
    setShowStockInModal(false);
    const updated = products.find((p) => p.id === inspectProduct.id);
    if (updated) setInspectProduct(updated);
  };

  // Audit Adjustment Submit
  const handleAuditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectProduct) return;
    if (auditDelta === '') return;

    recordStockAdjustment(inspectProduct.id, Number(auditDelta), auditReason);
    setShowAuditModal(false);
    const updated = products.find((p) => p.id === inspectProduct.id);
    if (updated) setInspectProduct(updated);
  };

  // Open Direct Sale Modal
  const openSaleModal = (p: Product) => {
    setSaleProduct(p);
    setSaleQty(1);
    setSaleFeedback(null);
    setShowSaleModal(true);
  };

  // Handle Direct Sale Submit
  const handleSaleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!saleProduct) return;
    if (saleQty === '' || Number(saleQty) <= 0) {
      setSaleFeedback({ type: 'error', message: 'Quantity sold must be greater than zero.' });
      return;
    }
    if (Number(saleQty) > saleProduct.currentStock) {
      setSaleFeedback({
        type: 'error',
        message: `Insufficient inventory! Available: ${saleProduct.currentStock} ${saleProduct.unit}. Requested: ${saleQty}. Negative stock is prevented.`
      });
      return;
    }

    setSaleSubmitting(true);
    const res = await recordDirectSale(saleProduct.id, Number(saleQty), saleChannel);
    setSaleSubmitting(false);

    if (res.success) {
      setSaleFeedback({ type: 'success', message: res.message });
      // Refresh inspected product if open
      const updated = products.find((p) => p.id === saleProduct.id);
      if (updated) {
        setInspectProduct(updated);
      }
      setTimeout(() => {
        setShowSaleModal(false);
        setSaleProduct(null);
        setSaleFeedback(null);
      }, 1200);
    } else {
      setSaleFeedback({ type: 'error', message: res.message });
    }
  };

  // CSV Export
  const exportCSV = () => {
    const headers = [
      'ID',
      'Name',
      'SKU',
      'Category',
      'Current Stock',
      'Unit',
      'Cost Price (INR)',
      'Selling Price (INR)',
      'Reorder Level',
      'Supplier',
      'Expiry Date'
    ];
    const rows = sortedProducts.map((p) => [
      p.id,
      `"${p.name}"`,
      p.sku,
      `"${p.category}"`,
      p.currentStock,
      p.unit,
      p.costPrice,
      p.sellingPrice,
      p.reorderLevel,
      `"${p.supplierName || ''}"`,
      p.expiryDate || p.batches[0]?.expiryDate || ''
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Taaza Setu_${selectedBusinessType}_Inventory.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight">
            Inventory & Batch Records
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Full inventory lifecycle: CRUD profiles, dynamic sorting, automated low-stock and FEFO alerts, sales deductions, and audits.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setCurrentRoute('scanner')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <ScanLine className="w-3.5 h-3.5 text-emerald-400" />
            <span>Scan Product</span>
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-neutral-50 border border-neutral-200 text-xs font-semibold text-neutral-700 shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-neutral-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => {
              setNewProductName('');
              setNewSKU('');
              setAddFormError(null);
              setShowAddModal(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Filter, Search & Sort Bar */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by product name, SKU, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 text-neutral-900"
            />
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1.5 shrink-0">
            <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="text-xs bg-neutral-50 border border-neutral-200 rounded-xl px-2.5 py-2 font-medium text-neutral-700 focus:bg-white focus:ring-2 focus:ring-emerald-500"
            >
              <option value="name">Sort: Name (A-Z)</option>
              <option value="stock_asc">Sort: Stock (Low to High)</option>
              <option value="stock_desc">Sort: Stock (High to Low)</option>
              <option value="price_asc">Sort: Cost (Low to High)</option>
              <option value="price_desc">Sort: Cost (High to Low)</option>
              <option value="expiry">Sort: Expiry (Earliest First)</option>
            </select>
          </div>
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-neutral-900 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            All ({products.length})
          </button>
          {config.categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-2xs overflow-hidden">
        {sortedProducts.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto mb-3">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-neutral-900">No products found</h3>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
              {searchTerm || selectedCategory !== 'all'
                ? 'Try adjusting your search criteria or clear the active category filter.'
                : 'No products in this category yet. Click "Add New Product" to populate your inventory.'}
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              {(searchTerm || selectedCategory !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold transition-colors"
                >
                  Clear Filters
                </button>
              )}
              <button
                onClick={() => {
                  setNewProductName('');
                  setNewSKU('');
                  setAddFormError(null);
                  setShowAddModal(true);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
              >
                + Add Product
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 text-neutral-500 font-bold uppercase tracking-wider border-b border-neutral-200">
                <tr>
                  <th className="py-3 px-4">Product Name & SKU</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Available Stock</th>
                  <th className="py-3 px-4">Cost / Selling</th>
                  <th className="py-3 px-4">Supplier</th>
                  <th className="py-3 px-4">Stock Status</th>
                  <th className="py-3 px-4">Expiry Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {sortedProducts.map((p) => {
                  const isLow = p.currentStock <= p.reorderLevel;
                  const expStatus = getProductExpiryStatus(p);

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-neutral-50/70 transition-colors cursor-pointer"
                      onClick={() => {
                        setInspectProduct(p);
                        setActiveProductId(p.id);
                      }}
                    >
                      <td className="py-3 px-4">
                        <div className="font-bold text-neutral-900">{p.name}</div>
                        <div className="text-[10px] text-neutral-400 font-mono mt-0.5">{p.sku}</div>
                      </td>
                      <td className="py-3 px-4 text-neutral-600">
                        <span className="px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700 font-medium text-[11px]">
                          {p.category}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-extrabold text-neutral-900 text-sm">{p.currentStock}</span>{' '}
                        <span className="text-neutral-500 font-normal">{p.unit}</span>
                        <div className="text-[10px] text-neutral-400">Min safety: {p.reorderLevel}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-neutral-800">Buy: ₹{p.costPrice}</div>
                        <div className="text-[11px] font-bold text-emerald-700">
                          Sell: {p.sellingPrice > 0 ? `₹${p.sellingPrice}` : 'N/A'}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-neutral-600">
                        <span className="line-clamp-1">{p.supplierName || 'Direct Vendor'}</span>
                      </td>
                      <td className="py-3 px-4">
                        {isLow ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            <span>Low Stock</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Adequate</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {expStatus.status === 'expired' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                            <AlertTriangle className="w-3 h-3 text-red-600" />
                            <span>{expStatus.label}</span>
                          </span>
                        ) : expStatus.status === 'expiring_soon' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>{expStatus.label}</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-neutral-500 font-medium">
                            {expStatus.label}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => openSaleModal(p)}
                            title="Record Direct Sale"
                            className="px-2.5 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
                          >
                            <ShoppingCart className="w-3 h-3" />
                            <span>Sell</span>
                          </button>
                          <button
                            onClick={() => openEditModal(p)}
                            title="Edit Product Details"
                            className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setProductToDelete(p);
                              setShowDeleteModal(true);
                            }}
                            title="Delete Product"
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Product Detail & Batches Inspection Drawer */}
      {inspectProduct && (
        <div className="bg-white rounded-2xl p-6 border border-neutral-200/90 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  {inspectProduct.category}
                </span>
                <span className="text-xs text-neutral-400 font-mono">{inspectProduct.sku}</span>
                <span className="text-xs text-neutral-400">• Supplier: {inspectProduct.supplierName || 'Direct'}</span>
              </div>
              <h2 className="text-xl font-bold text-neutral-900 mt-1">{inspectProduct.name}</h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => openSaleModal(inspectProduct)}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs flex items-center gap-1.5"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Record Sale</span>
              </button>
              <button
                onClick={() => setShowStockInModal(true)}
                className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold shadow-2xs"
              >
                + Receive Batch
              </button>
              <button
                onClick={() => setShowAuditModal(true)}
                className="px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold"
              >
                Audit Adjust
              </button>
              <button
                onClick={() => openEditModal(inspectProduct)}
                className="px-3 py-1.5 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-neutral-700 text-xs font-semibold"
              >
                Edit
              </button>
              <button
                onClick={() => setInspectProduct(null)}
                className="px-2.5 py-1.5 text-xs text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Batches Table for this product */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                Active Batches & Expiry Dates (FEFO Rotation Order)
              </h3>
              <span className="text-xs text-neutral-500 font-medium">
                Total Available: {inspectProduct.currentStock} {inspectProduct.unit}
              </span>
            </div>

            <div className="border border-neutral-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 text-neutral-500 font-semibold border-b border-neutral-200">
                  <tr>
                    <th className="py-2.5 px-3">Batch Number</th>
                    <th className="py-2.5 px-3">Remaining Qty</th>
                    <th className="py-2.5 px-3">Received Date</th>
                    <th className="py-2.5 px-3">Expiry Date</th>
                    <th className="py-2.5 px-3">Storage Location</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {inspectProduct.batches && inspectProduct.batches.length > 0 ? (
                    inspectProduct.batches.map((b) => (
                      <tr key={b.id} className="hover:bg-neutral-50">
                        <td className="py-2.5 px-3 font-mono font-bold text-neutral-900">{b.batchNumber}</td>
                        <td className="py-2.5 px-3 font-extrabold text-neutral-900">
                          {b.quantity} {inspectProduct.unit}
                        </td>
                        <td className="py-2.5 px-3 text-neutral-500">{b.receivedDate}</td>
                        <td className="py-2.5 px-3 font-bold text-red-600">{b.expiryDate}</td>
                        <td className="py-2.5 px-3 text-neutral-600">{b.storageLocation || 'Main Shelf'}</td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            b.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-100 text-neutral-600'
                          }`}>
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-4 text-center text-neutral-400">
                        No active batch records for this product.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Stock History Timeline */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
              Recent Inventory Movement & Audit Trail
            </h3>
            <div className="space-y-2">
              {transactions
                .filter((tx) => tx.productId === inspectProduct.id)
                .slice(0, 4)
                .map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-neutral-900">{tx.reason}</div>
                      <div className="text-[10px] text-neutral-400">{new Date(tx.timestamp).toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                      <span className={`font-bold ${tx.quantityChange >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                        {tx.quantityChange > 0 ? `+${tx.quantityChange}` : tx.quantityChange} {inspectProduct.unit}
                      </span>
                      <div className="text-[10px] text-neutral-500">Balance: {tx.newBalance}</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD PRODUCT */}
      {showAddModal && (
        <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-neutral-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-neutral-900">Add New Inventory Product</h3>
              <button onClick={() => setShowAddModal(false)} className="text-neutral-400 hover:text-neutral-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            {addFormError && (
              <div className="mb-3 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                {addFormError}
              </div>
            )}

            <form onSubmit={handleCreateProduct} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sourdough Loaf or Espresso Beans"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Category *</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl bg-white"
                  >
                    {config.categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Unit of Measure *</label>
                  <select
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl bg-white"
                  >
                    {config.units.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Purchase Price (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={newCostPrice}
                    onChange={(e) => setNewCostPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={newSellingPrice}
                    onChange={(e) => setNewSellingPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Initial Quantity *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newInitialQty}
                    onChange={(e) => setNewInitialQty(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Minimum Stock (Reorder Alert) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newReorderLevel}
                    onChange={(e) => setNewReorderLevel(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Supplier Name</label>
                  <input
                    type="text"
                    value={newSupplierName}
                    onChange={(e) => setNewSupplierName(e.target.value)}
                    placeholder="e.g. Farm Fresh Produce"
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">SKU / Code (Optional)</label>
                  <input
                    type="text"
                    value={newSKU}
                    onChange={(e) => setNewSKU(e.target.value)}
                    placeholder="Auto-generated if empty"
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Initial Batch Code</label>
                  <input
                    type="text"
                    value={newBatchNumber}
                    onChange={(e) => setNewBatchNumber(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Expiry Date *</label>
                  <input
                    type="date"
                    required
                    value={newExpiryDate}
                    onChange={(e) => setNewExpiryDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl"
                >
                  Create Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT PRODUCT */}
      {showEditModal && editProduct && (
        <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-neutral-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base font-bold text-neutral-900">Edit Product</h3>
                <p className="text-xs text-neutral-400">SKU: {editProduct.sku}</p>
              </div>
              <button onClick={() => setShowEditModal(false)} className="text-neutral-400 hover:text-neutral-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            {editFormError && (
              <div className="mb-3 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                {editFormError}
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Category *</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl bg-white"
                  >
                    {config.categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Unit of Measure *</label>
                  <select
                    value={editUnit}
                    onChange={(e) => setEditUnit(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl bg-white"
                  >
                    {config.units.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Cost Price (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={editCostPrice}
                    onChange={(e) => setEditCostPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={editSellingPrice}
                    onChange={(e) => setEditSellingPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Available Quantity *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editCurrentStock}
                    onChange={(e) => setEditCurrentStock(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Minimum Stock (Reorder Alert) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editReorderLevel}
                    onChange={(e) => setEditReorderLevel(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Supplier Name</label>
                  <input
                    type="text"
                    value={editSupplierName}
                    onChange={(e) => setEditSupplierName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={editExpiryDate}
                    onChange={(e) => setEditExpiryDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE PRODUCT CONFIRMATION */}
      {showDeleteModal && productToDelete && (
        <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-neutral-200">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mb-3">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-neutral-900">Delete Product?</h3>
            <p className="text-xs text-neutral-600 mt-1">
              Are you sure you want to delete <strong className="text-neutral-900">{productToDelete.name}</strong>?
              This will remove all associated {productToDelete.batches.length} batch records from inventory and analytics.
            </p>
            <div className="pt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: RECORD DIRECT SALE */}
      {showSaleModal && saleProduct && (
        <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-neutral-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-900">Record Product Sale</h3>
                  <p className="text-xs text-neutral-500">{saleProduct.name}</p>
                </div>
              </div>
              <button onClick={() => setShowSaleModal(false)} className="text-neutral-400 hover:text-neutral-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            {saleFeedback && (
              <div
                className={`mb-3 p-3 rounded-xl text-xs font-medium ${
                  saleFeedback.type === 'error'
                    ? 'bg-red-50 border border-red-200 text-red-700'
                    : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                }`}
              >
                {saleFeedback.message}
              </div>
            )}

            <form onSubmit={handleSaleSubmit} className="space-y-3">
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Available Stock:</span>
                  <span className="font-bold text-neutral-900">{saleProduct.currentStock} {saleProduct.unit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Unit Selling Price:</span>
                  <span className="font-bold text-emerald-700">₹{saleProduct.sellingPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Batch Rotation:</span>
                  <span className="font-medium text-neutral-600">FEFO (First Expired First Out)</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Quantity Sold ({saleProduct.unit}) *
                </label>
                <input
                  type="number"
                  min="1"
                  max={saleProduct.currentStock}
                  required
                  value={saleQty}
                  onChange={(e) => setSaleQty(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl font-bold text-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Sales Channel</label>
                <select
                  value={saleChannel}
                  onChange={(e) => setSaleChannel(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl bg-white"
                >
                  <option value="In-Store POS">In-Store Register / Counter</option>
                  <option value="Online Order">Online Delivery App</option>
                  <option value="Takeaway Counter">Takeaway Pickup</option>
                  <option value="Wholesale Client">B2B Wholesale Order</option>
                </select>
              </div>

              <div className="pt-2 p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 flex items-center justify-between text-xs">
                <span className="text-emerald-900 font-semibold">Total Sale Revenue:</span>
                <span className="font-black text-emerald-800 text-sm">
                  ₹{saleQty === '' ? 0 : Math.round(Number(saleQty) * saleProduct.sellingPrice).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSaleModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saleSubmitting}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors disabled:opacity-50"
                >
                  {saleSubmitting ? 'Recording...' : 'Confirm Sale & Deduct Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: STOCK IN */}
      {showStockInModal && inspectProduct && (
        <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-neutral-200">
            <h3 className="text-base font-bold text-neutral-900 mb-1">Receive Stock: {inspectProduct.name}</h3>
            <p className="text-xs text-neutral-500 mb-4">Add incoming shipment with batch code & expiry date.</p>
            <form onSubmit={handleStockInSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Quantity to Receive ({inspectProduct.unit}) *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={stockInQty}
                  onChange={(e) => setStockInQty(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Batch / Lot Number *</label>
                <input
                  type="text"
                  required
                  value={stockInBatch}
                  onChange={(e) => setStockInBatch(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Batch Expiry Date *</label>
                <input
                  type="date"
                  required
                  value={stockInExpiry}
                  onChange={(e) => setStockInExpiry(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowStockInModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl"
                >
                  Confirm Goods Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PHYSICAL STOCK AUDIT */}
      {showAuditModal && inspectProduct && (
        <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-neutral-200">
            <h3 className="text-base font-bold text-neutral-900 mb-1">Audit Adjustment: {inspectProduct.name}</h3>
            <p className="text-xs text-neutral-500 mb-4">Current record balance: {inspectProduct.currentStock} {inspectProduct.unit}</p>
            <form onSubmit={handleAuditSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Stock Adjustment (+ / - delta) *</label>
                <input
                  type="number"
                  required
                  value={auditDelta}
                  onChange={(e) => setAuditDelta(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. -2 for breakage or +1 for uncounted"
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Audit Reason *</label>
                <input
                  type="text"
                  required
                  value={auditReason}
                  onChange={(e) => setAuditReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAuditModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 rounded-xl"
                >
                  Save Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
