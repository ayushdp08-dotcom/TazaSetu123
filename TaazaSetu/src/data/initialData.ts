import { BusinessConfig, BusinessType, Product, Recipe, Supplier, PurchaseOrder, WasteRecord } from '../types';

export const BUSINESS_CONFIGS: Record<BusinessType, BusinessConfig> = {
  grocery: {
    id: 'grocery',
    name: 'Grocery & Supermarket',
    tagline: 'Packaged goods, dairy, fresh produce & household staples',
    badge: 'High Turnover & Batch Expiry',
    icon: 'Store',
    color: '#16a34a',
    description: 'Track perishables by batch, automate FEFO shelf rotations, prevent stockouts on essentials, and protect daily margins.',
    categories: ['Dairy & Eggs', 'Fresh Fruits & Veg', 'Packaged Foods', 'Beverages & Juices', 'Bakery & Bread', 'Frozen Foods', 'Household Staples'],
    units: ['packets', 'kg', 'grams', 'litres', 'ml', 'pieces', 'boxes'],
    sampleHighlights: ['Batch-wise expiry alerts', 'FEFO shelf allocation', 'High-speed SKU lookup', 'Margin analytics']
  },
  cafe: {
    id: 'cafe',
    name: 'Café & Beverage Bar',
    tagline: 'Coffee beans, milks, syrups, teas, cups & pastries',
    badge: 'Drink Recipes & Perishable Milk',
    icon: 'Coffee',
    color: '#059669',
    description: 'Deduct whole milk and single-origin beans per latte ordered. Monitor short-shelf-life dairy and projected morning rush peaks.',
    categories: ['Coffee Beans & Blends', 'Milk & Dairy', 'Flavour Syrups', 'Teas & Infusions', 'Cups & Packaging', 'Café Snacks & Pastries'],
    units: ['kg', 'grams', 'litres', 'ml', 'pieces', 'boxes', 'shots'],
    sampleHighlights: ['POS recipe deduction (latte/cappuccino)', 'Short-life milk tracker', 'Drink profitability', 'Morning peak forecast']
  },
  restaurant: {
    id: 'restaurant',
    name: 'Bistro & Restaurant Kitchen',
    tagline: 'Raw ingredients, proteins, sauces, prep items & recipes',
    badge: 'Yield Deductions & Kitchen Prep',
    icon: 'UtensilsCrossed',
    color: '#0d9488',
    description: 'Link kitchen recipes to bulk ingredients. Daily prep sheet recommendations, kitchen storage tracking, and cold-chain alert monitor.',
    categories: ['Proteins & Seafood', 'Fresh Vegetables & Herbs', 'Dairy & Cheeses', 'Grains & Pasta', 'Cooking Oils & Condiments', 'Prepared Sauces & Stocks'],
    units: ['kg', 'grams', 'litres', 'ml', 'portions', 'cans', 'trays'],
    sampleHighlights: ['Kitchen recipe yields', 'Daily prep volume suggestions', 'Storage walk-in zones', 'Food waste cost logs']
  },
  bakery: {
    id: 'bakery',
    name: 'Artisan Bakery & Patisserie',
    tagline: 'Flour, yeast, dairy, chocolates, cakes & batch bakes',
    badge: 'Batch Production & Strict Shelf Life',
    icon: 'Cake',
    color: '#15803d',
    description: 'Transform bulk raw flour and butter into daily fresh sourdough and croissants. Forecast day-ahead baking batches to eliminate evening toss-outs.',
    categories: ['Flours & Grains', 'Sugars & Sweeteners', 'Fats & Butter', 'Chocolates & Pastes', 'Yeasts & Leavening', 'Finished Breads', 'Finished Pastries'],
    units: ['kg', 'grams', 'litres', 'pieces', 'trays', 'loaves', 'batches'],
    sampleHighlights: ['Baking batch conversion', 'Day-shelf-life tracking', 'Morning oven schedule planner', 'End-of-day waste monitor']
  }
};

// Realistic initial sample data for each business type
export const INITIAL_PRODUCTS: Product[] = [
  // --- GROCERY PRODUCTS ---
  {
    id: 'g-1',
    businessType: 'grocery',
    name: 'Amul Taaza Homogenised Toned Milk 1L',
    sku: 'GRO-AML-MK01',
    category: 'Dairy & Eggs',
    unit: 'litres',
    currentStock: 48,
    reorderLevel: 25,
    targetStock: 75,
    costPrice: 56,
    sellingPrice: 72,
    supplierId: 'sup-1',
    supplierName: 'Metro Dairy Distributors',
    leadTimeDays: 1,
    shelfLifeDays: 4,
    storageCondition: 'chilled',
    historicalDailySales: [22, 25, 20, 24, 28, 30, 26, 24, 27, 29, 31, 28, 25, 27],
    tags: ['perishable', 'high-turnover', 'fast-mover'],
    batches: [
      { id: 'b-g1', batchNumber: 'LOT-AML-892', quantity: 18, receivedDate: '2026-10-14', expiryDate: '2026-10-18', costPrice: 56, initialQuantity: 30, storageLocation: 'Chiller Bay A', status: 'active' },
      { id: 'b-g2', batchNumber: 'LOT-AML-895', quantity: 30, receivedDate: '2026-10-16', expiryDate: '2026-10-20', costPrice: 56, initialQuantity: 30, storageLocation: 'Chiller Bay A', status: 'active' }
    ]
  },
  {
    id: 'g-2',
    businessType: 'grocery',
    name: 'Farm Fresh Organic Spinach (Palak)',
    sku: 'GRO-VEG-SP02',
    category: 'Fresh Fruits & Veg',
    unit: 'kg',
    currentStock: 14,
    reorderLevel: 10,
    targetStock: 30,
    costPrice: 28,
    sellingPrice: 48,
    supplierId: 'sup-2',
    supplierName: 'Kisan Agro Direct Mandi',
    leadTimeDays: 1,
    shelfLifeDays: 3,
    storageCondition: 'chilled',
    historicalDailySales: [12, 10, 11, 14, 15, 18, 16, 11, 13, 14, 17, 16, 12, 13],
    tags: ['organic', 'perishable', 'leafy'],
    batches: [
      { id: 'b-g3', batchNumber: 'LOT-SPN-102', quantity: 6, receivedDate: '2026-10-15', expiryDate: '2026-10-17', costPrice: 28, initialQuantity: 15, storageLocation: 'Veg Chiller rack 2', status: 'active' },
      { id: 'b-g4', batchNumber: 'LOT-SPN-104', quantity: 8, receivedDate: '2026-10-16', expiryDate: '2026-10-19', costPrice: 28, initialQuantity: 15, storageLocation: 'Veg Chiller rack 2', status: 'active' }
    ]
  },
  {
    id: 'g-3',
    businessType: 'grocery',
    name: 'Britannia 100% Whole Wheat Bread 400g',
    sku: 'GRO-BRD-BR03',
    category: 'Bakery & Bread',
    unit: 'packets',
    currentStock: 22,
    reorderLevel: 20,
    targetStock: 50,
    costPrice: 38,
    sellingPrice: 55,
    supplierId: 'sup-3',
    supplierName: 'Apex FMCG Logistics',
    leadTimeDays: 2,
    shelfLifeDays: 5,
    storageCondition: 'ambient',
    historicalDailySales: [18, 19, 16, 21, 24, 25, 22, 19, 20, 22, 26, 24, 18, 20],
    tags: ['staple', 'daily-fresh'],
    batches: [
      { id: 'b-g5', batchNumber: 'LOT-BRD-401', quantity: 7, receivedDate: '2026-10-13', expiryDate: '2026-10-18', costPrice: 38, initialQuantity: 25, storageLocation: 'Aisle 2 - Shelf B', status: 'active' },
      { id: 'b-g6', batchNumber: 'LOT-BRD-409', quantity: 15, receivedDate: '2026-10-15', expiryDate: '2026-10-21', costPrice: 38, initialQuantity: 25, storageLocation: 'Aisle 2 - Shelf B', status: 'active' }
    ]
  },
  {
    id: 'g-4',
    businessType: 'grocery',
    name: 'Fortune Sunlite Refined Sunflower Oil 1L',
    sku: 'GRO-OIL-SUN04',
    category: 'Packaged Foods',
    unit: 'packets',
    currentStock: 12,
    reorderLevel: 15,
    targetStock: 45,
    costPrice: 132,
    sellingPrice: 165,
    supplierId: 'sup-3',
    supplierName: 'Apex FMCG Logistics',
    leadTimeDays: 3,
    shelfLifeDays: 180,
    storageCondition: 'ambient',
    historicalDailySales: [6, 8, 7, 9, 11, 14, 10, 7, 8, 9, 12, 10, 8, 9],
    tags: ['cooking-essential', 'low-stock'],
    batches: [
      { id: 'b-g7', batchNumber: 'LOT-SUN-991', quantity: 12, receivedDate: '2026-09-01', expiryDate: '2027-03-01', costPrice: 132, initialQuantity: 30, storageLocation: 'Aisle 5 - Bottom Rack', status: 'active' }
    ]
  },
  {
    id: 'g-5',
    businessType: 'grocery',
    name: 'Mother Dairy Classic Dahi Cup 400g',
    sku: 'GRO-DAI-DH05',
    category: 'Dairy & Eggs',
    unit: 'packets',
    currentStock: 16,
    reorderLevel: 15,
    targetStock: 40,
    costPrice: 35,
    sellingPrice: 48,
    supplierId: 'sup-1',
    supplierName: 'Metro Dairy Distributors',
    leadTimeDays: 1,
    shelfLifeDays: 7,
    storageCondition: 'chilled',
    historicalDailySales: [14, 15, 12, 16, 20, 22, 19, 14, 16, 17, 21, 20, 15, 16],
    tags: ['chilled', 'daily'],
    batches: [
      { id: 'b-g8', batchNumber: 'LOT-MD-118', quantity: 5, receivedDate: '2026-10-12', expiryDate: '2026-10-19', costPrice: 35, initialQuantity: 20, storageLocation: 'Chiller Bay B', status: 'active' },
      { id: 'b-g9', batchNumber: 'LOT-MD-124', quantity: 11, receivedDate: '2026-10-15', expiryDate: '2026-10-23', costPrice: 35, initialQuantity: 20, storageLocation: 'Chiller Bay B', status: 'active' }
    ]
  },

  // --- CAFÉ PRODUCTS ---
  {
    id: 'c-1',
    businessType: 'cafe',
    name: 'Coorg Dark Roast Arabica Beans',
    sku: 'CAF-COF-ARB01',
    category: 'Coffee Beans & Blends',
    unit: 'kg',
    currentStock: 12.5,
    reorderLevel: 8,
    targetStock: 30,
    costPrice: 920,
    sellingPrice: 1450,
    supplierId: 'sup-4',
    supplierName: 'Malnad Estate Coffee Roasters',
    leadTimeDays: 4,
    shelfLifeDays: 90,
    storageCondition: 'dry_dark',
    historicalDailySales: [1.8, 2.1, 1.9, 2.4, 3.2, 3.6, 2.8, 2.0, 2.3, 2.5, 3.4, 3.1, 2.2, 2.4],
    tags: ['core-recipe', 'beans', 'single-origin'],
    batches: [
      { id: 'b-c1', batchNumber: 'LOT-ROAST-441', quantity: 4.5, receivedDate: '2026-09-15', expiryDate: '2026-11-15', costPrice: 920, initialQuantity: 15, storageLocation: 'Coffee Bean Bin 1', status: 'active' },
      { id: 'b-c2', batchNumber: 'LOT-ROAST-460', quantity: 8.0, receivedDate: '2026-10-05', expiryDate: '2026-12-05', costPrice: 920, initialQuantity: 15, storageLocation: 'Dry Storage Shelf C', status: 'active' }
    ]
  },
  {
    id: 'c-2',
    businessType: 'cafe',
    name: 'Barista Whole Full Cream Milk 1L',
    sku: 'CAF-MLK-BAR02',
    category: 'Milk & Dairy',
    unit: 'litres',
    currentStock: 34,
    reorderLevel: 25,
    targetStock: 80,
    costPrice: 62,
    sellingPrice: 85,
    supplierId: 'sup-1',
    supplierName: 'Metro Dairy Distributors',
    leadTimeDays: 1,
    shelfLifeDays: 4,
    storageCondition: 'chilled',
    historicalDailySales: [28, 30, 27, 32, 44, 48, 36, 29, 31, 33, 46, 42, 30, 32],
    tags: ['high-turnover', 'short-shelf-life', 'chilled'],
    batches: [
      { id: 'b-c3', batchNumber: 'LOT-BAR-801', quantity: 12, receivedDate: '2026-10-14', expiryDate: '2026-10-18', costPrice: 62, initialQuantity: 40, storageLocation: 'Bar Under-counter Fridge', status: 'active' },
      { id: 'b-c4', batchNumber: 'LOT-BAR-810', quantity: 22, receivedDate: '2026-10-16', expiryDate: '2026-10-20', costPrice: 62, initialQuantity: 40, storageLocation: 'Back Walk-in Chiller', status: 'active' }
    ]
  },
  {
    id: 'c-3',
    businessType: 'cafe',
    name: 'Madagascar Vanilla Artisan Syrup 750ml',
    sku: 'CAF-SYR-VAN03',
    category: 'Flavour Syrups',
    unit: 'litres',
    currentStock: 3.5,
    reorderLevel: 2,
    targetStock: 8,
    costPrice: 580,
    sellingPrice: 890,
    supplierId: 'sup-5',
    supplierName: 'Gourmet Barista Supplies Ltd',
    leadTimeDays: 3,
    shelfLifeDays: 180,
    storageCondition: 'ambient',
    historicalDailySales: [0.3, 0.4, 0.35, 0.5, 0.7, 0.8, 0.6, 0.35, 0.4, 0.45, 0.75, 0.65, 0.4, 0.5],
    tags: ['syrup', 'flavour'],
    batches: [
      { id: 'b-c5', batchNumber: 'LOT-VAN-08', quantity: 3.5, receivedDate: '2026-09-01', expiryDate: '2027-02-28', costPrice: 580, initialQuantity: 6, storageLocation: 'Syrup Rail 1', status: 'active' }
    ]
  },
  {
    id: 'c-4',
    businessType: 'cafe',
    name: 'Eco Double-Wall Hot Drink Cups 350ml (12oz)',
    sku: 'CAF-PKG-CUP04',
    category: 'Cups & Packaging',
    unit: 'pieces',
    currentStock: 380,
    reorderLevel: 250,
    targetStock: 1000,
    costPrice: 4.8,
    sellingPrice: 0,
    supplierId: 'sup-5',
    supplierName: 'Gourmet Barista Supplies Ltd',
    leadTimeDays: 2,
    shelfLifeDays: 730,
    storageCondition: 'ambient',
    historicalDailySales: [95, 105, 90, 110, 160, 180, 140, 98, 108, 115, 170, 155, 102, 110],
    tags: ['packaging', 'consumable'],
    batches: [
      { id: 'b-c6', batchNumber: 'LOT-CUP-204', quantity: 380, receivedDate: '2026-10-01', expiryDate: '2028-10-01', costPrice: 4.8, initialQuantity: 800, storageLocation: 'Dry Packaging Attic', status: 'active' }
    ]
  },
  {
    id: 'c-5',
    businessType: 'cafe',
    name: 'French Butter Croissants (Fresh Daily)',
    sku: 'CAF-BAK-CRO05',
    category: 'Café Snacks & Pastries',
    unit: 'pieces',
    currentStock: 18,
    reorderLevel: 10,
    targetStock: 35,
    costPrice: 45,
    sellingPrice: 120,
    supplierId: 'sup-6',
    supplierName: 'Crumb & Crust Bakery Wholesale',
    leadTimeDays: 1,
    shelfLifeDays: 2,
    storageCondition: 'ambient',
    historicalDailySales: [16, 18, 15, 20, 26, 28, 24, 17, 19, 21, 27, 25, 18, 20],
    tags: ['fresh-daily', 'pastry', 'high-margin'],
    batches: [
      { id: 'b-c7', batchNumber: 'LOT-CRO-DAILY', quantity: 18, receivedDate: '2026-10-17', expiryDate: '2026-10-18', costPrice: 45, initialQuantity: 30, storageLocation: 'Front Glass Display', status: 'active' }
    ]
  },

  // --- RESTAURANT PRODUCTS ---
  {
    id: 'r-1',
    businessType: 'restaurant',
    name: 'Fresh Boneless Chicken Breast Fillet',
    sku: 'RES-PRT-CHK01',
    category: 'Proteins & Seafood',
    unit: 'kg',
    currentStock: 18.5,
    reorderLevel: 15,
    targetStock: 45,
    costPrice: 220,
    sellingPrice: 420,
    supplierId: 'sup-7',
    supplierName: 'Royal Fresh Meat & Poultry',
    leadTimeDays: 1,
    shelfLifeDays: 3,
    storageCondition: 'chilled',
    historicalDailySales: [14, 16, 13, 17, 24, 28, 22, 15, 17, 18, 26, 23, 16, 17],
    tags: ['protein', 'perishable', 'high-value'],
    batches: [
      { id: 'b-r1', batchNumber: 'LOT-CHK-901', quantity: 6.5, receivedDate: '2026-10-15', expiryDate: '2026-10-18', costPrice: 220, initialQuantity: 20, storageLocation: 'Meat Chiller Box 1', status: 'active' },
      { id: 'b-r2', batchNumber: 'LOT-CHK-908', quantity: 12.0, receivedDate: '2026-10-16', expiryDate: '2026-10-19', costPrice: 220, initialQuantity: 20, storageLocation: 'Meat Chiller Box 1', status: 'active' }
    ]
  },
  {
    id: 'r-2',
    businessType: 'restaurant',
    name: 'Italian Mozzarella Block (High Melt)',
    sku: 'RES-DAI-MOZ02',
    category: 'Dairy & Cheeses',
    unit: 'kg',
    currentStock: 9.0,
    reorderLevel: 10,
    targetStock: 30,
    costPrice: 480,
    sellingPrice: 750,
    supplierId: 'sup-1',
    supplierName: 'Metro Dairy Distributors',
    leadTimeDays: 2,
    shelfLifeDays: 20,
    storageCondition: 'chilled',
    historicalDailySales: [4.2, 4.6, 3.8, 5.1, 7.5, 8.2, 6.4, 4.4, 4.8, 5.3, 7.8, 7.1, 4.5, 5.0],
    tags: ['pizza-ingredient', 'cheese', 'reorder-needed'],
    batches: [
      { id: 'b-r3', batchNumber: 'LOT-MOZ-33', quantity: 9.0, receivedDate: '2026-10-06', expiryDate: '2026-10-26', costPrice: 480, initialQuantity: 25, storageLocation: 'Walk-in Cold Room Rack 3', status: 'active' }
    ]
  },
  {
    id: 'r-3',
    businessType: 'restaurant',
    name: 'San Marzano Crushed Tomato Puree 2.5kg Cans',
    sku: 'RES-CND-TOM03',
    category: 'Prepared Sauces & Stocks',
    unit: 'cans',
    currentStock: 24,
    reorderLevel: 12,
    targetStock: 40,
    costPrice: 320,
    sellingPrice: 0,
    supplierId: 'sup-8',
    supplierName: 'Horeca Chef Direct Importers',
    leadTimeDays: 3,
    shelfLifeDays: 360,
    storageCondition: 'ambient',
    historicalDailySales: [3, 4, 3, 5, 7, 8, 6, 3, 4, 5, 7, 7, 4, 5],
    tags: ['sauce-base', 'canned'],
    batches: [
      { id: 'b-r4', batchNumber: 'LOT-TOM-702', quantity: 24, receivedDate: '2026-09-10', expiryDate: '2027-08-30', costPrice: 320, initialQuantity: 40, storageLocation: 'Dry Ingredient Store', status: 'active' }
    ]
  },
  {
    id: 'r-4',
    businessType: 'restaurant',
    name: 'Fresh Basil Leaves (Hydroponic Sweet Basil)',
    sku: 'RES-VEG-BAS04',
    category: 'Fresh Vegetables & Herbs',
    unit: 'grams',
    currentStock: 450,
    reorderLevel: 300,
    targetStock: 1000,
    costPrice: 0.8,
    sellingPrice: 2.0,
    supplierId: 'sup-2',
    supplierName: 'Kisan Agro Direct Mandi',
    leadTimeDays: 1,
    shelfLifeDays: 4,
    storageCondition: 'chilled',
    historicalDailySales: [140, 150, 130, 160, 220, 240, 190, 145, 155, 165, 230, 210, 140, 150],
    tags: ['garnish', 'herb', 'short-life'],
    batches: [
      { id: 'b-r5', batchNumber: 'LOT-BAS-11', quantity: 150, receivedDate: '2026-10-15', expiryDate: '2026-10-18', costPrice: 0.8, initialQuantity: 500, storageLocation: 'Herb Crisper Bin 4', status: 'active' },
      { id: 'b-r6', batchNumber: 'LOT-BAS-14', quantity: 300, receivedDate: '2026-10-16', expiryDate: '2026-10-20', costPrice: 0.8, initialQuantity: 500, storageLocation: 'Herb Crisper Bin 4', status: 'active' }
    ]
  },

  // --- BAKERY PRODUCTS ---
  {
    id: 'b-1',
    businessType: 'bakery',
    name: 'High-Protein Unbleached Bread Flour (Type 55)',
    sku: 'BAK-FLR-HP01',
    category: 'Flours & Grains',
    unit: 'kg',
    currentStock: 140,
    reorderLevel: 80,
    targetStock: 300,
    costPrice: 52,
    sellingPrice: 85,
    supplierId: 'sup-9',
    supplierName: 'Punjab Grain & Flour Mills',
    leadTimeDays: 3,
    shelfLifeDays: 120,
    storageCondition: 'dry_dark',
    historicalDailySales: [25, 28, 24, 30, 42, 45, 36, 26, 29, 32, 44, 40, 27, 30],
    tags: ['baking-staple', 'flour', 'raw-material'],
    batches: [
      { id: 'b-b1', batchNumber: 'LOT-FLR-202', quantity: 50, receivedDate: '2026-09-20', expiryDate: '2026-12-20', costPrice: 52, initialQuantity: 150, storageLocation: 'Silo Bay 1', status: 'active' },
      { id: 'b-b2', batchNumber: 'LOT-FLR-250', quantity: 90, receivedDate: '2026-10-08', expiryDate: '2027-01-08', costPrice: 52, initialQuantity: 150, storageLocation: 'Silo Bay 2', status: 'active' }
    ]
  },
  {
    id: 'b-2',
    businessType: 'bakery',
    name: 'Unsalted Pastry Butter 82% Fat (25kg Box)',
    sku: 'BAK-FAT-BUT02',
    category: 'Fats & Butter',
    unit: 'kg',
    currentStock: 32,
    reorderLevel: 25,
    targetStock: 75,
    costPrice: 420,
    sellingPrice: 580,
    supplierId: 'sup-1',
    supplierName: 'Metro Dairy Distributors',
    leadTimeDays: 2,
    shelfLifeDays: 45,
    storageCondition: 'chilled',
    historicalDailySales: [7.5, 8.0, 7.0, 9.2, 13.5, 14.8, 11.2, 7.8, 8.4, 9.5, 14.0, 12.8, 8.0, 9.0],
    tags: ['croissant-lamination', 'butter', 'chilled'],
    batches: [
      { id: 'b-b3', batchNumber: 'LOT-BUT-99', quantity: 12, receivedDate: '2026-09-25', expiryDate: '2026-10-25', costPrice: 420, initialQuantity: 30, storageLocation: 'Butter Cold Storage Room', status: 'active' },
      { id: 'b-b4', batchNumber: 'LOT-BUT-104', quantity: 20, receivedDate: '2026-10-10', expiryDate: '2026-11-20', costPrice: 420, initialQuantity: 30, storageLocation: 'Butter Cold Storage Room', status: 'active' }
    ]
  },
  {
    id: 'b-3',
    businessType: 'bakery',
    name: 'Artisan Country Sourdough Loaf (Finished)',
    sku: 'BAK-FIN-SDR03',
    category: 'Finished Breads',
    unit: 'loaves',
    currentStock: 24,
    reorderLevel: 15,
    targetStock: 40,
    costPrice: 48,
    sellingPrice: 160,
    supplierId: 'sup-internal',
    supplierName: 'In-House Oven Batch',
    leadTimeDays: 1,
    shelfLifeDays: 2,
    storageCondition: 'ambient',
    historicalDailySales: [20, 22, 18, 24, 32, 35, 28, 21, 23, 25, 34, 30, 22, 24],
    tags: ['finished-good', 'sourdough', 'day-shelf-life'],
    batches: [
      { id: 'b-b5', batchNumber: 'OVEN-SDR-17A', quantity: 24, receivedDate: '2026-10-17', expiryDate: '2026-10-18', costPrice: 48, initialQuantity: 35, storageLocation: 'Bread Rack Tier 1', status: 'active' }
    ]
  },
  {
    id: 'b-4',
    businessType: 'bakery',
    name: 'Belgian Dark Chocolate Callets 54.5%',
    sku: 'BAK-CHO-CAL04',
    category: 'Chocolates & Pastes',
    unit: 'kg',
    currentStock: 8.5,
    reorderLevel: 10,
    targetStock: 25,
    costPrice: 650,
    sellingPrice: 950,
    supplierId: 'sup-8',
    supplierName: 'Horeca Chef Direct Importers',
    leadTimeDays: 4,
    shelfLifeDays: 240,
    storageCondition: 'ambient',
    historicalDailySales: [1.2, 1.4, 1.1, 1.6, 2.5, 2.8, 2.0, 1.3, 1.5, 1.7, 2.6, 2.4, 1.3, 1.5],
    tags: ['confectionery', 'low-stock', 'chocolate'],
    batches: [
      { id: 'b-b6', batchNumber: 'LOT-CHO-88', quantity: 8.5, receivedDate: '2026-08-15', expiryDate: '2027-03-15', costPrice: 650, initialQuantity: 20, storageLocation: 'Chocolate Climate Cabinet', status: 'active' }
    ]
  }
];

// Café & Restaurant Recipes with dynamic ingredient deductions
export const INITIAL_RECIPES: Recipe[] = [
  {
    id: 'rec-1',
    businessType: 'cafe',
    menuItemName: 'Vanilla Caffe Latte 350ml',
    category: 'Hot Specialty Coffee',
    sellingPrice: 220,
    preparationTimeMinutes: 3,
    marginPercent: 74,
    popularityScore: 98,
    ingredients: [
      { productId: 'c-1', productName: 'Coorg Dark Roast Arabica Beans', quantityNeeded: 0.018, unit: 'kg' }, // 18g double shot
      { productId: 'c-2', productName: 'Barista Whole Full Cream Milk 1L', quantityNeeded: 0.25, unit: 'litres' }, // 250ml steamed
      { productId: 'c-3', productName: 'Madagascar Vanilla Artisan Syrup 750ml', quantityNeeded: 0.02, unit: 'litres' }, // 20ml pump
      { productId: 'c-4', productName: 'Eco Double-Wall Hot Drink Cups 350ml (12oz)', quantityNeeded: 1, unit: 'pieces' }
    ]
  },
  {
    id: 'rec-2',
    businessType: 'cafe',
    menuItemName: 'Flat White (Double Shot)',
    category: 'Espresso Bar',
    sellingPrice: 195,
    preparationTimeMinutes: 3,
    marginPercent: 78,
    popularityScore: 92,
    ingredients: [
      { productId: 'c-1', productName: 'Coorg Dark Roast Arabica Beans', quantityNeeded: 0.02, unit: 'kg' },
      { productId: 'c-2', productName: 'Barista Whole Full Cream Milk 1L', quantityNeeded: 0.18, unit: 'litres' },
      { productId: 'c-4', productName: 'Eco Double-Wall Hot Drink Cups 350ml (12oz)', quantityNeeded: 1, unit: 'pieces' }
    ]
  },
  {
    id: 'rec-3',
    businessType: 'restaurant',
    menuItemName: 'Classic Margherita Pizza (12 inch)',
    category: 'Woodfired Pizzas',
    sellingPrice: 420,
    preparationTimeMinutes: 12,
    marginPercent: 68,
    popularityScore: 95,
    ingredients: [
      { productId: 'r-2', productName: 'Italian Mozzarella Block (High Melt)', quantityNeeded: 0.16, unit: 'kg' }, // 160g mozzarella
      { productId: 'r-3', productName: 'San Marzano Crushed Tomato Puree 2.5kg Cans', quantityNeeded: 0.08, unit: 'cans' }, // 200g tomato sauce
      { productId: 'r-4', productName: 'Fresh Basil Leaves (Hydroponic Sweet Basil)', quantityNeeded: 10, unit: 'grams' }
    ]
  },
  {
    id: 'rec-4',
    businessType: 'restaurant',
    menuItemName: 'Grilled Herb Chicken Breast with Jus',
    category: 'Mains & Grills',
    sellingPrice: 490,
    preparationTimeMinutes: 18,
    marginPercent: 62,
    popularityScore: 89,
    ingredients: [
      { productId: 'r-1', productName: 'Fresh Boneless Chicken Breast Fillet', quantityNeeded: 0.28, unit: 'kg' }, // 280g fillet
      { productId: 'r-4', productName: 'Fresh Basil Leaves (Hydroponic Sweet Basil)', quantityNeeded: 15, unit: 'grams' }
    ]
  },
  {
    id: 'rec-5',
    businessType: 'bakery',
    menuItemName: 'Artisan Country Sourdough Loaf (Batch of 10)',
    category: 'Oven Production',
    sellingPrice: 1600, // For 10 loaves
    preparationTimeMinutes: 180,
    marginPercent: 70,
    popularityScore: 94,
    ingredients: [
      { productId: 'b-1', productName: 'High-Protein Unbleached Bread Flour (Type 55)', quantityNeeded: 5.5, unit: 'kg' }
    ]
  }
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-1',
    businessType: 'grocery',
    name: 'Metro Dairy Distributors',
    contactPerson: 'Suresh Patil',
    phone: '+91 98201 44510',
    email: 'orders@metrodairy.in',
    address: 'Gala 14, APMC Cold Storage Complex, Navi Mumbai',
    leadTimeDays: 1,
    reliabilityScore: 98,
    categoriesSupplied: ['Dairy & Eggs', 'Milk & Dairy', 'Dairy & Cheeses', 'Fats & Butter'],
    activeOrdersCount: 1
  },
  {
    id: 'sup-2',
    businessType: 'grocery',
    name: 'Kisan Agro Direct Mandi',
    contactPerson: 'Rameshwar Khot',
    phone: '+91 98920 33118',
    email: 'kisanagro.supply@mandi.net',
    address: 'Plot 45, Vashi Agricultural Terminal, Navi Mumbai',
    leadTimeDays: 1,
    reliabilityScore: 94,
    categoriesSupplied: ['Fresh Fruits & Veg', 'Fresh Vegetables & Herbs'],
    activeOrdersCount: 0
  },
  {
    id: 'sup-3',
    businessType: 'grocery',
    name: 'Apex FMCG Logistics Ltd',
    contactPerson: 'Anjali Sharma',
    phone: '+91 98112 55901',
    email: 'b2b@apexfmcg.co.in',
    address: 'Bhiwandi Warehousing Hub, Unit 8B, Thane',
    leadTimeDays: 2,
    reliabilityScore: 96,
    categoriesSupplied: ['Packaged Foods', 'Bakery & Bread', 'Household Staples'],
    activeOrdersCount: 1
  },
  {
    id: 'sup-4',
    businessType: 'cafe',
    name: 'Malnad Estate Coffee Roasters',
    contactPerson: 'Vikram Gowda',
    phone: '+91 94481 77209',
    email: 'roastery@malnadcoffee.in',
    address: 'Estate Road 4, Chikmagalur, Karnataka',
    leadTimeDays: 4,
    reliabilityScore: 99,
    categoriesSupplied: ['Coffee Beans & Blends'],
    activeOrdersCount: 0
  },
  {
    id: 'sup-5',
    businessType: 'cafe',
    name: 'Gourmet Barista Supplies Ltd',
    contactPerson: 'Pooja Hegde',
    phone: '+91 99304 88711',
    email: 'orders@baristasupplies.co',
    address: 'Lower Parel Industrial Estate, Mumbai',
    leadTimeDays: 2,
    reliabilityScore: 95,
    categoriesSupplied: ['Flavour Syrups', 'Cups & Packaging', 'Teas & Infusions'],
    activeOrdersCount: 0
  },
  {
    id: 'sup-7',
    businessType: 'restaurant',
    name: 'Royal Fresh Meat & Poultry',
    contactPerson: 'Mohammed Qureshi',
    phone: '+91 98211 66490',
    email: 'dispatch@royalfreshpoultry.in',
    address: 'Deonar Market Compound, Mumbai',
    leadTimeDays: 1,
    reliabilityScore: 97,
    categoriesSupplied: ['Proteins & Seafood'],
    activeOrdersCount: 1
  },
  {
    id: 'sup-8',
    businessType: 'restaurant',
    name: 'Horeca Chef Direct Importers',
    contactPerson: 'Marco Rossi / Amit Jha',
    phone: '+91 98200 12894',
    email: 'supply@horecachef.in',
    address: 'Marol Marine Drive Hub, Andheri East, Mumbai',
    leadTimeDays: 3,
    reliabilityScore: 92,
    categoriesSupplied: ['Prepared Sauces & Stocks', 'Chocolates & Pastes'],
    activeOrdersCount: 0
  },
  {
    id: 'sup-9',
    businessType: 'bakery',
    name: 'Punjab Grain & Flour Mills',
    contactPerson: 'Harpreet Singh',
    phone: '+91 98140 22718',
    email: 'sales@punjabgrainmills.com',
    address: 'Industrial Focal Point, Ludhiana, Punjab',
    leadTimeDays: 3,
    reliabilityScore: 96,
    categoriesSupplied: ['Flours & Grains', 'Yeasts & Leavening'],
    activeOrdersCount: 1
  }
];

export const INITIAL_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: 'po-101',
    businessType: 'grocery',
    orderNumber: 'PO-2026-1001',
    supplierId: 'sup-1',
    supplierName: 'Metro Dairy Distributors',
    status: 'pending',
    items: [
      { productId: 'g-1', productName: 'Amul Taaza Homogenised Toned Milk 1L', quantity: 35, unit: 'litres', unitCost: 56, totalCost: 1960 },
      { productId: 'g-5', productName: 'Mother Dairy Classic Dahi Cup 400g', quantity: 20, unit: 'packets', unitCost: 35, totalCost: 700 }
    ],
    totalAmount: 2660,
    orderDate: '2026-10-16',
    expectedDeliveryDate: '2026-10-18',
    notes: 'Morning refrigerated delivery requested before 7:30 AM'
  },
  {
    id: 'po-102',
    businessType: 'cafe',
    orderNumber: 'PO-2026-2004',
    supplierId: 'sup-1',
    supplierName: 'Metro Dairy Distributors',
    status: 'received',
    items: [
      { productId: 'c-2', productName: 'Barista Whole Full Cream Milk 1L', quantity: 40, unit: 'litres', unitCost: 62, totalCost: 2480 }
    ],
    totalAmount: 2480,
    orderDate: '2026-10-14',
    expectedDeliveryDate: '2026-10-15',
    receivedDate: '2026-10-15',
    notes: 'Received in good temperature conditions'
  },
  {
    id: 'po-103',
    businessType: 'restaurant',
    orderNumber: 'PO-2026-3012',
    supplierId: 'sup-7',
    supplierName: 'Royal Fresh Meat & Poultry',
    status: 'pending',
    items: [
      { productId: 'r-1', productName: 'Fresh Boneless Chicken Breast Fillet', quantity: 25, unit: 'kg', unitCost: 220, totalCost: 5500 }
    ],
    totalAmount: 5500,
    orderDate: '2026-10-16',
    expectedDeliveryDate: '2026-10-18',
    notes: 'Chilled delivery below 4 degrees C required with batch temperature slip'
  },
  {
    id: 'po-104',
    businessType: 'bakery',
    orderNumber: 'PO-2026-4089',
    supplierId: 'sup-9',
    supplierName: 'Punjab Grain & Flour Mills',
    status: 'pending',
    items: [
      { productId: 'b-1', productName: 'High-Protein Unbleached Bread Flour (Type 55)', quantity: 150, unit: 'kg', unitCost: 52, totalCost: 7800 }
    ],
    totalAmount: 7800,
    orderDate: '2026-10-15',
    expectedDeliveryDate: '2026-10-19',
    notes: 'Sacks must be palletized and wrapped'
  }
];

export const INITIAL_WASTE_RECORDS: WasteRecord[] = [
  {
    id: 'w-1',
    businessType: 'grocery',
    productId: 'g-2',
    productName: 'Farm Fresh Organic Spinach (Palak)',
    category: 'Fresh Fruits & Veg',
    batchId: 'b-g3',
    quantity: 2.5,
    unit: 'kg',
    costLost: 70,
    reason: 'expired',
    loggedDate: '2026-10-16',
    recordedBy: 'Store Supervisor'
  },
  {
    id: 'w-2',
    businessType: 'grocery',
    productId: 'g-3',
    productName: 'Britannia 100% Whole Wheat Bread 400g',
    category: 'Bakery & Bread',
    batchId: 'b-g5',
    quantity: 3,
    unit: 'packets',
    costLost: 114,
    reason: 'expired',
    loggedDate: '2026-10-14',
    recordedBy: 'Inventory Clerk'
  },
  {
    id: 'w-3',
    businessType: 'cafe',
    productId: 'c-2',
    productName: 'Barista Whole Full Cream Milk 1L',
    category: 'Milk & Dairy',
    batchId: 'b-c3',
    quantity: 3,
    unit: 'litres',
    costLost: 186,
    reason: 'temperature_abuse',
    loggedDate: '2026-10-15',
    recordedBy: 'Head Barista'
  },
  {
    id: 'w-4',
    businessType: 'restaurant',
    productId: 'r-4',
    productName: 'Fresh Basil Leaves (Hydroponic Sweet Basil)',
    category: 'Fresh Vegetables & Herbs',
    batchId: 'b-r5',
    quantity: 80,
    unit: 'grams',
    costLost: 64,
    reason: 'prep_spoilage',
    loggedDate: '2026-10-16',
    recordedBy: 'Sous Chef'
  },
  {
    id: 'w-5',
    businessType: 'bakery',
    productId: 'b-3',
    productName: 'Artisan Country Sourdough Loaf (Finished)',
    category: 'Finished Breads',
    batchId: 'b-b5',
    quantity: 4,
    unit: 'loaves',
    costLost: 192,
    reason: 'expired',
    loggedDate: '2026-10-16',
    recordedBy: 'Head Baker'
  }
];
