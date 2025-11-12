import { PropsWithChildren } from 'react';
import { UploadScreen } from './screens/UploadScreen';
import styles from './AppShell.module.css';

export const AppShell = ({ children }: PropsWithChildren) => {
    return (
        <div className={styles.shell}>
            <header className={styles.header}>
                <h1>SimVox.ai AI Livery Designer</h1>
            </header>
            <main className={styles.main}>{children ?? <UploadScreen />}</main>
        </div>
    );
};
