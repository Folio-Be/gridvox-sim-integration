import { create } from 'zustand';

export type AppPhase =
    | 'upload'
    | 'car-selection'
    | 'generation'
    | 'preview'
    | 'editor'
    | 'export';

type AppState = {
    phase: AppPhase;
    initialize: () => void;
    goTo: (phase: AppPhase) => void;
};

export const useAppStore = create<AppState>((set: (updater: (state: AppState) => AppState) => void) => ({
    phase: 'upload',
    initialize: () => {
        set((state) => ({ ...state, phase: 'upload' }));
    },
    goTo: (phase: AppPhase) => set((state) => ({ ...state, phase }))
}));
