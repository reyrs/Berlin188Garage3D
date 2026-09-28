import { useState } from 'react';
import { ShoppingCart, Check, ArrowSquareOut, Info, Wrench } from '@phosphor-icons/react';
import type { Product } from '../../data/products';
import { formatRupiah, getShopeeProductUrl, getBrandBadge } from '../../lib/marketplace';
import { useCart } from '../../stores/cart';

interface ProductCardProps {
  product: Product;
  onSelectDetail: (product: Product) => void;
}

export function ProductCard({ product, onSelectDetail }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const addItem = useCart((state) => state.addItem);
  const brandBadge = getBrandBadge(product.brand);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1400);
  };

  const handleShopeeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const isReady = product.stock > 0;

  return (
    <div
      onClick={() => onSelectDetail(product)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelectDetail(product);
        }
      }}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-3.5 text-left transition-all duration-200 hover:-translate-y-1 hover:border-berlin-blue/40 hover:shadow-product cursor-pointer focus-visible:outline-2 focus-visible:outline-berlin-blue"
    >
      <div>
        {/* Image Container with 1:1 Aspect Ratio */}
        <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-slate-100 flex items-center justify-center">
          {!imageError && product.image ? (
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
              onError={() => setImageError(true)}
              className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-1.5 p-4 text-center text-slate-400">
              <Wrench className="h-8 w-8 text-berlin-blue/50" weight="duotone" />
              <span className="text-[11px] font-mono text-slate-500">KODE: {product.code}</span>
            </div>
          )}

          {/* Badges Over Image */}
          <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1">
            <span
              className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-bold tracking-tight ${brandBadge.bg} ${brandBadge.text} ${brandBadge.border}`}
            >
              {brandBadge.label}
            </span>
          </div>

          {/* Stock Indicator */}
          <div className="absolute top-2.5 right-2.5">
            <span
              className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium backdrop-blur-md shadow-xs ${
                isReady
                  ? 'bg-emerald-500/90 text-white'
                  : 'bg-slate-700/80 text-white'
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${isReady ? 'bg-white' : 'bg-amber-400'}`} />
              {isReady ? `Stok ${product.stock}` : 'Indent'}
            </span>
          </div>
        </div>

        {/* Content Meta */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span className="font-mono font-medium">KD: {product.code}</span>
            <span className="truncate max-w-[120px] font-medium text-slate-600">{product.category}</span>
          </div>

          <h3 className="mt-1 line-clamp-2 min-h-[2.5rem] text-[0.875rem] font-bold leading-snug text-slate-900 group-hover:text-berlin-blue transition-colors">
            {product.name}
          </h3>

          {product.compatibility && (
            <p className="mt-1 truncate text-[11px] text-slate-500" title={product.compatibility}>
              <span className="font-semibold text-slate-700">Cocok:</span> {product.compatibility}
            </p>
          )}
        </div>
      </div>

      {/* Bottom Price & Actions */}
      <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-col gap-2.5">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Harga Part</span>
            <div className="text-[1.0625rem] font-extrabold text-berlin-blue-dark tracking-tight">
              {formatRupiah(product.price)}
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectDetail(product);
            }}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-berlin-blue hover:text-berlin-blue-dark hover:underline"
          >
            <Info className="h-3.5 w-3.5" />
            Detail
          </button>
        </div>

        <div className="grid grid-cols-[1fr_auto] gap-1.5">
          <button
            type="button"
            onClick={handleAddToCart}
            className={`flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all duration-150 active:scale-95 ${
              justAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-berlin-blue text-white hover:bg-berlin-blue-dark shadow-xs'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="h-4 w-4" weight="bold" />
                <span>Masuk Keranjang</span>
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4" weight="bold" />
                <span>+ Keranjang</span>
              </>
            )}
          </button>

          <a
            href={getShopeeProductUrl(product.code)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleShopeeClick}
            title="Lihat di Shopee Berlin 188 Garage"
            className="flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-2.5 text-slate-700 hover:bg-slate-100 hover:text-berlin-blue transition-colors"
          >
            <ArrowSquareOut className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
