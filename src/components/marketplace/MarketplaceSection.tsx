import { useState, useMemo } from 'react';
import {
  ArrowRight,
  Package,
  Wrench,
  ShieldCheck,
  WhatsappLogo,
  ArrowSquareOut,
} from '@phosphor-icons/react';
import { PRODUCTS, type Product, type ProductCategory } from '../../data/products';
import { ProductCard } from './ProductCard';
import { ProductDetailModal } from './ProductDetailModal';
import { CartDrawer } from './CartDrawer';
import { SITE } from '../../data/site';
import { getShopeeStoreUrl } from '../../lib/marketplace';

const FEATURED_CATEGORIES: { label: ProductCategory; desc: string }[] = [
  { label: 'Kaki-Kaki', desc: 'Air sus, control arm, bushing' },
  { label: 'Mesin', desc: 'Gasket, sensor, timing, belt' },
  { label: 'Rem', desc: 'Brake pad, rotor, kaliper' },
  { label: 'Kelistrikan', desc: 'Modul ECU, alternator, koil' },
  { label: 'Body & Eksterior', desc: 'Bumper, spion, headlamp' },
  { label: 'Filter & AC', desc: 'Cabin filter, dryer, kompresor' },
];

export function MarketplaceSection() {
  const [activeCategory, setActiveCategory] = useState<ProductCategory | 'Semua'>('Semua');
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);

  // Pick high-interest featured items with real images and ready stock
  const featuredProducts = useMemo(() => {
    let pool = PRODUCTS.filter((p) => p.image && !p.image.includes('placeholder'));
    if (activeCategory !== 'Semua') {
      pool = pool.filter((p) => p.category === activeCategory);
    }
    // Take first 8 high-relevance items
    return pool.slice(0, 8);
  }, [activeCategory]);

  const relatedProducts = useMemo(() => {
    if (!detailProduct) return [];
    return PRODUCTS.filter(
      (p) =>
        p.id !== detailProduct.id &&
        (p.category === detailProduct.category || p.brand === detailProduct.brand)
    ).slice(0, 3);
  }, [detailProduct]);

  return (
    <section id="marketplace" className="relative bg-cloud-white py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-200">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 pb-8 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-berlin-blue">
              <Package className="h-4 w-4" weight="bold" />
              <span>Suku Cadang & Komponen</span>
            </div>
            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Katalog Spare Part Eropa
            </h2>
            <p className="mt-2 max-w-2xl text-base text-slate-600">
              Suku cadang original dan OES untuk Mercedes-Benz, BMW, Audi, dan Volkswagen.
              Tersedia opsi pemasangan langsung di bengkel dengan pengecekan nomor rangka (VIN).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="/marketplace/"
              className="inline-flex items-center gap-2 rounded-xl bg-berlin-blue px-5 py-3 text-sm font-bold text-white shadow-product hover:bg-berlin-blue-dark transition-all duration-200"
            >
              <span>Buka Seluruh Katalog (1.100+ Part)</span>
              <ArrowRight className="h-4 w-4" />
            </a>

            <a
              href={getShopeeStoreUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <span>Shopee Official</span>
              <ArrowSquareOut className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Value Highlights */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 rounded-2xl bg-white p-4 border border-slate-200 shadow-xs">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-berlin-blue/10 text-berlin-blue">
              <ShieldCheck className="h-6 w-6" weight="duotone" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Verifikasi VIN / Rangka</div>
              <div className="text-[11px] text-slate-500">Kecocokan part diperiksa sebelum pasang</div>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-white p-4 border border-slate-200 shadow-xs">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-berlin-blue/10 text-berlin-blue">
              <Wrench className="h-6 w-6" weight="duotone" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Jasa Pasang di Bengkel</div>
              <div className="text-[11px] text-slate-500">Peralatan scanner & tools khusus Eropa</div>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-white p-4 border border-slate-200 shadow-xs">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-berlin-blue/10 text-berlin-blue">
              <WhatsappLogo className="h-6 w-6 text-emerald-600" weight="duotone" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Konsultasi Part Langsung</div>
              <div className="text-[11px] text-slate-500">Tanya ketersediaan stok via WhatsApp</div>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="mt-8 flex items-center gap-2 overflow-x-auto scroll-row pb-2">
          <button
            type="button"
            onClick={() => setActiveCategory('Semua')}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-all ${
              activeCategory === 'Semua'
                ? 'bg-berlin-blue-dark text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Semua Pilihan
          </button>
          {FEATURED_CATEGORIES.map((cat) => (
            <button
              key={cat.label}
              type="button"
              onClick={() => setActiveCategory(cat.label)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-all ${
                activeCategory === cat.label
                  ? 'bg-berlin-blue-dark text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Featured Products Grid */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelectDetail={(p) => setDetailProduct(p)}
            />
          ))}
        </div>

        {/* Bottom Banner to Full Catalog */}
        <div className="mt-12 rounded-3xl bg-berlin-blue-dark text-white p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <span className="inline-block rounded-md bg-white/10 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-cloud-white">
              Gudang Suku Cadang Berlin 188
            </span>
            <h3 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight">
              Mencari spare part khusus yang belum terdaftar?
            </h3>
            <p className="mt-2 text-sm text-cloud-white/80 max-w-xl">
              Kami melayani pengadaan part langka (indent) langsung dari jaringan distributor resmi di Jerman dan Eropa.
              Kirimkan foto part lama atau nomor rangka (VIN) mobil Anda.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap gap-3 shrink-0">
            <a
              href="/marketplace/"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-bold text-berlin-blue-dark shadow-product hover:bg-slate-100 transition-colors"
            >
              <span>Jelajahi 1.100+ Suku Cadang</span>
              <ArrowRight className="h-4 w-4" />
            </a>

            <a
              href={`https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(
                'Halo Berlin 188 Garage, saya sedang mencari suku cadang mobil Eropa saya yang belum terdaftar di website. Mohon bantuannya.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-xs font-bold text-white hover:bg-emerald-700 transition-colors shadow-xs"
            >
              <WhatsappLogo className="h-4 w-4" weight="fill" />
              <span>Tanya Teknisi via WA</span>
            </a>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <ProductDetailModal
        product={detailProduct}
        onClose={() => setDetailProduct(null)}
        onSelectRelated={(p) => setDetailProduct(p)}
        relatedProducts={relatedProducts}
      />

      {/* Cart Drawer */}
      <CartDrawer />
    </section>
  );
}
