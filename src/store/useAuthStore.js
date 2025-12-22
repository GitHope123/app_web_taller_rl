import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            token: null,

            setAuth: (user, token) => set({ user, token }),

            logout: () => set({ user: null, token: null }),

            isAuthenticated: () => !!get().token,

            // Helper to check role
            hasRole: (role) => get().user?.rol === role
        }),
        {
            name: 'auth-storage', // name of the item in the storage (must be unique)
            partialize: (state) => ({ user: state.user, token: state.token }), // only persist these
        }
    )
)
