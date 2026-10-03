import { useEffect } from 'react';
import {
  X,
  ShoppingCart,
  Trash,
  Plus,
  Minus,
  WhatsappLogo,
  ArrowSquareOut,
  ShieldCheck,
} from '@phosphor-icons/react';
import { useCart } from '../../stores/cart';
import { formatRupiah, getShopeeStoreUrl, createCartWhatsAppUrl } from '../../lib/marketplace';

export function CartDrawer() {
  const {
    items,
    isOpen,
    setIsOpen,
    updateQuantity,
    removeItem,
    clearCart,
    vehicleNote,
    setVehicleNote,
    totalCount,
    totalPrice,
  } = useCart();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, setIsOpen]);

  if (!isOpen) return null;

  const total = totalPrice();
  const count = totalCount();

  const handleWhatsAppOrder = () => {
    const url = createCartWhatsAppUrl(items, vehicleNote);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Keranjang belanja suku cadang"
      className="fixed inset-0 z-50 flex justify-end"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-berlin-blue-dark/50 backdrop-blur-xs transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      {/* Slide-over panel */}
      <div className="relative w-full max-w-md bg-white shadow-2xl h-full flex flex-col z-10 border-l border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-berlin-blue/10 text-berlin-blue">
              <ShoppingCart className="h-5 w-5" weight="bold" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 leading-tight">Keranjang Suku Cadang</h2>
              <div className="text-xs text-slate-500 font-medium">
                {count > 0 ? `${count} item terpilih` : 'Keranjang masih kosong'}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition-colors"
            aria-label="Tutup keranjang"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center py-12">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-3">
                <ShoppingCart className="h-8 w-8" weight="duotone" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">Belum ada suku cadang dipilih</h3>
              <p className="mt-1 text-xs text-slate-500 max-w-[240px]">
                Pilih suku cadang dari katalog kami untuk konsultasi kecocokan nomor rangka atau pemesanan langsung.
              </p>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-slate-100">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="py-4 flex gap-3.5 items-start">
                  <div className="h-16 w-16 shrink-0 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-1">
                      <div className="min-w-0">
                        <div className="text-[10px] font-mono text-slate-400">KD: {product.code}</div>
                        <h4 className="line-clamp-2 text-xs font-bold text-slate-900 leading-snug">
                          {product.name}
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(product.id)}
                        className="p-1 text-slate-400 hover:text-berlin-red transition-colors"
                        title="Hapus dari keranjang"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between">
                      <div className="text-xs font-extrabold text-berlin-blue-dark">
                        {formatRupiah(product.price * quantity)}
                      </div>

                      {/* Quantity Stepper */}
                      <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50">
                        <button
                          type="button"
                          onClick={() => updateQuantity(product.id, -1)}
                          className="flex h-7 w-7 items-center justify-center text-slate-600 hover:bg-slate-200 rounded-l-lg transition-colors"
                          aria-label="Kurangi jumlah"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-slate-800">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(product.id, 1)}
                          className="flex h-7 w-7 items-center justify-center text-slate-600 hover:bg-slate-200 rounded-r-lg transition-colors"
                          aria-label="Tambah jumlah"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Area */}
        {items.length > 0 && (
          <div className="border-t border-slate-200 bg-slate-50/90 p-5 flex flex-col gap-3.5">
            {/* Vehicle / VIN Note Field */}
            <div>
              <label htmlFor="vehicle-note" className="block text-xs font-bold text-slate-700 mb-1">
                Catatan Mobil / Nomor Rangka (VIN)
              </label>
              <input
                id="vehicle-note"
                type="text"
                placeholder="Contoh: BMW E90 320i 2011 / VIN WBA..."
                value={vehicleNote}
                onChange={(e) => setVehicleNote(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-berlin-blue focus:outline-hidden"
              />
              <p className="mt-1 text-[11px] text-slate-500">
                Teknisi Berlin 188 akan mencocokkan nomor part dengan nomor rangka mobil Anda.
              </p>
            </div>

            {/* Total calculation */}
            <div className="flex items-baseline justify-between pt-2 border-t border-slate-200">
              <span className="text-xs font-semibold text-slate-500">Total Estimasi Part</span>
              <span className="text-lg font-extrabold text-berlin-blue-dark">
                {formatRupiah(total)}
              </span>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleWhatsAppOrder}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-berlin-blue py-3 px-4 text-sm font-bold text-white shadow-xs hover:bg-berlin-blue-dark transition-colors"
              >
                <WhatsappLogo className="h-5 w-5" weight="fill" />
                <span>Pesan / Konfirmasi via WhatsApp</span>
              </button>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-slate-400 hover:text-berlin-red transition-colors"
                >
                  Kosongkan keranjang
                </button>

                <a
                  href={getShopeeStoreUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-berlin-blue hover:underline"
                >
                  <span>Kunjungi Toko Shopee</span>
                  <ArrowSquareOut className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>

            {/* Trust footer note */}
            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
              <ShieldCheck className="h-4 w-4 text-berlin-blue" />
              <span>Pemeriksaan kompatibilitas gratis sebelum transaksi</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
