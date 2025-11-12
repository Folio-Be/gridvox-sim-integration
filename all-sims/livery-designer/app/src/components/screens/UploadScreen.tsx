import { useUpload } from '../../hooks/useUpload';
import styles from './UploadScreen.module.css';

export const UploadScreen = () => {
    const { selectFile, selectedFileName } = useUpload();

    return (
        <section className={styles.container}>
            <h2>Upload Reference Photo</h2>
            <p>Provide a high-quality photo for the AI to analyze.</p>
            <button type="button" onClick={selectFile}>
                Choose File
            </button>
            {selectedFileName && <p className={styles.fileName}>{selectedFileName}</p>}
        </section>
    );
};
