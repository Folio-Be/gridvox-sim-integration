type RGB = {
    r: number;
    g: number;
    b: number;
};

export const hexToRgb = (hex: string): RGB | null => {
    const normalized = hex.replace('#', '');
    if (normalized.length !== 6) {
        return null;
    }

    const bigint = parseInt(normalized, 16);
    return {
        r: (bigint >> 16) & 255,
        g: (bigint >> 8) & 255,
        b: bigint & 255
    };
};
