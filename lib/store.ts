import { create } from 'zustand';

interface MobileMenuState {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
}

export const useMobileMenu = create<MobileMenuState>((set) => ({
  isOpen: false,
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  close: () => set({ isOpen: false }),
}));

interface CommandPaletteState {
  isOpen: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
}

export const useCommandPalette = create<CommandPaletteState>((set) => ({
  isOpen: false,
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));

interface LogoutModalState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const useLogoutModal = create<LogoutModalState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));

interface AuthState {
  user: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: any | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  hasPermission: (module: string, action: string) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => set({ user: null, isAuthenticated: false }),
  hasPermission: (module, action) => {
    const user = get().user;
    if (!user || !user.role) return false;
    
    // Super Admin or Administrator role overrides all permissions
    if (user.role.name === 'Super Admin' || user.role.name === 'Administrator') return true;

    const permissions = user.role.permissions || {};
    
    // Case-insensitive lookup
    const moduleKey = module.toLowerCase();
    const actionKey = action.toLowerCase();
    
    // Find matching module key regardless of casing
    const targetKey = Object.keys(permissions).find(
      (k) => k.toLowerCase() === moduleKey
    );
    
    if (!targetKey) return false;
    
    const actions = permissions[targetKey] || [];
    return actions.some((act: string) => act.toLowerCase() === actionKey);
  }
}));
