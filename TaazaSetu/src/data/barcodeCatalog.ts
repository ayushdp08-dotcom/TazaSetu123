import { BusinessType } from '../types';

export interface BarcodeProductInfo {
  barcode: string;
  format: 'EAN-13' | 'EAN-8' | 'UPC-A' | 'UPC-E' | 'CODE-128';
  name: string;
  brand: string;
  category: string;
  sizeOrQuantity: string;
  unit: string;
  defaultCostPrice: number;
  defaultSellingPrice: number;
  imageUrl: string;
  suggestedShelfLifeDays: number;
  packagingCodeDateHint?: string; // Optional packaging code (e.g. "MFG2610 EXP2611")
  applicableBusinesses: BusinessType[];
  description: string;
}

export const BARCODE_PRODUCT_DATABASE: Record<string, BarcodeProductInfo> = {
  // Amul Taaza Milk 1L - EAN-13
  '8901262010053': {
    barcode: '8901262010053',
    format: 'EAN-13',
    name: 'Amul Taaza Homogenised Toned Milk',
    brand: 'Amul',
    category: 'Dairy & Eggs',
    sizeOrQuantity: '1 Litre',
    unit: 'litres',
    defaultCostPrice: 56,
    defaultSellingPrice: 72,
    imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80',
    suggestedShelfLifeDays: 4,
    packagingCodeDateHint: 'P:14/10 E:20/10',
    applicableBusinesses: ['grocery', 'cafe'],
    description: 'Fresh toned pasteurized milk with 3.0% fat, 8.5% SNF.'
  },
  // Britannia Whole Wheat Bread 400g - EAN-13
  '8901063141122': {
    barcode: '8901063141122',
    format: 'EAN-13',
    name: 'Britannia 100% Whole Wheat Bread',
    brand: 'Britannia',
    category: 'Bakery & Bread',
    sizeOrQuantity: '400g',
    unit: 'packets',
    defaultCostPrice: 38,
    defaultSellingPrice: 55,
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80',
    suggestedShelfLifeDays: 5,
    packagingCodeDateHint: 'PKD 15 OCT',
    applicableBusinesses: ['grocery', 'cafe'],
    description: '100% whole wheat sliced loaf with dietary fibre.'
  },
  // Nescafe Classic Coffee Powder 100g - EAN-13
  '8901058852330': {
    barcode: '8901058852330',
    format: 'EAN-13',
    name: 'Nescafe Classic 100% Pure Coffee Jar',
    brand: 'Nescafe',
    category: 'Coffee Beans & Blends',
    sizeOrQuantity: '100g',
    unit: 'grams',
    defaultCostPrice: 280,
    defaultSellingPrice: 360,
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=400&q=80',
    suggestedShelfLifeDays: 365,
    applicableBusinesses: ['cafe', 'grocery'],
    description: 'Signature rich dark roast coffee granules.'
  },
  // Fortune Sunlite Sunflower Oil 1L - EAN-13
  '8906007280016': {
    barcode: '8906007280016',
    format: 'EAN-13',
    name: 'Fortune Sunlite Refined Sunflower Oil Pouch',
    brand: 'Fortune',
    category: 'Packaged Foods',
    sizeOrQuantity: '1 Litre',
    unit: 'packets',
    defaultCostPrice: 132,
    defaultSellingPrice: 165,
    imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80',
    suggestedShelfLifeDays: 180,
    applicableBusinesses: ['grocery', 'restaurant'],
    description: 'Light and healthy refined sunflower cooking oil with Vitamin A & D.'
  },
  // Mother Dairy Classic Dahi 400g - EAN-13
  '8901648001058': {
    barcode: '8901648001058',
    format: 'EAN-13',
    name: 'Mother Dairy Classic Dahi Cup',
    brand: 'Mother Dairy',
    category: 'Dairy & Eggs',
    sizeOrQuantity: '400g',
    unit: 'packets',
    defaultCostPrice: 35,
    defaultSellingPrice: 48,
    imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=400&q=80',
    suggestedShelfLifeDays: 7,
    packagingCodeDateHint: 'EXP 23 OCT',
    applicableBusinesses: ['grocery', 'restaurant'],
    description: 'Thick and creamy curd made from pasteurized milk.'
  },
  // Parle-G Glucose Biscuits 250g - EAN-8
  '89017191': {
    barcode: '89017191',
    format: 'EAN-8',
    name: 'Parle-G Gold Glucose Biscuits',
    brand: 'Parle',
    category: 'Packaged Foods',
    sizeOrQuantity: '250g',
    unit: 'packets',
    defaultCostPrice: 22,
    defaultSellingPrice: 30,
    imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=400&q=80',
    suggestedShelfLifeDays: 180,
    applicableBusinesses: ['grocery', 'cafe'],
    description: 'Classic crisp wheat biscuits with milk and glucose.'
  },
  // Heinz Tomato Ketchup 500g - UPC-A
  '013000006408': {
    barcode: '013000006408',
    format: 'UPC-A',
    name: 'Heinz Tomato Ketchup Squeeze Bottle',
    brand: 'Heinz',
    category: 'Cooking Oils & Condiments',
    sizeOrQuantity: '500g',
    unit: 'pieces',
    defaultCostPrice: 120,
    defaultSellingPrice: 155,
    imageUrl: 'https://images.unsplash.com/photo-1607305387299-a3d9611cd469?auto=format&fit=crop&w=400&q=80',
    suggestedShelfLifeDays: 360,
    applicableBusinesses: ['cafe', 'restaurant', 'grocery'],
    description: 'Thick tomato ketchup made from vine-ripened red tomatoes.'
  },
  // Coca Cola Can 330ml - UPC-E
  '04900003': {
    barcode: '04900003',
    format: 'UPC-E',
    name: 'Coca-Cola Original Taste Can',
    brand: 'The Coca-Cola Company',
    category: 'Beverages & Juices',
    sizeOrQuantity: '330ml',
    unit: 'cans',
    defaultCostPrice: 32,
    defaultSellingPrice: 45,
    imageUrl: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?auto=format&fit=crop&w=400&q=80',
    suggestedShelfLifeDays: 180,
    applicableBusinesses: ['grocery', 'cafe', 'restaurant'],
    description: 'Refreshing carbonated soft drink.'
  },
  // Barista Whole Milk 1L - EAN-13
  '8901262010992': {
    barcode: '8901262010992',
    format: 'EAN-13',
    name: 'Barista Whole Full Cream Milk',
    brand: 'Metro Barista Select',
    category: 'Milk & Dairy',
    sizeOrQuantity: '1 Litre',
    unit: 'litres',
    defaultCostPrice: 62,
    defaultSellingPrice: 85,
    imageUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=400&q=80',
    suggestedShelfLifeDays: 4,
    packagingCodeDateHint: 'EXP 21 OCT',
    applicableBusinesses: ['cafe'],
    description: 'High-protein microfoam milk formulated specifically for latte art.'
  },
  // Artisan High Protein Bread Flour 5kg - EAN-13
  '8904012890011': {
    barcode: '8904012890011',
    format: 'EAN-13',
    name: 'Punjab High-Protein Unbleached Bread Flour T55',
    brand: 'Punjab Grain Mills',
    category: 'Flours & Grains',
    sizeOrQuantity: '5 kg',
    unit: 'kg',
    defaultCostPrice: 260,
    defaultSellingPrice: 390,
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80',
    suggestedShelfLifeDays: 120,
    applicableBusinesses: ['bakery', 'restaurant'],
    description: 'High gluten flour ideal for long-ferment sourdough and baguettes.'
  }
};

/**
 * Lookup product in local barcode database
 */
export function lookupBarcodeProduct(barcode: string): BarcodeProductInfo | null {
  const clean = barcode.trim();
  if (BARCODE_PRODUCT_DATABASE[clean]) {
    return BARCODE_PRODUCT_DATABASE[clean];
  }
  // Try UPC-A to EAN-13 expansion or zero-padding check
  if (clean.length === 12 && BARCODE_PRODUCT_DATABASE['0' + clean]) {
    return BARCODE_PRODUCT_DATABASE['0' + clean];
  }
  return null;
}

/**
 * Validate standard barcode formats (EAN-13, EAN-8, UPC-A, UPC-E)
 */
export function validateBarcodeFormat(barcode: string): {
  valid: boolean;
  format?: 'EAN-13' | 'EAN-8' | 'UPC-A' | 'UPC-E' | 'CODE-128';
  error?: string;
} {
  const clean = barcode.trim();
  if (!/^\d+$/.test(clean)) {
    return { valid: false, error: 'Barcode must contain digits only.' };
  }

  if (clean.length === 13) return { valid: true, format: 'EAN-13' };
  if (clean.length === 8) return { valid: true, format: 'EAN-8' };
  if (clean.length === 12) return { valid: true, format: 'UPC-A' };
  if (clean.length === 6 || clean.length === 7) return { valid: true, format: 'UPC-E' };

  return {
    valid: false,
    error: `Unsupported barcode length (${clean.length} digits). Supported formats: EAN-13 (13 digits), EAN-8 (8 digits), UPC-A (12 digits), UPC-E (6-8 digits).`
  };
}
