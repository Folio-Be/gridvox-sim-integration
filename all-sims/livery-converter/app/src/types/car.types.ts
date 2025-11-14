export type CarModel = {
    id: string;
    name: string;
    simulator: 'ams2' | 'iracing' | 'acc' | 'lmu';
    class: string;
    thumbnailUrl: string;
};
