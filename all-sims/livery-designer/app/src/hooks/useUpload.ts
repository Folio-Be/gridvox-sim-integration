import { useCallback, useRef, useState } from 'react';

export const useUpload = () => {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [selectedFileName, setSelectedFileName] = useState<string>('');

    const selectFile = useCallback(() => {
        if (!inputRef.current) {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.jpg,.jpeg,.png,.heic';
            input.style.display = 'none';
            input.addEventListener('change', (event: Event) => {
                const target = event.target as HTMLInputElement;
                const file = target.files?.[0];
                setSelectedFileName(file ? file.name : '');
            });
            document.body.appendChild(input);
            inputRef.current = input;
        }

        inputRef.current?.click();
    }, []);

    return {
        selectFile,
        selectedFileName
    };
};
