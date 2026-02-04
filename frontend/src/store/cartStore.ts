// src/store/cartStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

export type CartItem = {
  id: string; // This is the Line ID in backend
  productId: string;
  variantId: string | null;
  name: string;
  image: string;
  price: number;
  quantity: number;
};

type CartState = {
  isOpen: boolean;
  items: CartItem[];
  sessionId: string | null;
  loading: boolean;

  openCart: () => void;
  closeCart: () => void;

  fetchCart: () => Promise<void>;
  addItem: (item: { id: string; variantId?: string; name: string; price: number; image: string; quantity?: number }) => Promise<void>;
  updateQuantity: (lineId: string, quantity: number) => Promise<void>;
  increaseQuantity: (lineId: string) => Promise<void>;
  decreaseQuantity: (lineId: string) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
  clearCart: () => Promise<void>;

  getTotalQuantity: () => number;
};

// Generate a unique session ID for guest users
const generateSessionId = () => {
  return `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

const getHeaders = (sessionId: string | null) => {
  const headers: any = { 'Content-Type': 'application/json' };
  if (sessionId) {
    headers['x-guest-id'] = sessionId;
  }
  return headers;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      isOpen: false,
      items: [],
      sessionId: null,
      loading: false,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      fetchCart: async () => {
        let { sessionId } = get();
        if (!sessionId) {
          sessionId = generateSessionId();
          set({ sessionId });
        }
        set({ loading: true });
        try {
          // Use axios for consistency, proxied via /api/cart
          const response = await axios.get('/api/cart', {
            headers: getHeaders(sessionId)
          });

          if (response.data) {
            const mappedItems = (response.data.lines || []).map((line: any) => ({
              id: line.id, // Line ID
              productId: line.productId, // Product ID
              variantId: line.variantId || null,
              name: line.product.name,
              price: line.product.salePrice ?? line.product.originalPrice ?? 0,
              // Simplify asset lookup: first asset's preview, or empty string
              image: (line.product.assets && line.product.assets.length > 0 && line.product.assets[0].asset)
                ? line.product.assets[0].asset.preview
                : '',
              quantity: line.quantity
            }));
            set({ items: mappedItems });
          }
        } catch (error) {
          console.error('Failed to fetch cart:', error);
        } finally {
          set({ loading: false });
        }
      },

      addItem: async (item) => {
        let { sessionId } = get();
        const quantity = item.quantity || 1;
        if (!sessionId) {
          sessionId = generateSessionId();
          set({ sessionId });
        }

        try {
          await axios.post('/api/cart', {
            productId: item.id,
            variantId: item.variantId,
            quantity
          }, { headers: getHeaders(sessionId) });

          // Refetch to get correct Line IDs and totals
          await get().fetchCart();
          set({ isOpen: true }); // Open cart on add
        } catch (error) {
          console.error('Failed to add item:', error);
        }
      },

      updateQuantity: async (lineId, quantity) => {
        const { sessionId } = get();
        if (quantity < 1) return;

        // Optimistic
        set(state => ({
          items: state.items.map(i => i.id === lineId ? { ...i, quantity } : i)
        }));

        try {
          await axios.put(`/api/cart/${lineId}`, { quantity }, { headers: getHeaders(sessionId) });
          // No need to refetch if successful, as we updated optimistically
        } catch (error) {
          console.error('Failed to update quantity:', error);
          await get().fetchCart(); // Revert on error
        }
      },

      removeItem: async (lineId) => {
        const { sessionId } = get();

        // Optimistic
        set(state => ({
          items: state.items.filter(i => i.id !== lineId)
        }));

        try {
          await axios.delete(`/api/cart/${lineId}`, { headers: getHeaders(sessionId) });
        } catch (error) {
          console.error('Failed to remove item:', error);
          await get().fetchCart();
        }
      },

      increaseQuantity: async (lineId) => {
        const item = get().items.find(i => i.id === lineId);
        if (item) {
          await get().updateQuantity(lineId, item.quantity + 1);
        }
      },

      decreaseQuantity: async (lineId) => {
        const item = get().items.find(i => i.id === lineId);
        if (item && item.quantity > 1) {
          await get().updateQuantity(lineId, item.quantity - 1);
        } else if (item && item.quantity === 1) {
          await get().removeItem(lineId);
        }
      },

      clearCart: async () => {
        const { sessionId } = get();
        set({ items: [] });
        try {
          await axios.delete('/api/cart', { headers: getHeaders(sessionId) });
        } catch (error) {
          console.error('Failed to clear cart:', error);
        }
      },

      getTotalQuantity: () =>
        get().items.reduce((total, item) => total + item.quantity, 0),
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ sessionId: state.sessionId }), // Only persist session ID, items should be fetched
    }
  )
);