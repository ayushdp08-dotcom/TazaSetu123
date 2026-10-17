import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  X,
  ScanLine,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Search,
  Package,
  Layers,
  FileEdit,
  Tag,
  DollarSign,
  HelpCircle,
  Info
} from 'lucide-react';
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';
import { BarcodeFormat, DecodeHintType } from '@zxing/library';
import { useApp } from '../context/AppContext';
import { readExpiryFromImage } from '../utils/expiryOcr';
import { BUSINESS_CONFIGS } from '../data/initialData';
import {
  lookupBarcodeProduct,
  validateBarcodeFormat,
  BARCODE_PRODUCT_DATABASE,
  BarcodeProductInfo
} from '../data/barcodeCatalog';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductSaved?: (productId: string) => void;
}

type ScanStep = 'camera' | 'details_entry' | 'expiry_entry' | 'review' | 'success';

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onProductSaved
}) => {
  const { selectedBusinessType, saveScannedProduct } = useApp();
  const config = BUSINESS_CONFIGS[selectedBusinessType];

  // Workflow Step State
  const [currentStep, setCurrentStep] = useState<ScanStep>('camera');

  // Camera & Scanning State
  const [cameraPermission, setCameraPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);

  // Manual barcode entry input in camera view
  const [manualBarcode, setManualBarcode] = useState('');
  const [barcodeFormatError, setBarcodeFormatError] = useState<string | null>(null);

  // Scanned / Entered Data
  const [scannedBarcode, setScannedBarcode] = useState('');
  const [detectedFormat, setDetectedFormat] = useState<string>('EAN-13');
  const [productSource, setProductSource] = useState<'database_match' | 'manual_entry'>('database_match');

  // Product Fields
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState(config.categories[0]);
  const [sizeOrQuantity, setSizeOrQuantity] = useState('1 Unit');
  const [unit, setUnit] = useState(config.units[0]);
  const [quantity, setQuantity] = useState<number>(1);
  const [costPrice, setCostPrice] = useState<number>(50);
  const [sellingPrice, setSellingPrice] = useState<number>(75);
  const [imageUrl, setImageUrl] = useState('');
  const [packagingCodeDateHint, setPackagingCodeDateHint] = useState<string | undefined>();

  // Expiry Date & Notes
  const [expiryDate, setExpiryDate] = useState('');
  const [expiryError, setExpiryError] = useState<string | null>(null);
  const [batchNumber, setBatchNumber] = useState('');
  const [notes, setNotes] = useState('');

  // Online lookup + expiry-photo OCR state
  const [lookupBusy, setLookupBusy] = useState(false);
  const [ocrBusy, setOcrBusy] = useState(false);
  const [ocrMsg, setOcrMsg] = useState('');
  const ocrInputRef = useRef<HTMLInputElement | null>(null);

  // Sample quick-pick test barcodes for simulation
  const sampleBarcodes = Object.values(BARCODE_PRODUCT_DATABASE).slice(0, 4);

  // Reset modal state
  const resetState = () => {
    stopCamera();
    setCurrentStep('camera');
    setCameraPermission('prompt');
    setCameraError(null);
    setManualBarcode('');
    setBarcodeFormatError(null);
    setScannedBarcode('');
    setName('');
    setBrand('');
    setCategory(config.categories[0]);
    setSizeOrQuantity('1 Unit');
    setUnit(config.units[0]);
    setQuantity(1);
    setCostPrice(50);
    setSellingPrice(75);
    setImageUrl('');
    setPackagingCodeDateHint(undefined);
    setExpiryDate('');
    setExpiryError(null);
    setBatchNumber('');
    setNotes('');
  };

  const handleClose = () => {
    stopCamera();
    resetState();
    onClose();
  };

  // Start Camera with ZXing
  const startCamera = async () => {
    setCameraError(null);
    setIsScanning(true);

    try {
      // First explicitly query or request media permissions
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      setCameraPermission('granted');

      // Stop this temporary test stream so ZXing can cleanly bind
      stream.getTracks().forEach((track) => track.stop());

      const hints = new Map();
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [
        BarcodeFormat.EAN_13,
        BarcodeFormat.EAN_8,
        BarcodeFormat.UPC_A,
        BarcodeFormat.UPC_E,
        BarcodeFormat.CODE_128
      ]);

      const reader = new BrowserMultiFormatReader(hints, {
        delayBetweenScanAttempts: 300
      });

      if (videoRef.current) {
        const controls = await reader.decodeFromConstraints(
          { video: { facingMode: 'environment' } },
          videoRef.current,
          (result, error) => {
            if (result) {
              const text = result.getText();
              const formatStr = result.getBarcodeFormat().toString();
              handleBarcodeDetected(text, formatStr);
            }
          }
        );
        controlsRef.current = controls;
      }
    } catch (err: any) {
      console.warn('Camera access issue:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraPermission('denied');
        setCameraError('Camera access was denied. Please allow camera permissions in your browser or enter the barcode manually.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraPermission('denied');
        setCameraError('No camera found on this device. You can test barcode scanning using the one-click demo barcodes below or type the barcode manually.');
      } else {
        setCameraPermission('denied');
        setCameraError(`Unable to start camera: ${err.message || 'Device camera unavailable'}. You can enter barcode manually.`);
      }
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (controlsRef.current) {
      try {
        controlsRef.current.stop();
      } catch (e) {
        // Ignore stop errors
      }
      controlsRef.current = null;
    }
    setIsScanning(false);
  };

  // Automatically trigger camera when opened
  useEffect(() => {
    if (isOpen && currentStep === 'camera') {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, currentStep]);

  // Online product lookup (Open Food Facts) for barcodes missing from the local catalog
  const lookupOnline = async (code: string): Promise<boolean> => {
    setLookupBusy(true);
    try {
      const r = await fetch(`https://world.openfoodfacts.org/api/v2/product/${code}.json?fields=product_name,brands,quantity,image_front_small_url`, { signal: AbortSignal.timeout(6000) });
      const j = await r.json();
      const p = j?.status === 1 ? j.product : null;
      if (p?.product_name) {
        setProductSource('database_match');
        setName(p.product_name);
        setBrand((p.brands || 'Store Brand').split(',')[0]);
        setCategory(config.categories[0]);
        setSizeOrQuantity(p.quantity || '1 Unit');
        setUnit(config.units[0]);
        setImageUrl(p.image_front_small_url || '');
        setPackagingCodeDateHint(undefined);
        setBatchNumber(`LOT-${code.slice(-6)}`);
        setCurrentStep('expiry_entry');
        return true;
      }
    } catch { /* offline or not found: manual entry */ } finally {
      setLookupBusy(false);
    }
    return false;
  };

  // Photo of the printed expiry label -> OCR -> prefilled date (owner confirms)
  const handleOcrFile = async (file?: File) => {
    if (!file) return;
    setOcrBusy(true);
    setOcrMsg('Reading expiry date… the first scan can take a few seconds.');
    try {
      const r = await readExpiryFromImage(file);
      if (r.date) {
        setExpiryDate(r.date);
        setExpiryError(null);
        setOcrMsg(`Read “${r.raw}” as ${r.date} using ${r.engine}. Please confirm it is correct.`);
      } else {
        setOcrMsg('Could not read a date. Try a closer, well-lit photo, or enter it manually.');
      }
    } catch {
      setOcrMsg('Photo reading failed. Please enter the date manually.');
    } finally {
      setOcrBusy(false);
      if (ocrInputRef.current) ocrInputRef.current.value = '';
    }
  };

  // When a barcode is detected or entered
  const handleBarcodeDetected = (code: string, formatHint?: string) => {
    stopCamera();
    setBarcodeFormatError(null);
    setOcrMsg('');

    const validation = validateBarcodeFormat(code);
    if (!validation.valid) {
      setBarcodeFormatError(validation.error || 'Invalid barcode format.');
      return;
    }

    setScannedBarcode(code);
    setDetectedFormat(validation.format || formatHint || 'EAN-13');

    // Look up in database
    const matched = lookupBarcodeProduct(code);
    if (matched) {
      setProductSource('database_match');
      setName(matched.name);
      setBrand(matched.brand);
      setCategory(matched.category);
      setSizeOrQuantity(matched.sizeOrQuantity);
      setUnit(matched.unit);
      setCostPrice(matched.defaultCostPrice);
      setSellingPrice(matched.defaultSellingPrice);
      setImageUrl(matched.imageUrl);
      setPackagingCodeDateHint(matched.packagingCodeDateHint);

      // Default batch code
      setBatchNumber(`LOT-${matched.brand.slice(0, 3).toUpperCase()}-${code.slice(-4)}`);

      // Proceed straight to Expiry Date Step (Step 4 of user request: do not auto-fill expiry)
      setCurrentStep('expiry_entry');
    } else {
      lookupOnline(code).then((found) => {
      if (found) return;
      // Not in local catalog or online: let user fill details manually
      setProductSource('manual_entry');
      setName('');
      setBrand('');
      setCategory(config.categories[0]);
      setSizeOrQuantity('1 Unit');
      setUnit(config.units[0]);
      setCostPrice(50);
      setSellingPrice(75);
      setImageUrl('');
      setPackagingCodeDateHint(undefined);
      setBatchNumber(`LOT-MAN-${code.slice(-4)}`);

      setCurrentStep('details_entry');
      });
    }
  };

  // Manual Barcode submit in Camera View
  const handleManualBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualBarcode.trim()) return;
    handleBarcodeDetected(manualBarcode.trim());
  };

  // Details Entry submit (from manual entry)
  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCurrentStep('expiry_entry');
  };

  // Expiry Date submit
  const handleExpirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expiryDate) {
      setExpiryError('Please select a valid expiry date. Barcodes do not store expiry dates.');
      return;
    }
    setExpiryError(null);
    setCurrentStep('review');
  };

  // Quick helper to fill packaging code date if confirmed by user
  const applyPackagingCodeDate = (daysFromNow: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    setExpiryDate(d.toISOString().split('T')[0]);
    setExpiryError(null);
  };

  // Final Review Save
  const handleConfirmSave = () => {
    const saved = saveScannedProduct({
      barcode: scannedBarcode,
      name,
      brand: brand || 'Store Brand',
      category,
      sizeOrQuantity,
      unit,
      quantity: Number(quantity),
      imageUrl: imageUrl || undefined,
      expiryDate,
      notes: notes.trim() || undefined,
      costPrice: Number(costPrice),
      sellingPrice: Number(sellingPrice),
      batchNumber: batchNumber || `SCAN-${scannedBarcode.slice(-4)}`,
      source: productSource
    });

    setCurrentStep('success');
    if (onProductSaved) {
      onProductSaved(saved.id);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-neutral-200/90 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <ScanLine className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-neutral-900">
                Product Barcode Scanner
              </h2>
              <p className="text-[11px] text-neutral-500 font-medium">
                EAN-13 • EAN-8 • UPC-A • UPC-E • Code-128
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Stepper */}
        <div className="px-5 py-2.5 bg-neutral-50 border-b border-neutral-100 flex items-center justify-between text-[11px]">
          <span
            className={`font-semibold ${
              currentStep === 'camera' ? 'text-emerald-700 font-bold' : 'text-neutral-400'
            }`}
          >
            1. Scan Barcode
          </span>
          <span className="text-neutral-300">→</span>
          <span
            className={`font-semibold ${
              currentStep === 'details_entry' ? 'text-emerald-700 font-bold' : 'text-neutral-400'
            }`}
          >
            2. Details
          </span>
          <span className="text-neutral-300">→</span>
          <span
            className={`font-semibold ${
              currentStep === 'expiry_entry' ? 'text-emerald-700 font-bold' : 'text-neutral-400'
            }`}
          >
            3. Expiry Date
          </span>
          <span className="text-neutral-300">→</span>
          <span
            className={`font-semibold ${
              currentStep === 'review' || currentStep === 'success' ? 'text-emerald-700 font-bold' : 'text-neutral-400'
            }`}
          >
            4. Review & Save
          </span>
        </div>

        {/* Step Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {lookupBusy && (
            <div className="mb-3 p-2.5 text-xs font-semibold text-emerald-900 bg-emerald-50 border border-emerald-200 rounded-xl">Looking up product online…</div>
          )}
          {/* STEP 1: CAMERA SCAN SCREEN */}
          {currentStep === 'camera' && (
            <div className="space-y-4">
              {/* Camera Viewfinder */}
              <div className="relative w-full h-64 bg-neutral-950 rounded-2xl overflow-hidden flex items-center justify-center border border-neutral-800">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                />

                {/* Laser scan overlay */}
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6">
                  <div className="w-60 h-36 border-2 border-dashed border-emerald-400 rounded-xl relative flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <div className="w-full h-0.5 bg-red-500 shadow-sm shadow-red-500 animate-pulse"></div>
                    <span className="absolute -bottom-6 text-[10px] text-emerald-300 font-semibold bg-neutral-900/80 px-2 py-0.5 rounded-full">
                      Align Barcode Inside Window
                    </span>
                  </div>
                </div>

                {/* Permission denied or error overlay */}
                {cameraPermission === 'denied' && (
                  <div className="absolute inset-0 bg-neutral-900/90 p-5 flex flex-col items-center justify-center text-center text-white">
                    <AlertCircle className="w-8 h-8 text-amber-400 mb-2" />
                    <p className="text-xs font-semibold mb-3 max-w-xs text-neutral-200">
                      {cameraError || 'Camera permission not granted'}
                    </p>
                    <button
                      onClick={startCamera}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
                    >
                      Retry Camera Access
                    </button>
                  </div>
                )}
              </div>

              {/* Format Error Notice */}
              {barcodeFormatError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{barcodeFormatError}</span>
                </div>
              )}

              {/* Manual Barcode Input Fallback */}
              <form onSubmit={handleManualBarcodeSubmit} className="space-y-2 pt-1">
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider">
                  Or Type Product Barcode Manually
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter 8, 12, or 13-digit barcode (e.g. 8901262010053)"
                    value={manualBarcode}
                    onChange={(e) => setManualBarcode(e.target.value)}
                    className="flex-1 px-3.5 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 font-mono text-neutral-900"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-neutral-900 hover:bg-emerald-600 transition-colors shadow-2xs"
                  >
                    Lookup
                  </button>
                </div>
              </form>

              {/* Quick-Pick Test Barcodes for instant evaluation in demo */}
              <div className="pt-2 border-t border-neutral-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                    Quick-Pick Test Barcodes (Demo Simulator)
                  </span>
                  <span className="text-[10px] text-emerald-700 font-medium">1-Click Scan</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {sampleBarcodes.map((item) => (
                    <button
                      key={item.barcode}
                      type="button"
                      onClick={() => handleBarcodeDetected(item.barcode, item.format)}
                      className="p-2.5 rounded-xl border border-neutral-200 hover:border-emerald-500 hover:bg-emerald-50/50 bg-neutral-50/60 text-left transition-all group"
                    >
                      <div className="text-xs font-bold text-neutral-900 truncate group-hover:text-emerald-700">
                        {item.name}
                      </div>
                      <div className="flex items-center justify-between mt-1 text-[10px] text-neutral-400 font-mono">
                        <span>{item.barcode}</span>
                        <span className="px-1.5 py-0.2 rounded bg-white border border-neutral-200 text-neutral-600 font-sans">
                          {item.format}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: MANUAL PRODUCT DETAILS ENTRY (If not found in database) */}
          {currentStep === 'details_entry' && (
            <form onSubmit={handleDetailsSubmit} className="space-y-4">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Barcode Not in Database:</span> Barcode{' '}
                  <span className="font-mono font-bold">{scannedBarcode}</span> ({detectedFormat}) was scanned. Please enter the product details below to add it to your store.
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Organic Rolled Oats 500g"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Brand / Manufacturer
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Quaker or Saffola"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs border border-neutral-300 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl font-semibold"
                  >
                    {config.categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Pack Size
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 500g or 1L"
                    value={sizeOrQuantity}
                    onChange={(e) => setSizeOrQuantity(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Stock Unit
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl"
                  >
                    {config.units.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Cost Price (₹)
                  </label>
                  <input
                    type="number"
                    value={costPrice}
                    onChange={(e) => setCostPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Selling Price (₹)
                  </label>
                  <input
                    type="number"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep('camera')}
                  className="px-4 py-2 text-xs font-semibold text-neutral-500 hover:text-neutral-900"
                >
                  ← Rescan
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-2xs flex items-center gap-1.5"
                >
                  <span>Continue to Expiry Date</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: MANDATORY EXPIRY DATE ENTRY & USER CONFIRMATION */}
          {currentStep === 'expiry_entry' && (
            <form onSubmit={handleExpirySubmit} className="space-y-4">
              {/* Product Match Header Card */}
              <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200/80 flex items-center gap-3">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={name}
                    className="w-14 h-14 rounded-lg object-cover border border-neutral-200 shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                    <Package className="w-6 h-6" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                      {detectedFormat} Matched
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono">{scannedBarcode}</span>
                  </div>
                  <h3 className="text-sm font-bold text-neutral-900 truncate mt-0.5">{name}</h3>
                  <p className="text-[11px] text-neutral-500">
                    {brand} • {sizeOrQuantity} • Category: {category}
                  </p>
                </div>
              </div>

              {/* Requirement 4 Explanation Alert */}
              <div className="p-3 bg-neutral-100 rounded-xl text-neutral-700 text-xs flex items-start gap-2">
                <Info className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-bold">Expiry Date Verification:</span> Standard product barcodes (EAN/UPC) do not encode expiration dates. Please enter or inspect the stamped expiry date on the physical packaging.
                </div>
              </div>

              {/* Packaging Code Date Hint Helper (If product has stamped code hint) */}
              {packagingCodeDateHint && (
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-bold">Detected Packaging Code Stamp: </span>
                    <span className="font-mono bg-white px-2 py-0.5 rounded border border-emerald-300 font-bold">
                      {packagingCodeDateHint}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => applyPackagingCodeDate(4)}
                      className="px-2.5 py-1 bg-emerald-700 text-white rounded-lg text-[11px] font-bold hover:bg-emerald-800 transition-colors"
                    >
                      Use Stamped Date (Confirm)
                    </button>
                  </div>
                </div>
              )}

              {/* Scan expiry date from a photo (OCR) */}
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                <input
                  ref={ocrInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => handleOcrFile(e.target.files?.[0])}
                />
                <button
                  type="button"
                  disabled={ocrBusy}
                  onClick={() => ocrInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 disabled:opacity-60 transition-colors"
                >
                  <Camera className="w-4 h-4" />
                  {ocrBusy ? 'Reading label…' : 'Scan expiry date from package photo'}
                </button>
                {ocrMsg && <p className="mt-2 text-[11px] text-emerald-950 leading-relaxed">{ocrMsg}</p>}
              </div>

              {/* Expiry Date Input */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Select Product Expiry Date *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={expiryDate}
                    onChange={(e) => {
                      setExpiryDate(e.target.value);
                      setExpiryError(null);
                    }}
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-neutral-300 rounded-xl focus:ring-2 focus:ring-emerald-500 text-neutral-900 font-semibold"
                  />
                </div>
                {expiryError && (
                  <p className="mt-1 text-[11px] text-red-600 font-semibold">{expiryError}</p>
                )}
              </div>

              {/* Quick Preset Buttons for Commercial Convenience */}
              <div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                  Quick Expiry Helpers
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: '3 Days (Fresh Milk/Pastry)', days: 3 },
                    { label: '5 Days (Bread/Dahi)', days: 5 },
                    { label: '14 Days (Dairy)', days: 14 },
                    { label: '1 Month', days: 30 },
                    { label: '6 Months (Packaged)', days: 180 },
                    { label: '1 Year (Canned/Oil)', days: 365 }
                  ].map((preset) => (
                    <button
                      key={preset.days}
                      type="button"
                      onClick={() => applyPackagingCodeDate(preset.days)}
                      className="px-2.5 py-1 text-[11px] font-medium bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg transition-colors"
                    >
                      +{preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity and Batch Code */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Units Received
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="1"
                      required
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl font-bold text-neutral-900"
                    />
                    <span className="text-xs text-neutral-500 font-medium">{unit}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Batch Code
                  </label>
                  <input
                    type="text"
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    placeholder="e.g. LOT-401"
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl font-mono text-neutral-900"
                  />
                </div>
              </div>

              {/* Optional Notes */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                  Optional Shelf / Storage Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chiller rack A, crate 4, received morning shipment"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl"
                />
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep('camera')}
                  className="px-4 py-2 text-xs font-semibold text-neutral-500 hover:text-neutral-900"
                >
                  ← Rescan
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-2xs flex items-center gap-1.5"
                >
                  <span>Review Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 4: REVIEW SCREEN BEFORE SAVING (Requirement 5) */}
          {currentStep === 'review' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Step 4: Please Review & Confirm Before Saving</span>
              </div>

              <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200/80 space-y-3">
                <div className="flex items-start gap-3 pb-3 border-b border-neutral-200/80">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={name}
                      className="w-16 h-16 rounded-xl object-cover border border-neutral-200 shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-neutral-200 flex items-center justify-center shrink-0">
                      <Package className="w-8 h-8 text-neutral-500" />
                    </div>
                  )}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                      {brand} • {category}
                    </span>
                    <h3 className="text-base font-bold text-neutral-900">{name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-mono bg-white px-2 py-0.5 rounded border border-neutral-200 text-neutral-700 font-bold">
                        {scannedBarcode}
                      </span>
                      <span className="text-[10px] text-neutral-500">{detectedFormat}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-2.5 bg-white rounded-xl border border-neutral-200">
                    <span className="text-neutral-400 block text-[10px] font-semibold">EXPIRY DATE</span>
                    <span className="font-extrabold text-red-600 text-sm">{expiryDate}</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-neutral-200">
                    <span className="text-neutral-400 block text-[10px] font-semibold">QUANTITY</span>
                    <span className="font-extrabold text-neutral-900 text-sm">
                      {quantity} {unit}
                    </span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-neutral-200">
                    <span className="text-neutral-400 block text-[10px] font-semibold">BATCH NUMBER</span>
                    <span className="font-mono font-bold text-neutral-800">{batchNumber || 'Auto-Assigned'}</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-neutral-200">
                    <span className="text-neutral-400 block text-[10px] font-semibold">PACK SIZE</span>
                    <span className="font-semibold text-neutral-800">{sizeOrQuantity}</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-neutral-200">
                    <span className="text-neutral-400 block text-[10px] font-semibold">COST PRICE</span>
                    <span className="font-semibold text-neutral-800">₹{costPrice}</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-neutral-200">
                    <span className="text-neutral-400 block text-[10px] font-semibold">SELLING PRICE</span>
                    <span className="font-bold text-emerald-700">₹{sellingPrice}</span>
                  </div>
                </div>

                {notes && (
                  <div className="p-2.5 bg-white rounded-xl border border-neutral-200 text-xs">
                    <span className="text-neutral-400 block text-[10px] font-semibold">NOTES</span>
                    <span className="text-neutral-700 font-medium">{notes}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep('expiry_entry')}
                  className="px-4 py-2 text-xs font-semibold text-neutral-500 hover:text-neutral-900"
                >
                  ← Edit Expiry / Qty
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSave}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm flex items-center gap-1.5 transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm & Save to Inventory</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: SUCCESS CONFIRMATION */}
          {currentStep === 'success' && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-neutral-900">
                  Product Successfully Saved!
                </h3>
                <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                  <span className="font-semibold text-neutral-800">{name}</span> ({quantity} {unit}) has been saved to your business inventory records with expiry date <span className="font-semibold text-red-600">{expiryDate}</span>.
                </p>
              </div>

              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-neutral-600 max-w-sm mx-auto text-left space-y-1">
                <div className="flex justify-between">
                  <span>Barcode:</span>
                  <span className="font-mono font-bold text-neutral-900">{scannedBarcode}</span>
                </div>
                <div className="flex justify-between">
                  <span>Batch:</span>
                  <span className="font-mono text-neutral-800">{batchNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>FEFO Rotation:</span>
                  <span className="font-semibold text-emerald-700">Active in Freshness AI</span>
                </div>
              </div>

              <div className="pt-2 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    resetState();
                    setCurrentStep('camera');
                  }}
                  className="px-4 py-2 text-xs font-bold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors"
                >
                  Scan Another Product
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-2xs"
                >
                  Done & View Inventory
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
