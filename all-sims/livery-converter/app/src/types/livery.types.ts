export type QualityMetrics = {
    accuracyScore: number;
    semanticAccuracy: number;
    colorAccuracy: number;
};

export type LiveryResult = {
    resultId: string;
    metrics: QualityMetrics;
    previewUrls: string[];
};
