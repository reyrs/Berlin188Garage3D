import { Header, type NavLink } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { Showroom } from './components/showroom/Showroom';
import { GarageDoor } from './components/showroom/GarageDoor';
import { Services } from './components/services/Services';
import { useScrollReveal } from './hooks/useScrollReveal';
import { useLenis } from './hooks/useLenis';
import { useReducedMotion } from './hooks/useReducedMotion';

const NAV_LINKS: NavLink[] = [
  { href: '#layanan', label: 'Layanan' },
  { href: '#lokasi', label: 'Lokasi' },
  { href: '/garasi/', label: 'Garasi' },
];

export default function App() {
  const reducedMotion = useReducedMotion();
  useScrollReveal();
  useLenis(reducedMotion);

  return (
    <>
      {/* Parked above the viewport until focused (sr-only/not-sr-only would reset its padding). */}
      <a
        href="#konten"
        className="fixed top-3 left-3 z-[80] inline-flex min-h-11 -translate-y-[200%] items-center rounded-xl bg-berlin-blue px-4 font-semibold text-white shadow-product transition-transform duration-200 focus:translate-y-0"
      >
        Langsung ke konten
      </a>
      <GarageDoor />
      <Header links={NAV_LINKS} />
      <main id="konten" tabIndex={-1} className="outline-none">
        <Showroom />
        <Services />
      </main>
      <Footer />
    </>
  );
}
