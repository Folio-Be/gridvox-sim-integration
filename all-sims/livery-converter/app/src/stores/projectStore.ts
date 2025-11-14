import { create } from 'zustand';

export type PhotoAnalysis = {
    photoId: string;
    qualityScore: number;
    dominantColors: string[];
};

type ProjectState = {
    analysis?: PhotoAnalysis;
    setAnalysis: (analysis: PhotoAnalysis) => void;
    reset: () => void;
};

export const useProjectStore = create<ProjectState>((set: (updater: (state: ProjectState) => ProjectState) => void) => ({
    analysis: undefined,
    setAnalysis: (analysis: PhotoAnalysis) => set((state) => ({ ...state, analysis })),
    reset: () => set((state) => ({ ...state, analysis: undefined }))
}));
