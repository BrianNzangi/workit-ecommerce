// src/store/cartStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CartItem = {
  id: string;
  variantId: string; // Backend variant ID (NOT the product ID)
  name: string;
  image: string;
  price: number;
  quantity: number;
};

type CartState = {
  isOpen: boolean;
  items: CartItem[];
  lastUpdated: string | null;
  sessionId: string | null;

  openCart: () => void;
  closeCart: () => void;

  addItem: (item: CartItem) => void;
  increaseQuantity: (id: string) => void;
  decreaseQuantity: (id: string) => void;
  removeItem: (id: string) => void;

  clearCart: () => void;

  getTotalQuantity: () => number;
  syncCartToBackend: () => Promise<void>;
};

// Generate a unique session ID for tracking
const generateSessionId = () => {
  return `cart_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

// Sync cart data to backend for abandoned cart tracking
const syncCartToBackend = async (items: CartItem[], sessionId: string) => {
  if (items.length === 0) return;

  try {
    const response = await fetch('/api/cart/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        items,
        lastUpdated: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      console.error('Failed to sync cart to backend');
    }
  } catch (error) {
    console.error('Error syncing cart:', error);
  }
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      isOpen: false,
      items: [],
      lastUpdated: null,
      sessionId: null,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      addItem: (item) => {
        const existing = get().items.find((i) => i.id === item.id);
        const sessionId = get().sessionId || generateSessionId();
        const lastUpdated = new Date().toISOString();

        if (existing) {
          set({
            items: get().items.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
            ),
            lastUpdated,
            sessionId,
          });
        } else {
          set({
            items: [...get().items, { ...item, quantity: 1 }],
            lastUpdated,
            sessionId,
          });
        }

        // Sync to backend after state update
        setTimeout(() => {
          syncCartToBackend(get().items, sessionId);
        }, 100);
      },

      increaseQuantity: (id) => {
        const sessionId = get().sessionId || generateSessionId();
        const lastUpdated = new Date().toISOString();

        set({
          items: get().items.map((item) =>
            item.id === id ? { ...item, quantity: item.quantity + 1 } : item
          ),
          lastUpdated,
          sessionId,
        });

        // Sync to backend
        setTimeout(() => {
          syncCartToBackend(get().items, sessionId);
        }, 100);
      },

      decreaseQuantity: (id) => {
        const updated = get().items
          .map((item) =>
            item.id === id ? { ...item, quantity: item.quantity - 1 } : item
          )
          .filter((item) => item.quantity > 0);

        const sessionId = get().sessionId || generateSessionId();
        const lastUpdated = new Date().toISOString();

        set({
          items: updated,
          lastUpdated,
          sessionId,
        });

        // Sync to backend
        setTimeout(() => {
          syncCartToBackend(get().items, sessionId);
        }, 100);
      },

      removeItem: (id) => {
        const sessionId = get().sessionId || generateSessionId();
        const lastUpdated = new Date().toISOString();

        set({
          items: get().items.filter((item) => item.id !== id),
          lastUpdated,
          sessionId,
        });

        // Sync to backend
        setTimeout(() => {
          syncCartToBackend(get().items, sessionId);
        }, 100);
      },

      clearCart: () => set({ items: [], lastUpdated: null }),

      getTotalQuantity: () =>
        get().items.reduce((total, item) => total + item.quantity, 0),

      syncCartToBackend: async () => {
        const { items, sessionId } = get();
        if (!sessionId) return;
        await syncCartToBackend(items, sessionId);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);