export type GenerateRequest = {
    photoId: string;
    carId: string;
    options?: {
        quality?: 'draft' | 'high' | 'ultra';
        multiViewFusion?: boolean;
        colorBoost?: number;
    };
};

export type GenerateResponse = {
    jobId: string;
    status: 'processing' | 'complete' | 'error';
    estimatedTimeSeconds?: number;
    websocketUrl?: string;
};
