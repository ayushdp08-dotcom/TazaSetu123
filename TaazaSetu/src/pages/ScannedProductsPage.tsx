import React, { useState } from 'react';
import {
  ScanLine,
  Search,
  Filter,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Edit2,
  Package,
  Layers,
  ArrowRight,
  Plus,
  Clock,
  Sparkles,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ScannedProduct } from '../types';
import { BarcodeScannerModal } from '../components/BarcodeScannerModal';

export const ScannedProductsPage: React.FC = () => {
  const {
    scannedProducts,
    updateScannedProduct,
    deleteScannedProduct,
    selectedBusinessType
  } = useApp();

  const [scannerOpen, setScannerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'urgent' | 'valid' | 'expired'>('all');
  const [editProduct, setEditProduct] = useState<ScannedProduct | null>(null);

  const today = new Date('2026-10-17').getTime();

  // Helper to evaluate expiry urgency status
  const getExpiryStatus = (expiryDateStr: string) => {
    const expTime = new Date(expiryDateStr).getTime();
    const daysLeft = Math.ceil((expTime - today) / 86400000);

    if (daysLeft < 0) {
      return {
        label: `Expired (${Math.abs(daysLeft)}d ago)`,
        urgency: 'expired' as const,
        badgeClass: 'bg-red-100 text-red-800 border-red-200',
        daysLeft
      };
    } else if (daysLeft <= 3) {
      return {
        label: daysLeft === 0 ? 'Expires Today' : `Expires in ${daysLeft}d (Soon)`,
        urgency: 'urgent' as const,
        badgeClass: 'bg-amber-100 text-amber-900 border-amber-300 font-bold',
        daysLeft
      };
    } else {
      return {
        label: `${daysLeft} Days Remaining`,
        urgency: 'valid' as const,
        badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        daysLeft
      };
    }
  };

  // Filtered List
  const filteredList = scannedProducts.filter((item) => {
    const status = getExpiryStatus(item.expiryDate);
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.barcode.includes(searchTerm) ||
      item.brand.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (filterStatus === 'urgent') return status.urgency === 'urgent';
    if (filterStatus === 'expired') return status.urgency === 'expired';
    if (filterStatus === 'valid') return status.urgency === 'valid';
    return true;
  });

  const handleEditSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProduct) return;
    updateScannedProduct(editProduct.id, {
      name: editProduct.name,
      brand: editProduct.brand,
      quantity: editProduct.quantity,
      expiryDate: editProduct.expiryDate,
      notes: editProduct.notes,
      batchNumber: editProduct.batchNumber
    });
    setEditProduct(null);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Remove "${name}" from scanned barcode inventory?`)) {
      deleteScannedProduct(id);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800">
              Barcode Module Active
            </span>
            <span className="text-xs text-neutral-400">•</span>
            <span className="text-xs text-neutral-500">{scannedProducts.length} Items Scanned</span>
          </div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight">
            Scanned Barcode Inventory & Expiry
          </h1>
          <p className="text-xs text-neutral-600 mt-1 max-w-xl">
            Live barcode inventory records. Track exact expiry dates, review soon-to-expire alerts, and edit or write off products.
          </p>
        </div>

        <button
          onClick={() => setScannerOpen(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all self-start sm:self-auto"
        >
          <ScanLine className="w-4 h-4" />
          <span>Scan Product Barcode</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by product name, barcode, brand..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-neutral-50/50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 text-neutral-900"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: `All Scanned (${scannedProducts.length})` },
            { id: 'urgent', label: 'Expires Soon (≤ 3 Days)' },
            { id: 'valid', label: 'Safe Shelf Life' },
            { id: 'expired', label: 'Expired' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                filterStatus === tab.id
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Scanned Items Table */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-2xs overflow-hidden">
        {filteredList.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Package className="w-10 h-10 text-neutral-300 mx-auto" />
            <h3 className="text-sm font-bold text-neutral-900">No Scanned Products Found</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              Scan product packaging using your device camera or tap below to scan a test product.
            </p>
            <button
              onClick={() => setScannerOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-2xs"
            >
              <ScanLine className="w-4 h-4" />
              <span>Open Scanner</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 text-neutral-500 font-bold uppercase tracking-wider border-b border-neutral-200">
                <tr>
                  <th className="py-3 px-4">Product & Barcode</th>
                  <th className="py-3 px-4">Brand / Category</th>
                  <th className="py-3 px-4">Quantity / Unit</th>
                  <th className="py-3 px-4">Batch Number</th>
                  <th className="py-3 px-4">Expiry Date</th>
                  <th className="py-3 px-4">Expiry Status</th>
                  <th className="py-3 px-4">Date Scanned</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredList.map((item) => {
                  const status = getExpiryStatus(item.expiryDate);

                  return (
                    <tr key={item.id} className="hover:bg-neutral-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-10 h-10 rounded-lg object-cover border border-neutral-200 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-neutral-100 text-neutral-500 flex items-center justify-center shrink-0">
                              <Package className="w-5 h-5" />
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-neutral-900">{item.name}</div>
                            <div className="text-[10px] text-neutral-500 font-mono mt-0.5">
                              {item.barcode}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-neutral-800">{item.brand}</div>
                        <div className="text-[10px] text-neutral-400">{item.category}</div>
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-neutral-900">
                        {item.quantity} {item.unit}
                        <div className="text-[10px] text-neutral-400 font-normal">Pack: {item.sizeOrQuantity}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-neutral-700">
                        {item.batchNumber || 'Auto-Assigned'}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-neutral-900">
                        {item.expiryDate}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] border ${status.badgeClass}`}
                        >
                          {status.urgency === 'urgent' && <AlertTriangle className="w-3 h-3 text-amber-600" />}
                          {status.urgency === 'expired' && <AlertTriangle className="w-3 h-3 text-red-600" />}
                          {status.urgency === 'valid' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                          <span>{status.label}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-neutral-400 font-mono text-[11px]">
                        {item.scanDate}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setEditProduct(item)}
                            title="Edit Product Details"
                            className="p-1.5 text-neutral-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id, item.name)}
                            title="Delete Scanned Product"
                            className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

      {/* Edit Scanned Product Modal (Requirement 7) */}
      {editProduct && (
        <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-neutral-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-neutral-900">Edit Scanned Product</h3>
              <button
                onClick={() => setEditProduct(null)}
                className="p-1 text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSave} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={editProduct.name}
                  onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Brand</label>
                  <input
                    type="text"
                    value={editProduct.brand}
                    onChange={(e) => setEditProduct({ ...editProduct, brand: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Quantity ({editProduct.unit})</label>
                  <input
                    type="number"
                    min="1"
                    value={editProduct.quantity}
                    onChange={(e) =>
                      setEditProduct({ ...editProduct, quantity: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    required
                    value={editProduct.expiryDate}
                    onChange={(e) =>
                      setEditProduct({ ...editProduct, expiryDate: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Batch Code</label>
                  <input
                    type="text"
                    value={editProduct.batchNumber || ''}
                    onChange={(e) =>
                      setEditProduct({ ...editProduct, batchNumber: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Notes</label>
                <input
                  type="text"
                  value={editProduct.notes || ''}
                  onChange={(e) =>
                    setEditProduct({ ...editProduct, notes: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditProduct(null)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Barcode Scanner Modal */}
      <BarcodeScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
      />
    </div>
  );
};
