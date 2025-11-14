export const humanFileSize = (bytes: number, decimals = 1) => {
    if (!Number.isFinite(bytes)) {
        return '0 B';
    }

    const units = ['B', 'KB', 'MB', 'GB'];
    const index = Math.min(
        Math.floor(Math.log(bytes) / Math.log(1024)),
        units.length - 1
    );

    const size = bytes / 1024 ** index;
    return `${size.toFixed(decimals)} ${units[index]}`;
};
