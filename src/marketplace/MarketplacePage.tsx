import { Header, type NavLink } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { MobileBookingBar } from '../components/layout/MobileBookingBar';
import { MarketplaceView } from '../components/marketplace/MarketplaceView';
import { House, CaretRight } from '@phosphor-icons/react';
import { CATEGORIES, type ProductCategory } from '../data/products';

/** ?kategori=Kaki-Kaki opens the catalogue on that category (linked from /garasi). */
function categoryFromUrl(): ProductCategory | 'Semua' {
  const value = new URLSearchParams(window.location.search).get('kategori');
  return CATEGORIES.find((category) => category === value) ?? 'Semua';
}

const MARKETPLACE_NAV_LINKS: NavLink[] = [
  { href: '/', label: 'Beranda' },
  { href: '/#layanan', label: 'Layanan' },
  { href: '/#promo', label: 'Promo' },
  { href: '/#cek-servis', label: 'Cek Servis' },
  { href: '/marketplace/', label: 'Suku Cadang' },
  { href: '/garasi/', label: 'Garasi 3D' },
  { href: '/#lokasi', label: 'Lokasi' },
];

export function MarketplacePage() {
  return (
    <div className="min-h-screen bg-cloud-white flex flex-col justify-between">
      {/* Header */}
      <Header links={MARKETPLACE_NAV_LINKS} logoHref="/" current="/marketplace/" />

      {/* Main Content Area */}
      <main className="flex-1 pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
          <a href="/" className="inline-flex items-center gap-1 hover:text-berlin-blue transition-colors">
            <House className="h-3.5 w-3.5" />
            <span>Beranda</span>
          </a>
          <CaretRight className="h-3 w-3 text-slate-400" />
          <span className="text-berlin-blue-dark font-bold">Katalog Suku Cadang</span>
        </nav>

        {/* Marketplace Engine */}
        <MarketplaceView showHeaderTitle={true} initialCategory={categoryFromUrl()} />
      </main>

      {/* Footer & Mobile Bar */}
      <Footer />
      <MobileBookingBar />
    </div>
  );
}
