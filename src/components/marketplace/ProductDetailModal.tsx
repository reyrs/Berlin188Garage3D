import { useState, useEffect } from 'react';
import {
  X,
  ShoppingCart,
  Check,
  WhatsappLogo,
  ArrowSquareOut,
  ShieldCheck,
  Wrench,
  Truck,
  Copy,
  CheckCircle,
} from '@phosphor-icons/react';
import type { Product } from '../../data/products';
import {
  formatRupiah,
  getShopeeProductUrl,
  createSingleProductWhatsAppUrl,
  getBrandBadge,
} from '../../lib/marketplace';
import { useCart } from '../../stores/cart';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onSelectRelated?: (product: Product) => void;
  relatedProducts?: Product[];
}

export function ProductDetailModal({
  product,
  onClose,
  onSelectRelated,
  relatedProducts = [],
}: ProductDetailModalProps) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [selectedService, setSelectedService] = useState<'pasang' | 'kirim'>('pasang');
  const [imageError, setImageError] = useState(false);
  const addItem = useCart((state) => state.addItem);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (product) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [product, onClose]);

  if (!product) return null;

  const brandBadge = getBrandBadge(product.brand);
  const isReady = product.stock > 0;
  const imageToShow = product.fullImage || product.image;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(product.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 1800);
  };

  const handleAddToCart = () => {
    addItem(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-berlin-blue-dark/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Surface */}
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl transition-all sm:p-8">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors"
          aria-label="Tutup detail suku cadang"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
          {/* Image & Quick Badges */}
          <div className="flex flex-col gap-3">
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center">
              {!imageError && imageToShow ? (
                <img
                  src={imageToShow}
                  alt={product.name}
                  onError={() => setImageError(true)}
                  className="h-full w-full object-cover object-center"
                />
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 p-6 text-center text-slate-400">
                  <Wrench className="h-12 w-12 text-berlin-blue/50" weight="duotone" />
                  <span className="text-xs font-mono">Kode Part: {product.code}</span>
                </div>
              )}

              <div className="absolute top-3 left-3">
                <span
                  className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-bold ${brandBadge.bg} ${brandBadge.text} ${brandBadge.border}`}
                >
                  {brandBadge.label}
                </span>
              </div>
            </div>

            {/* Quick Guarantees */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-2.5 border border-slate-100 text-slate-700">
                <ShieldCheck className="h-4 w-4 text-berlin-blue shrink-0" weight="bold" />
                <span>OES / OEM Terverifikasi</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-2.5 border border-slate-100 text-slate-700">
                <Wrench className="h-4 w-4 text-berlin-blue shrink-0" weight="bold" />
                <span>Bisa Pasang di Bengkel</span>
              </div>
            </div>
          </div>

          {/* Details & Action */}
          <div className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                  {product.category}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    isReady ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${isReady ? 'bg-emerald-600' : 'bg-amber-600'}`} />
                  {isReady ? `Ready Stock (${product.stock} unit)` : 'Indent / Pre-order'}
                </span>
              </div>

              <h2 id="modal-title" className="mt-2 text-xl font-extrabold text-slate-900 leading-snug">
                {product.name}
              </h2>

              <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 p-3 border border-slate-100">
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Kode Part / OES</div>
                  <div className="font-mono text-sm font-bold text-slate-800">{product.code}</div>
                </div>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  {copiedCode ? (
                    <>
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-600" weight="bold" />
                      <span className="text-emerald-700">Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Salin Kode</span>
                    </>
                  )}
                </button>
              </div>

              {product.compatibility && (
                <div className="mt-3 text-xs text-slate-600">
                  <span className="font-bold text-slate-800">Kompatibilitas:</span>{' '}
                  <span>{product.compatibility}</span>
                </div>
              )}

              {/* Service Method Selector */}
              <div className="mt-4">
                <div className="text-xs font-bold text-slate-700 mb-1.5">Pilihan Pemenuhan:</div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedService('pasang')}
                    className={`flex items-center gap-2 rounded-xl p-2.5 text-left border transition-all ${
                      selectedService === 'pasang'
                        ? 'border-berlin-blue bg-berlin-blue/5 text-berlin-blue-dark'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Wrench className="h-4 w-4 shrink-0 text-berlin-blue" weight="bold" />
                    <div>
                      <div className="text-xs font-bold">Pasang di Bengkel</div>
                      <div className="text-[10px] text-slate-500">Cek VIN & pasang presisi</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedService('kirim')}
                    className={`flex items-center gap-2 rounded-xl p-2.5 text-left border transition-all ${
                      selectedService === 'kirim'
                        ? 'border-berlin-blue bg-berlin-blue/5 text-berlin-blue-dark'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Truck className="h-4 w-4 shrink-0 text-berlin-blue" weight="bold" />
                    <div>
                      <div className="text-xs font-bold">Kirim ke Alamat</div>
                      <div className="text-[10px] text-slate-500">Ekspedisi aman terjamin</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Price display */}
              <div className="mt-5 rounded-2xl bg-berlin-blue/5 p-4 border border-berlin-blue/15">
                <div className="text-xs font-medium text-slate-500">Estimasi Harga Part</div>
                <div className="text-2xl font-extrabold text-berlin-blue-dark tracking-tight">
                  {formatRupiah(product.price)}
                </div>
                <div className="mt-1 text-[11px] text-slate-500">
                  Harga part belum termasuk jasa pasang spesifik jika dipasang di bengkel.
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-col gap-2">
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className={`flex items-center justify-center gap-2 rounded-xl py-3 px-4 font-bold text-sm transition-all duration-150 active:scale-98 ${
                    added
                      ? 'bg-emerald-600 text-white'
                      : 'bg-berlin-blue text-white hover:bg-berlin-blue-dark shadow-product'
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="h-5 w-5" weight="bold" />
                      <span>Berhasil Masuk Keranjang</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5" weight="bold" />
                      <span>Tambah ke Keranjang</span>
                    </>
                  )}
                </button>

                <a
                  href={getShopeeProductUrl(product.code)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 hover:bg-slate-100 hover:text-berlin-blue font-bold text-xs gap-1.5 transition-colors"
                >
                  <ArrowSquareOut className="h-4 w-4" />
                  <span>Shopee</span>
                </a>
              </div>

              <a
                href={createSingleProductWhatsAppUrl(product, selectedService)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 transition-colors shadow-xs"
              >
                <WhatsappLogo className="h-5 w-5" weight="fill" />
                <span>Konsultasi Part via WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-8 pt-6 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Suku Cadang Terkait ({product.category})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {relatedProducts.slice(0, 3).map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => onSelectRelated && onSelectRelated(rel)}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 p-2.5 hover:border-berlin-blue/30 hover:bg-slate-50 cursor-pointer transition-all"
                >
                  <div className="h-12 w-12 shrink-0 rounded-lg bg-slate-100 overflow-hidden">
                    <img src={rel.image} alt={rel.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-bold text-slate-800">{rel.name}</div>
                    <div className="text-[11px] font-semibold text-berlin-blue-dark">
                      {formatRupiah(rel.price)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
