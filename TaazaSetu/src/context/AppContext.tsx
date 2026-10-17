import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  BusinessType,
  BusinessProfile,
  Product,
  ProductBatch,
  Recipe,
  Supplier,
  PurchaseOrder,
  WasteRecord,
  StockTransaction,
  InAppNotification,
  FreshnessRecommendation,
  SmartReorderItem,
  DemandForecastItem,
  ScannedProduct
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_RECIPES,
  INITIAL_SUPPLIERS,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_WASTE_RECORDS,
  BUSINESS_CONFIGS
} from '../data/initialData';
import {
  calculateDemandForecast,
  calculateSmartReorder,
  generateFreshnessRecommendations
} from '../utils/inventoryAlgorithms';
import { apiService } from '../utils/apiService';

interface AppContextType {
  // Navigation & View
  currentRoute: string;
  setCurrentRoute: (route: string) => void;
  selectedBusinessType: BusinessType;
  setSelectedBusinessType: (type: BusinessType) => void;

  // Auth & Profile
  profile: BusinessProfile | null;
  isAuthenticated: boolean;
  loginWithPhone: (phone: string, type: BusinessType) => void;
  verifyOtp: (otp: string) => boolean;
  completeOnboarding: (data: Partial<BusinessProfile>) => void;
  logout: () => void;
  demoModeNotice: boolean;

  // Active Scoped Data
  products: Product[];
  recipes: Recipe[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  wasteRecords: WasteRecord[];
  transactions: StockTransaction[];
  notifications: InAppNotification[];

  // Scanned Barcode Inventory
  scannedProducts: ScannedProduct[];
  saveScannedProduct: (data: Omit<ScannedProduct, 'id' | 'businessType' | 'scanDate'>) => ScannedProduct;
  updateScannedProduct: (id: string, updates: Partial<ScannedProduct>) => void;
  deleteScannedProduct: (id: string) => void;

  // CRUD & Interactive Inventory Actions
  addProduct: (product: Omit<Product, 'id' | 'businessType'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  serverOnline: boolean;
  refreshBackendData: () => Promise<void>;
  recordStockAdjustment: (productId: string, adjustmentQty: number, reason: string) => void;
  recordStockIn: (productId: string, qty: number, batchNumber: string, expiryDate: string, cost: number) => void;
  recordDirectSale: (productId: string, quantity: number, channel?: string) => Promise<{ success: boolean; message: string }>;
  sellMenuItem: (recipeId: string, quantitySold: number) => { success: boolean; message: string };
  recordFoodWaste: (productId: string, batchId: string, qty: number, reason: WasteRecord['reason']) => void;

  // Purchase Order Workflow
  createPurchaseOrder: (po: Omit<PurchaseOrder, 'id' | 'businessType' | 'orderNumber'>) => void;
  markPurchaseOrderReceived: (poId: string) => void;

  // Algorithmic & AI Getters
  getForecasts: () => DemandForecastItem[];
  getReorderRecommendations: () => SmartReorderItem[];
  getFreshnessRecommendations: () => FreshnessRecommendation[];
  applyFreshnessAction: (recId: string) => void;

  // Notifications
  markNotificationAsRead: (id: string) => void;
  unreadNotificationCount: number;

  // Active product inspection
  activeProductId: string | null;
  setActiveProductId: (id: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'taazasetu_ai_state_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRoute, setCurrentRoute] = useState<string>('welcome');
  const [selectedBusinessType, setSelectedBusinessType] = useState<BusinessType>('grocery');
  const [activeProductId, setActiveProductId] = useState<string | null>(null);

  const [profile, setProfile] = useState<BusinessProfile | null>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_profile`);
    return saved ? JSON.parse(saved) : null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem(`${LOCAL_STORAGE_KEY}_auth`) === 'true';
  });

  // Master collections
  const [allProducts, setAllProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_products`);
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [allRecipes, setAllRecipes] = useState<Recipe[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_recipes`);
    return saved ? JSON.parse(saved) : INITIAL_RECIPES;
  });

  const [allSuppliers, setAllSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_suppliers`);
    return saved ? JSON.parse(saved) : INITIAL_SUPPLIERS;
  });

  const [allPurchaseOrders, setAllPurchaseOrders] = useState<PurchaseOrder[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_po`);
    return saved ? JSON.parse(saved) : INITIAL_PURCHASE_ORDERS;
  });

  const [allWasteRecords, setAllWasteRecords] = useState<WasteRecord[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_waste`);
    return saved ? JSON.parse(saved) : INITIAL_WASTE_RECORDS;
  });

  const [transactions, setTransactions] = useState<StockTransaction[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_tx`);
    return saved ? JSON.parse(saved) : [];
  });

  const [allScannedProducts, setAllScannedProducts] = useState<ScannedProduct[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_scanned`);
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'scan-seed-1',
        businessType: 'grocery',
        barcode: '8901262010053',
        name: 'Amul Taaza Homogenised Toned Milk',
        brand: 'Amul',
        category: 'Dairy & Eggs',
        sizeOrQuantity: '1 Litre',
        unit: 'litres',
        quantity: 12,
        imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80',
        expiryDate: '2026-10-19',
        scanDate: '2026-10-16',
        notes: 'Cold storage bay 2; scanned from crate',
        costPrice: 56,
        sellingPrice: 72,
        batchNumber: 'SCAN-AML-892',
        source: 'database_match'
      },
      {
        id: 'scan-seed-2',
        businessType: 'grocery',
        barcode: '8901063141122',
        name: 'Britannia 100% Whole Wheat Bread',
        brand: 'Britannia',
        category: 'Bakery & Bread',
        sizeOrQuantity: '400g',
        unit: 'packets',
        quantity: 8,
        imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80',
        expiryDate: '2026-10-18',
        scanDate: '2026-10-15',
        notes: 'Front bakery shelf placement',
        costPrice: 38,
        sellingPrice: 55,
        batchNumber: 'SCAN-BRD-401',
        source: 'database_match'
      },
      {
        id: 'scan-seed-3',
        businessType: 'cafe',
        barcode: '8901262010992',
        name: 'Barista Whole Full Cream Milk',
        brand: 'Metro Barista Select',
        category: 'Milk & Dairy',
        sizeOrQuantity: '1 Litre',
        unit: 'litres',
        quantity: 20,
        imageUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=400&q=80',
        expiryDate: '2026-10-20',
        scanDate: '2026-10-16',
        notes: 'Dedicated for espresso steam bar',
        costPrice: 62,
        sellingPrice: 85,
        batchNumber: 'SCAN-CAF-MLK01',
        source: 'database_match'
      }
    ];
  });

  const [notifications, setNotifications] = useState<InAppNotification[]>([
    {
      id: 'notif-1',
      title: 'Batch Expiring in 24 Hours',
      message: 'Amul Taaza Milk Batch LOT-AML-892 expires tomorrow. FEFO front-facing advised.',
      type: 'expiry',
      severity: 'critical',
      timestamp: '10 mins ago',
      read: false,
      linkRoute: 'freshness'
    },
    {
      id: 'notif-2',
      title: 'Low Stock Alert Triggered',
      message: 'Italian Mozzarella Block (9 kg left) has reached safety reorder limit.',
      type: 'low_stock',
      severity: 'warning',
      timestamp: '45 mins ago',
      read: false,
      linkRoute: 'reorders'
    },
    {
      id: 'notif-3',
      title: 'Weekend Surge Predicted',
      message: 'AI Forecast anticipates a +28% spike for Hot Specialty Coffee drinks this Saturday.',
      type: 'forecast',
      severity: 'info',
      timestamp: '2 hours ago',
      read: false,
      linkRoute: 'forecast'
    }
  ]);

  const [serverOnline, setServerOnline] = useState<boolean>(false);

  // Sync with Backend Server on mount or businessType change
  const refreshBackendData = async () => {
    try {
      const health = await apiService.checkHealth();
      if (health && health.status === 'online') {
        setServerOnline(true);
        const data = await apiService.getProducts();
        if (data && data.success && Array.isArray(data.products) && data.products.length > 0) {
          setAllProducts(data.products);
        }
      } else {
        setServerOnline(false);
      }
    } catch {
      setServerOnline(false);
    }
  };

  useEffect(() => {
    refreshBackendData();
  }, [selectedBusinessType]);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_products`, JSON.stringify(allProducts));
  }, [allProducts]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_recipes`, JSON.stringify(allRecipes));
  }, [allRecipes]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_po`, JSON.stringify(allPurchaseOrders));
  }, [allPurchaseOrders]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_waste`, JSON.stringify(allWasteRecords));
  }, [allWasteRecords]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_tx`, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_scanned`, JSON.stringify(allScannedProducts));
  }, [allScannedProducts]);

  useEffect(() => {
    if (profile) {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_profile`, JSON.stringify(profile));
    }
  }, [profile]);

  // Scoped views for the current active business type
  const products = allProducts.filter((p) => p.businessType === selectedBusinessType);
  const recipes = allRecipes.filter((r) => r.businessType === selectedBusinessType);
  const suppliers = allSuppliers.filter((s) => s.businessType === selectedBusinessType || s.businessType === 'grocery');
  const purchaseOrders = allPurchaseOrders.filter((po) => po.businessType === selectedBusinessType);
  const wasteRecords = allWasteRecords.filter((w) => w.businessType === selectedBusinessType);
  const scannedProducts = allScannedProducts.filter((sp) => sp.businessType === selectedBusinessType);

  // Authentication Handlers
  const loginWithPhone = (phone: string, type: BusinessType) => {
    setSelectedBusinessType(type);
    // Temporary staged profile
    const defaultNames: Record<BusinessType, string> = {
      grocery: 'Taaza Mart Supermarket',
      cafe: 'Artisan Roast & Brew',
      restaurant: 'Trattoria & Bistro 24',
      bakery: 'Golden Crust Artisan Bakery'
    };

    setProfile({
      id: `biz-${type}-${Date.now()}`,
      businessType: type,
      businessName: defaultNames[type],
      ownerName: 'Store Operator',
      phone,
      location: 'Bandra West, Mumbai',
      timezone: 'IST (UTC+5:30)',
      currency: 'INR (₹)',
      defaultUnit: BUSINESS_CONFIGS[type].units[0],
      isDemoSession: true
    });
  };

  const verifyOtp = (otp: string): boolean => {
    // Simulated realistic OTP validation (accept '123456' or any 6 digit test code)
    if (otp.length === 6) {
      setIsAuthenticated(true);
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_auth`, 'true');
      return true;
    }
    return false;
  };

  const completeOnboarding = (data: Partial<BusinessProfile>) => {
    if (profile) {
      setProfile({ ...profile, ...data });
    }
    setCurrentRoute('dashboard');
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_auth`);
    setCurrentRoute('welcome');
  };

  // Scanned Barcode Product Handlers
  const saveScannedProduct = (data: Omit<ScannedProduct, 'id' | 'businessType' | 'scanDate'>): ScannedProduct => {
    const scanDate = new Date().toISOString().split('T')[0];
    const newScanned: ScannedProduct = {
      ...data,
      id: `scan-${Date.now()}`,
      businessType: selectedBusinessType,
      scanDate
    };

    setAllScannedProducts((prev) => [newScanned, ...prev]);

    // Also link into master products catalog so stock, FEFO batch expiry and forecasts auto-update!
    const existingProduct = allProducts.find(
      (p) => p.businessType === selectedBusinessType && (p.barcode === data.barcode || p.name.toLowerCase() === data.name.toLowerCase())
    );

    const batchCode = data.batchNumber || `SCAN-${data.barcode.slice(-4)}-${Date.now().toString().slice(-4)}`;

    if (existingProduct) {
      // Append new batch to existing product
      const newBatch: ProductBatch = {
        id: `b-scan-${Date.now()}`,
        batchNumber: batchCode,
        quantity: data.quantity,
        receivedDate: scanDate,
        expiryDate: data.expiryDate,
        costPrice: data.costPrice || existingProduct.costPrice,
        initialQuantity: data.quantity,
        storageLocation: data.notes || 'Front Shelf',
        status: 'active'
      };

      setAllProducts((prev) =>
        prev.map((p) => {
          if (p.id !== existingProduct.id) return p;
          return {
            ...p,
            currentStock: p.currentStock + data.quantity,
            barcode: p.barcode || data.barcode,
            brand: p.brand || data.brand,
            imageUrl: p.imageUrl || data.imageUrl,
            batches: [...p.batches, newBatch]
          };
        })
      );

      const tx: StockTransaction = {
        id: `tx-scan-${Date.now()}`,
        businessType: selectedBusinessType,
        productId: existingProduct.id,
        productName: existingProduct.name,
        type: 'stock_in',
        quantityChange: data.quantity,
        newBalance: existingProduct.currentStock + data.quantity,
        timestamp: new Date().toISOString(),
        reason: `Barcode Scan Goods Receipt (${data.barcode})`,
        costImpact: data.quantity * (data.costPrice || existingProduct.costPrice)
      };
      setTransactions((prev) => [tx, ...prev]);
    } else {
      // Create fresh product in inventory
      const newProductId = `${selectedBusinessType[0]}-scan-${Date.now()}`;
      const newBatch: ProductBatch = {
        id: `b-scan-${Date.now()}`,
        batchNumber: batchCode,
        quantity: data.quantity,
        receivedDate: scanDate,
        expiryDate: data.expiryDate,
        costPrice: data.costPrice || 50,
        initialQuantity: data.quantity,
        storageLocation: data.notes || 'Main Inventory Shelf',
        status: 'active'
      };

      const newProduct: Product = {
        id: newProductId,
        businessType: selectedBusinessType,
        name: data.name,
        sku: `BC-${data.barcode.slice(-6)}`,
        category: data.category,
        unit: data.unit,
        currentStock: data.quantity,
        reorderLevel: 10,
        targetStock: 30,
        costPrice: data.costPrice || 50,
        sellingPrice: data.sellingPrice || 75,
        supplierId: 'sup-1',
        supplierName: 'Scanned Direct Vendor',
        leadTimeDays: 2,
        shelfLifeDays: 14,
        storageCondition: 'ambient',
        barcode: data.barcode,
        brand: data.brand,
        imageUrl: data.imageUrl,
        tags: ['barcode-scanned', data.brand.toLowerCase()],
        historicalDailySales: [4, 5, 3, 6, 7, 8, 6, 5, 6, 7, 8, 7, 5, 6],
        batches: [newBatch]
      };

      setAllProducts((prev) => [newProduct, ...prev]);

      const tx: StockTransaction = {
        id: `tx-scan-${Date.now()}`,
        businessType: selectedBusinessType,
        productId: newProductId,
        productName: data.name,
        type: 'stock_in',
        quantityChange: data.quantity,
        newBalance: data.quantity,
        timestamp: new Date().toISOString(),
        reason: `New Barcode Product Scanned (${data.barcode})`,
        costImpact: data.quantity * (data.costPrice || 50)
      };
      setTransactions((prev) => [tx, ...prev]);
    }

    // Add alert notification
    setNotifications((prev) => [
      {
        id: `notif-scan-${Date.now()}`,
        title: 'New Barcode Product Recorded',
        message: `${data.name} (${data.quantity} ${data.unit}) registered with expiry on ${data.expiryDate}.`,
        type: 'reorder',
        severity: 'success',
        timestamp: 'Just now',
        read: false,
        linkRoute: 'scanned_items'
      },
      ...prev
    ]);

    return newScanned;
  };

  const updateScannedProduct = (id: string, updates: Partial<ScannedProduct>) => {
    setAllScannedProducts((prev) =>
      prev.map((sp) => (sp.id === id ? { ...sp, ...updates } : sp))
    );
  };

  const deleteScannedProduct = (id: string) => {
    setAllScannedProducts((prev) => prev.filter((sp) => sp.id !== id));
  };

  // CRUD Product
  const addProduct = (newProdData: Omit<Product, 'id' | 'businessType'>) => {
    const newProduct: Product = {
      ...newProdData,
      id: `${selectedBusinessType[0]}-${Date.now()}`,
      businessType: selectedBusinessType
    };
    setAllProducts((prev) => [newProduct, ...prev]);

    // Async sync with backend
    if (serverOnline) {
      apiService.createProduct(newProduct).catch(err => console.warn('Backend sync failed:', err));
    }

    // Record stock in transaction if initial batches exist
    const totalInitial = newProduct.batches.reduce((sum, b) => sum + b.quantity, 0);
    if (totalInitial > 0) {
      const tx: StockTransaction = {
        id: `tx-${Date.now()}`,
        businessType: selectedBusinessType,
        productId: newProduct.id,
        productName: newProduct.name,
        type: 'stock_in',
        quantityChange: totalInitial,
        newBalance: totalInitial,
        timestamp: new Date().toISOString(),
        reason: 'Initial Opening Inventory Onboarding'
      };
      setTransactions((prev) => [tx, ...prev]);
    }
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setAllProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
    if (serverOnline) {
      apiService.updateProduct(id, updates).catch(err => console.warn('Backend sync failed:', err));
    }
  };

  const deleteProduct = (id: string) => {
    setAllProducts((prev) => prev.filter((p) => p.id !== id));
    if (serverOnline) {
      apiService.deleteProduct(id).catch(err => console.warn('Backend delete failed:', err));
    }
  };

  // Physical Audit / Stock Adjustment
  const recordStockAdjustment = (productId: string, adjustmentQty: number, reason: string) => {
    setAllProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        const newBalance = Math.max(0, p.currentStock + adjustmentQty);
        return { ...p, currentStock: newBalance };
      })
    );

    const targetProduct = allProducts.find((p) => p.id === productId);
    if (targetProduct) {
      const tx: StockTransaction = {
        id: `tx-${Date.now()}`,
        businessType: selectedBusinessType,
        productId,
        productName: targetProduct.name,
        type: 'adjustment',
        quantityChange: adjustmentQty,
        newBalance: Math.max(0, targetProduct.currentStock + adjustmentQty),
        timestamp: new Date().toISOString(),
        reason
      };
      setTransactions((prev) => [tx, ...prev]);
    }
  };

  // Stock-In Goods Arrival
  const recordStockIn = (
    productId: string,
    qty: number,
    batchNumber: string,
    expiryDate: string,
    cost: number
  ) => {
    setAllProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        const newBatch = {
          id: `b-${Date.now()}`,
          batchNumber,
          quantity: qty,
          receivedDate: new Date().toISOString().split('T')[0],
          expiryDate,
          costPrice: cost,
          initialQuantity: qty,
          status: 'active' as const
        };
        return {
          ...p,
          currentStock: p.currentStock + qty,
          batches: [...p.batches, newBatch]
        };
      })
    );

    const targetProduct = allProducts.find((p) => p.id === productId);
    if (targetProduct) {
      const tx: StockTransaction = {
        id: `tx-${Date.now()}`,
        businessType: selectedBusinessType,
        productId,
        productName: targetProduct.name,
        type: 'stock_in',
        quantityChange: qty,
        newBalance: targetProduct.currentStock + qty,
        timestamp: new Date().toISOString(),
        reason: `Goods receipt batch ${batchNumber}`,
        costImpact: qty * cost
      };
      setTransactions((prev) => [tx, ...prev]);
    }
  };

  // Direct Product Sale (Automatically decrements stock via FEFO and syncs to backend)
  const recordDirectSale = async (
    productId: string,
    quantity: number,
    channel: string = 'Direct In-Store POS'
  ): Promise<{ success: boolean; message: string }> => {
    if (quantity <= 0) {
      return { success: false, message: 'Sale quantity must be greater than zero.' };
    }

    const prod = allProducts.find((p) => p.id === productId);
    if (!prod) {
      return { success: false, message: 'Product not found.' };
    }

    if (prod.currentStock < quantity) {
      return {
        success: false,
        message: `Insufficient stock for "${prod.name}". Available: ${prod.currentStock} ${prod.unit}, requested: ${quantity}. Negative inventory is strictly prevented.`
      };
    }

    // Backend sync if server is online
    if (serverOnline) {
      try {
        const backendRes = await apiService.recordSale({
          productId,
          quantity,
          channel,
          businessType: selectedBusinessType
        });
        if (!backendRes.success) {
          return { success: false, message: backendRes.error || 'Backend failed to record sale.' };
        }
      } catch (err: any) {
        console.warn('Backend sale sync error, proceeding with local update:', err);
      }
    }

    // Deduct locally via FEFO
    let needed = quantity;
    const newStock = Math.max(0, prod.currentStock - quantity);

    const sortedBatches = [...prod.batches].sort(
      (a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
    );

    const updatedBatches = sortedBatches.map((b) => {
      if (needed <= 0 || b.quantity <= 0) return b;
      if (b.quantity >= needed) {
        const updated = { ...b, quantity: Math.round((b.quantity - needed) * 100) / 100 };
        needed = 0;
        return updated;
      } else {
        needed -= b.quantity;
        return { ...b, quantity: 0, status: 'depleted' as const };
      }
    });

    setAllProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, currentStock: newStock, batches: updatedBatches } : p))
    );

    const tx: StockTransaction = {
      id: `tx-sale-${Date.now()}`,
      businessType: selectedBusinessType,
      productId,
      productName: prod.name,
      type: 'sale_deduction',
      quantityChange: -quantity,
      newBalance: newStock,
      timestamp: new Date().toISOString(),
      reason: `Direct Sale (${channel})`,
      costImpact: quantity * prod.costPrice
    };
    setTransactions((prev) => [tx, ...prev]);

    // Check if triggered low stock alert
    if (newStock <= prod.reorderLevel) {
      setNotifications((prev) => [
        {
          id: `notif-low-${Date.now()}`,
          title: 'Low Stock Alert Triggered',
          message: `${prod.name} has fallen to ${newStock} ${prod.unit} (reorder threshold: ${prod.reorderLevel}).`,
          type: 'low_stock',
          severity: 'warning',
          timestamp: 'Just now',
          read: false,
          linkRoute: 'reorders'
        },
        ...prev
      ]);
    }

    return {
      success: true,
      message: `Sale registered! Deducted ${quantity} ${prod.unit} of ${prod.name} via FEFO batch rotation.`
    };
  };

  // Recipe-Based Deduction (Café Latte, Restaurant Pizza, Bakery Production)
  const sellMenuItem = (recipeId: string, quantitySold: number): { success: boolean; message: string } => {
    const recipe = allRecipes.find((r) => r.id === recipeId);
    if (!recipe) return { success: false, message: 'Recipe not found' };

    // Check ingredients availability
    for (const ing of recipe.ingredients) {
      const prod = allProducts.find((p) => p.id === ing.productId);
      const totalNeeded = ing.quantityNeeded * quantitySold;
      if (!prod || prod.currentStock < totalNeeded) {
        return {
          success: false,
          message: `Insufficient stock of ingredient: ${ing.productName}. Need ${totalNeeded} ${ing.unit}, but only ${prod?.currentStock || 0} available.`
        };
      }
    }

    // Deduct each ingredient using FEFO (First-Expired-First-Out)
    setAllProducts((prev) =>
      prev.map((prod) => {
        const ing = recipe.ingredients.find((i) => i.productId === prod.id);
        if (!ing) return prod;

        let needed = ing.quantityNeeded * quantitySold;
        const newCurrentStock = Math.max(0, prod.currentStock - needed);

        // Deduct from batches sorted by earliest expiry
        const sortedBatches = [...prod.batches].sort(
          (a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
        );

        const updatedBatches = sortedBatches.map((b) => {
          if (needed <= 0 || b.quantity <= 0) return b;
          if (b.quantity >= needed) {
            const updated = { ...b, quantity: Math.round((b.quantity - needed) * 100) / 100 };
            needed = 0;
            return updated;
          } else {
            needed -= b.quantity;
            return { ...b, quantity: 0, status: 'depleted' as const };
          }
        });

        return {
          ...prod,
          currentStock: Math.round(newCurrentStock * 100) / 100,
          batches: updatedBatches
        };
      })
    );

    // Record transaction
    const newTxList: StockTransaction[] = recipe.ingredients.map((ing) => {
      const prod = allProducts.find((p) => p.id === ing.productId);
      const qtyDeducted = -(ing.quantityNeeded * quantitySold);
      return {
        id: `tx-${Date.now()}-${ing.productId}`,
        businessType: selectedBusinessType,
        productId: ing.productId,
        productName: ing.productName,
        type: 'recipe_deduction',
        quantityChange: Math.round(qtyDeducted * 100) / 100,
        newBalance: Math.max(0, (prod?.currentStock || 0) + qtyDeducted),
        timestamp: new Date().toISOString(),
        reason: `Sold ${quantitySold}x ${recipe.menuItemName}`
      };
    });

    setTransactions((prev) => [...newTxList, ...prev]);

    return {
      success: true,
      message: `Successfully registered sale of ${quantitySold}x ${recipe.menuItemName}. Ingredients deducted via automated FEFO.`
    };
  };

  // Waste logging
  const recordFoodWaste = (
    productId: string,
    batchId: string,
    qty: number,
    reason: WasteRecord['reason']
  ) => {
    const prod = allProducts.find((p) => p.id === productId);
    if (!prod) return;

    const costLost = Math.round(qty * prod.costPrice);

    // Deduct from product stock and batch
    setAllProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        const updatedBatches = p.batches.map((b) =>
          b.id === batchId ? { ...b, quantity: Math.max(0, b.quantity - qty) } : b
        );
        return {
          ...p,
          currentStock: Math.max(0, p.currentStock - qty),
          batches: updatedBatches
        };
      })
    );

    const wasteEntry: WasteRecord = {
      id: `w-${Date.now()}`,
      businessType: selectedBusinessType,
      productId,
      productName: prod.name,
      category: prod.category,
      batchId,
      quantity: qty,
      unit: prod.unit,
      costLost,
      reason,
      loggedDate: new Date().toISOString().split('T')[0],
      recordedBy: profile?.ownerName || 'Manager'
    };

    setAllWasteRecords((prev) => [wasteEntry, ...prev]);

    const tx: StockTransaction = {
      id: `tx-${Date.now()}`,
      businessType: selectedBusinessType,
      productId,
      productName: prod.name,
      type: 'waste_writeoff',
      quantityChange: -qty,
      newBalance: Math.max(0, prod.currentStock - qty),
      timestamp: new Date().toISOString(),
      reason: `Spoilage/Waste write-off: ${reason}`,
      costImpact: costLost
    };
    setTransactions((prev) => [tx, ...prev]);
  };

  // Purchase Order Operations
  const createPurchaseOrder = (poData: Omit<PurchaseOrder, 'id' | 'businessType' | 'orderNumber'>) => {
    const count = allPurchaseOrders.length + 1;
    const orderNumber = `PO-2026-${1000 + count}`;
    const newPO: PurchaseOrder = {
      ...poData,
      id: `po-${Date.now()}`,
      businessType: selectedBusinessType,
      orderNumber
    };
    setAllPurchaseOrders((prev) => [newPO, ...prev]);
  };

  const markPurchaseOrderReceived = (poId: string) => {
    const po = allPurchaseOrders.find((p) => p.id === poId);
    if (!po || po.status === 'received') return;

    // Update PO status
    setAllPurchaseOrders((prev) =>
      prev.map((p) =>
        p.id === poId
          ? { ...p, status: 'received' as const, receivedDate: new Date().toISOString().split('T')[0] }
          : p
      )
    );

    // Auto-update inventory batches
    po.items.forEach((item) => {
      recordStockIn(
        item.productId,
        item.quantity,
        `PO-${po.orderNumber.slice(-4)}-RCV`,
        new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0], // 14 days default
        item.unitCost
      );
    });
  };

  // Algorithm Getters
  const getForecasts = (): DemandForecastItem[] => {
    return products.map((p) => calculateDemandForecast(p));
  };

  const getReorderRecommendations = (): SmartReorderItem[] => {
    return products.map((p) => {
      const onOrder = purchaseOrders
        .filter((po) => po.status === 'pending')
        .flatMap((po) => po.items)
        .filter((item) => item.productId === p.id)
        .reduce((sum, item) => sum + item.quantity, 0);

      return calculateSmartReorder(p, onOrder);
    });
  };

  const getFreshnessRecommendations = (): FreshnessRecommendation[] => {
    return products.flatMap((p) => generateFreshnessRecommendations(p));
  };

  const applyFreshnessAction = (recId: string) => {
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: 'Freshness Action Applied',
        message: 'Action logged into store workflow. Promotion / Kitchen Prep notice transmitted.',
        type: 'reorder',
        severity: 'success',
        timestamp: 'Just now',
        read: false
      },
      ...prev
    ]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const unreadNotificationCount = notifications.filter((n) => !n.read).length;

  return (
    <AppContext.Provider
      value={{
        currentRoute,
        setCurrentRoute,
        selectedBusinessType,
        setSelectedBusinessType,
        profile,
        isAuthenticated,
        loginWithPhone,
        verifyOtp,
        completeOnboarding,
        logout,
        demoModeNotice: true,
        products,
        recipes,
        suppliers,
        purchaseOrders,
        wasteRecords,
        transactions,
        notifications,
        scannedProducts,
        saveScannedProduct,
        updateScannedProduct,
        deleteScannedProduct,
        addProduct,
        updateProduct,
        deleteProduct,
        serverOnline,
        refreshBackendData,
        recordStockAdjustment,
        recordStockIn,
        recordDirectSale,
        sellMenuItem,
        recordFoodWaste,
        createPurchaseOrder,
        markPurchaseOrderReceived,
        getForecasts,
        getReorderRecommendations,
        getFreshnessRecommendations,
        applyFreshnessAction,
        markNotificationAsRead,
        unreadNotificationCount,
        activeProductId,
        setActiveProductId
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
