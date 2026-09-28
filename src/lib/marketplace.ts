import type { Product } from '../data/products';
import { SITE } from '../data/site';
import type { CartItem } from '../stores/cart';

export const SHOPEE_SHOP_ID = '1396592299';

export function formatRupiah(num: number): string {
  return 'Rp ' + num.toLocaleString('id-ID');
}

export function getShopeeProductUrl(code: string): string {
  return `https://shopee.co.id/product/${SHOPEE_SHOP_ID}/${encodeURIComponent(code)}`;
}

export function getShopeeStoreUrl(): string {
  return `https://shopee.co.id/shop/${SHOPEE_SHOP_ID}`;
}

export function createSingleProductWhatsAppUrl(product: Product, serviceOption: 'pasang' | 'kirim' = 'pasang'): string {
  const serviceText = serviceOption === 'pasang' ? 'pasang di bengkel Berlin 188' : 'pengiriman ke alamat';
  const message = [
    'Halo Berlin 188 Garage,',
    '',
    `Saya tertarik dengan suku cadang berikut:`,
    `Nama: ${product.name}`,
    `Kode Part: ${product.code}`,
    `Merek: ${product.brand}`,
    `Harga: ${formatRupiah(product.price)}`,
    '',
    `Kebutuhan: Opsi ${serviceText}.`,
    'Mohon konfirmasi ketersediaan stok fisik dan kecocokan dengan nomor rangka (VIN) mobil saya.',
    'Terima kasih.',
  ].join('\n');

  return `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export function createCartWhatsAppUrl(items: CartItem[], vehicleNote: string): string {
  const total = items.reduce((acc, it) => acc + it.product.price * it.quantity, 0);
  const itemsList = items
    .map((item, i) => `${i + 1}. [${item.quantity}x] ${item.product.name} (Kode: ${item.product.code}) - ${formatRupiah(item.product.price * item.quantity)}`)
    .join('\n');

  const noteBlock = vehicleNote.trim()
    ? `\n\nCatatan / No. Rangka (VIN):\n${vehicleNote.trim()}`
    : '';

  const message = [
    'Halo Berlin 188 Garage,',
    '',
    'Saya ingin memesan suku cadang berikut dari katalog website:',
    itemsList,
    noteBlock,
    '',
    `Total Estimasi: ${formatRupiah(total)}`,
    '',
    'Mohon bantuan konfirmasi ketersediaan stok aktual dan opsi pemasangan di bengkel / pengiriman. Terima kasih.',
  ].join('\n');

  return `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

/**
 * Clean styling badges for car manufacturers
 */
export function getBrandBadge(brand: string): { label: string; bg: string; text: string; border: string } {
  const b = brand.toLowerCase();
  if (b.includes('mercedes') || b.includes('mercy')) {
    return { label: 'Mercedes-Benz', bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-300' };
  }
  if (b.includes('bmw')) {
    return { label: 'BMW', bg: 'bg-berlin-blue/10', text: 'text-berlin-blue-dark', border: 'border-berlin-blue/30' };
  }
  if (b.includes('audi')) {
    return { label: 'Audi', bg: 'bg-berlin-red/10', text: 'text-berlin-red', border: 'border-berlin-red/30' };
  }
  if (b.includes('volkswagen') || b.includes('vw')) {
    return { label: 'Volkswagen', bg: 'bg-sky-50', text: 'text-sky-800', border: 'border-sky-300' };
  }
  if (b.includes('mazda')) {
    return { label: 'Mazda', bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-300' };
  }
  return { label: brand, bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' };
}
