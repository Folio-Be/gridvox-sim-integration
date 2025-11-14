import { create } from 'zustand';

type Toast = {
    id: string;
    title: string;
    description?: string;
};

type UIState = {
    toasts: Toast[];
    addToast: (toast: Toast) => void;
    removeToast: (id: string) => void;
};

export const useUIStore = create<UIState>((set: (updater: (state: UIState) => UIState) => void) => ({
    toasts: [],
    addToast: (toast: Toast) => set((state) => ({ ...state, toasts: [...state.toasts, toast] })),
    removeToast: (id: string) =>
        set((state) => ({ ...state, toasts: state.toasts.filter((toast) => toast.id !== id) }))
}));
