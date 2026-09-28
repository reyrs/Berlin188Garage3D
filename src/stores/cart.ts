import { create } from 'zustand';
import type { Product } from '../data/products';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  vehicleNote: string;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, delta: number) => void;
  clearCart: () => void;
  setIsOpen: (isOpen: boolean) => void;
  setVehicleNote: (note: string) => void;
  totalCount: () => number;
  totalPrice: () => number;
}

const STORAGE_KEY = 'b188_cart_items_v1';
const NOTE_STORAGE_KEY = 'b188_cart_note_v1';

function loadInitialItems(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function loadInitialNote(): string {
  if (typeof window === 'undefined') return '';
  try {
    return localStorage.getItem(NOTE_STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

function saveItems(items: CartItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Ignore storage quota or access errors
  }
}

function saveNote(note: string) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(NOTE_STORAGE_KEY, note);
  } catch {
    // Ignore
  }
}

export const useCart = create<CartState>((set, get) => ({
  items: loadInitialItems(),
  isOpen: false,
  vehicleNote: loadInitialNote(),

  addItem: (product, quantity = 1) => {
    set((state) => {
      const idx = state.items.findIndex((it) => it.product.id === product.id);
      let next: CartItem[];
      if (idx >= 0) {
        next = state.items.map((it, i) =>
          i === idx ? { ...it, quantity: it.quantity + quantity } : it
        );
      } else {
        next = [...state.items, { product, quantity }];
      }
      saveItems(next);
      return { items: next, isOpen: true };
    });
  },

  removeItem: (productId) => {
    set((state) => {
      const next = state.items.filter((it) => it.product.id !== productId);
      saveItems(next);
      return { items: next };
    });
  },

  updateQuantity: (productId, delta) => {
    set((state) => {
      const next = state.items
        .map((it) => {
          if (it.product.id === productId) {
            const nextQ = it.quantity + delta;
            return nextQ > 0 ? { ...it, quantity: nextQ } : null;
          }
          return it;
        })
        .filter(Boolean) as CartItem[];
      saveItems(next);
      return { items: next };
    });
  },

  clearCart: () => {
    saveItems([]);
    set({ items: [] });
  },

  setIsOpen: (isOpen) => set({ isOpen }),

  setVehicleNote: (vehicleNote) => {
    saveNote(vehicleNote);
    set({ vehicleNote });
  },

  totalCount: () => {
    return get().items.reduce((acc, it) => acc + it.quantity, 0);
  },

  totalPrice: () => {
    return get().items.reduce((acc, it) => acc + it.product.price * it.quantity, 0);
  },
}));
