export const MAX_UPLOAD_MB = 20;

export const isSupportedImage = (fileName: string) => {
    const supported = ['.jpg', '.jpeg', '.png', '.heic'];
    const extension = fileName.slice(fileName.lastIndexOf('.')).toLowerCase();
    return supported.includes(extension);
};
