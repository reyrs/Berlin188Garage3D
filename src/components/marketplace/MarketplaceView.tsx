import { useState, useMemo, useRef } from 'react';
import {
  MagnifyingGlass,
  X,
  CaretLeft,
  CaretRight,
  ShoppingCart,
  WhatsappLogo,
  ArrowCounterClockwise,
  Package,
} from '@phosphor-icons/react';
import { PRODUCTS, CATEGORIES, type Product, type ProductCategory } from '../../data/products';
import { ProductCard } from './ProductCard';
import { ProductDetailModal } from './ProductDetailModal';
import { CartDrawer } from './CartDrawer';
import { useCart } from '../../stores/cart';
import { getShopeeStoreUrl } from '../../lib/marketplace';
import { SITE } from '../../data/site';

const ITEMS_PER_PAGE = 24;

interface MarketplaceViewProps {
  initialCategory?: ProductCategory | 'Semua';
  initialBrand?: string | null;
  showHeaderTitle?: boolean;
}

export function MarketplaceView({
  initialCategory = 'Semua',
  initialBrand = null,
  showHeaderTitle = true,
}: MarketplaceViewProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'Semua'>(initialCategory);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(initialBrand);
  const [onlyReadyStock, setOnlyReadyStock] = useState(false);
  const [priceFilter, setPriceFilter] = useState<'all' | 'under500k' | '500k-2m' | 'above2m'>('all');
  const [sortOption, setSortOption] = useState<'default' | 'price_asc' | 'price_desc' | 'name_asc'>('default');
  const [currentPage, setCurrentPage] = useState(1);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);

  const { setIsOpen: setIsCartOpen, totalCount } = useCart();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const topAnchorRef = useRef<HTMLDivElement>(null);

  // Brands list from products
  const brandsList = useMemo(() => {
    const set = new Set<string>();
    PRODUCTS.forEach((p) => {
      if (p.brand) set.add(p.brand);
    });
    return Array.from(set).sort();
  }, []);

  // Top prominent automotive makes
  const primaryBrands = ['Mercedes', 'BMW', 'Audi', 'Volkswagen', 'Mazda'];

  // Counts per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { Semua: PRODUCTS.length };
    CATEGORIES.forEach((cat) => {
      counts[cat] = 0;
    });
    PRODUCTS.forEach((p) => {
      if (counts[p.category] !== undefined) {
        counts[p.category] += 1;
      }
    });
    return counts;
  }, []);

  // Filtered products calculation
  const filteredProducts = useMemo(() => {
    let result = PRODUCTS;

    // Category
    if (selectedCategory !== 'Semua') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Brand
    if (selectedBrand) {
      result = result.filter((p) => p.brand.toLowerCase() === selectedBrand.toLowerCase());
    }

    // Ready stock
    if (onlyReadyStock) {
      result = result.filter((p) => p.stock > 0);
    }

    // Price
    if (priceFilter === 'under500k') {
      result = result.filter((p) => p.price < 500000);
    } else if (priceFilter === '500k-2m') {
      result = result.filter((p) => p.price >= 500000 && p.price <= 2000000);
    } else if (priceFilter === 'above2m') {
      result = result.filter((p) => p.price > 2000000);
    }

    // Search query
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          (p.compatibility && p.compatibility.toLowerCase().includes(q))
      );
    }

    // Sorting
    if (sortOption === 'price_asc') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortOption === 'price_desc') {
      result = [...result].sort((a, b) => b.price - a.price);
    } else if (sortOption === 'name_asc') {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [selectedCategory, selectedBrand, onlyReadyStock, priceFilter, search, sortOption]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const hasActiveFilters = Boolean(
    selectedCategory !== 'Semua' ||
      selectedBrand !== null ||
      onlyReadyStock ||
      priceFilter !== 'all' ||
      search.trim() !== '' ||
      sortOption !== 'default'
  );

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('Semua');
    setSelectedBrand(null);
    setOnlyReadyStock(false);
    setPriceFilter('all');
    setSortOption('default');
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      if (topAnchorRef.current) {
        topAnchorRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  // Related products for detail modal
  const relatedProducts = useMemo(() => {
    if (!detailProduct) return [];
    return PRODUCTS.filter(
      (p) =>
        p.id !== detailProduct.id &&
        (p.category === detailProduct.category || p.brand === detailProduct.brand)
    ).slice(0, 3);
  }, [detailProduct]);

  return (
    <div ref={topAnchorRef} className="w-full">
      {/* Marketplace Header */}
      {showHeaderTitle && (
        <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-berlin-blue">
              <Package className="h-4 w-4" weight="bold" />
              <span>Suku Cadang & Komponen OES</span>
            </div>
            <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Katalog Spare Part Berlin 188 Garage
            </h1>
            <p className="mt-1 text-sm text-slate-600 max-w-2xl">
              1.107+ komponen original dan OEM untuk BMW, Mercedes-Benz, Audi, Volkswagen, dan mobil Eropa lainnya.
              Didukung opsi pasang di bengkel dan pengecekan nomor rangka (VIN).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-berlin-blue px-4 py-2.5 text-xs font-bold text-white shadow-product hover:bg-berlin-blue-dark transition-all"
            >
              <ShoppingCart className="h-4 w-4" weight="bold" />
              <span>Keranjang ({totalCount()})</span>
            </button>

            <a
              href={getShopeeStoreUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <span>Shopee Official</span>
            </a>
          </div>
        </div>
      )}

      {/* Control Bar: Search & Primary Brand Filters */}
      <div className="flex flex-col gap-4 rounded-2xl bg-white p-4 border border-slate-200 shadow-xs sm:p-5">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <MagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari part number, nama komponen, atau tipe mobil (mis: W221, E90, Audi Q7)..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-10 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-berlin-blue focus:outline-hidden transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setCurrentPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                aria-label="Hapus pencarian"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 hidden sm:inline">Urutkan:</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as any)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs font-semibold text-slate-700 focus:border-berlin-blue focus:outline-hidden"
            >
              <option value="default">Rekomendasi</option>
              <option value="price_asc">Harga Terendah</option>
              <option value="price_desc">Harga Tertinggi</option>
              <option value="name_asc">Nama (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Brand Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-500 mr-1.5">Merek:</span>
          <button
            type="button"
            onClick={() => {
              setSelectedBrand(null);
              setCurrentPage(1);
            }}
            className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
              selectedBrand === null
                ? 'bg-berlin-blue text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua
          </button>
          {primaryBrands.map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => {
                setSelectedBrand(selectedBrand === b ? null : b);
                setCurrentPage(1);
              }}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                selectedBrand === b
                  ? 'bg-berlin-blue text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {b === 'Mercedes' ? 'Mercedes-Benz' : b}
            </button>
          ))}

          {/* More Brands Selector */}
          <div className="ml-auto flex items-center gap-2">
            <select
              value={selectedBrand && !primaryBrands.includes(selectedBrand) ? selectedBrand : ''}
              onChange={(e) => {
                if (e.target.value) {
                  setSelectedBrand(e.target.value);
                  setCurrentPage(1);
                }
              }}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-600"
            >
              <option value="">Merek Lainnya...</option>
              {brandsList
                .filter((b) => !primaryBrands.includes(b))
                .map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>

      {/* Category Pills Bar (Horizontal Scrollable) */}
      <div className="mt-4 flex items-center gap-2 overflow-x-auto scroll-row pb-2">
        <button
          type="button"
          onClick={() => {
            setSelectedCategory('Semua');
            setCurrentPage(1);
          }}
          className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all ${
            selectedCategory === 'Semua'
              ? 'bg-berlin-blue-dark text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:border-berlin-blue/30 hover:bg-slate-50'
          }`}
        >
          <span>Semua Kategori</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedCategory === 'Semua' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
            {categoryCounts['Semua']}
          </span>
        </button>

        {CATEGORIES.map((cat) => {
          const count = categoryCounts[cat] || 0;
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setSelectedCategory(cat);
                setCurrentPage(1);
              }}
              className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all ${
                isSelected
                  ? 'bg-berlin-blue-dark text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:border-berlin-blue/30 hover:bg-slate-50'
              }`}
            >
              <span>{cat}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Secondary Bar: Stock Toggle, Price Filters, Results Count */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
        <div className="flex flex-wrap items-center gap-3">
          {/* Ready Stock Checkbox */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={onlyReadyStock}
              onChange={(e) => {
                setOnlyReadyStock(e.target.checked);
                setCurrentPage(1);
              }}
              className="h-4 w-4 rounded-sm border-slate-300 text-berlin-blue focus:ring-berlin-blue cursor-pointer"
            />
            <span className="font-bold text-slate-800">Hanya Ready Stock</span>
          </label>

          <span className="text-slate-300">|</span>

          {/* Price Filters */}
          <div className="flex items-center gap-1">
            <span className="font-semibold text-slate-500">Harga:</span>
            {(
              [
                ['all', 'Semua'],
                ['under500k', '< 500rb'],
                ['500k-2m', '500rb - 2jt'],
                ['above2m', '> 2jt'],
              ] as const
            ).map(([val, label]) => (
              <button
                key={val}
                type="button"
                onClick={() => {
                  setPriceFilter(val);
                  setCurrentPage(1);
                }}
                className={`rounded-md px-2 py-0.5 text-[11px] font-semibold transition-all ${
                  priceFilter === val
                    ? 'bg-slate-800 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="font-semibold text-slate-600">
            Menampilkan <span className="font-extrabold text-berlin-blue-dark">{filteredProducts.length}</span> suku cadang
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1 font-bold text-berlin-red hover:underline"
            >
              <ArrowCounterClockwise className="h-3.5 w-3.5" />
              <span>Reset Filter</span>
            </button>
          )}
        </div>
      </div>

      {/* Products Grid */}
      <div className="mt-6">
        {paginatedProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {paginatedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelectDetail={(p) => setDetailProduct(p)}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="my-12 flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-berlin-blue/10 text-berlin-blue mb-4">
              <Package className="h-8 w-8" weight="duotone" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Suku cadang tidak ditemukan</h3>
            <p className="mt-1 max-w-md text-sm text-slate-500">
              Tidak ada part yang cocok dengan filter atau kata kunci Anda. Anda dapat menghubungi teknisi kami untuk
              pengecekan stok gudang offline atau opsi indent part Eropa.
            </p>
            <div className="mt-5 flex flex-wrap gap-3 justify-center">
              <button
                type="button"
                onClick={resetFilters}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                Reset Semua Filter
              </button>
              <a
                href={`https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(
                  `Halo Berlin 188 Garage, saya mencari spare part dengan kata kunci "${search}" untuk mobil saya. Mohon bantuan ketersediaannya.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-berlin-blue px-4 py-2.5 text-xs font-bold text-white hover:bg-berlin-blue-dark shadow-xs"
              >
                <WhatsappLogo className="h-4 w-4" weight="fill" />
                <span>Tanya Part via WhatsApp</span>
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2 pb-6">
          <button
            type="button"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex h-9 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            <CaretLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Sebelumnya</span>
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => handlePageChange(pageNum)}
                  className={`h-9 w-9 rounded-xl text-xs font-extrabold transition-all ${
                    currentPage === pageNum
                      ? 'bg-berlin-blue text-white shadow-xs'
                      : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex h-9 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            <span className="hidden sm:inline">Berikutnya</span>
            <CaretRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Floating Cart Button */}
      <button
        type="button"
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 rounded-full bg-berlin-blue py-3 px-5 text-white shadow-float hover:bg-berlin-blue-dark transition-all duration-200 hover:scale-105 active:scale-95"
        aria-label="Buka keranjang belanja"
      >
        <ShoppingCart className="h-5 w-5" weight="bold" />
        <span className="text-xs font-bold">Keranjang</span>
        {totalCount() > 0 && (
          <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-berlin-red px-1.5 text-[11px] font-extrabold text-white">
            {totalCount()}
          </span>
        )}
      </button>

      {/* Detail Modal */}
      <ProductDetailModal
        product={detailProduct}
        onClose={() => setDetailProduct(null)}
        onSelectRelated={(p) => setDetailProduct(p)}
        relatedProducts={relatedProducts}
      />

      {/* Cart Drawer */}
      <CartDrawer />
    </div>
  );
}
