import { SITE } from '../data/site';

// Adapted from the main site's shared/src/whatsapp.ts.
function toWhatsAppNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('0')) return `62${digits.slice(1)}`;
  if (digits.startsWith('62')) return digits;
  return `62${digits}`;
}

export function buildWhatsAppLink(phone: string, message: string): string {
  return `https://wa.me/${toWhatsAppNumber(phone)}?text=${encodeURIComponent(message)}`;
}

export const BOOKING_MESSAGE = 'Halo Berlin 188 Garage, saya mau booking servis mobil saya.';

export function bookingLink(message: string = BOOKING_MESSAGE): string {
  return buildWhatsAppLink(SITE.whatsappNumber, message);
}

export function serviceInquiryLink(serviceName: string): string {
  return bookingLink(`Halo Berlin 188 Garage, saya mau tanya layanan ${serviceName}.`);
}
