import { useEffect } from 'react';
import { AppShell } from './components/AppShell';
import { useAppStore } from './stores/appStore';

const App = () => {
    const initialize = useAppStore((state) => state.initialize);

    useEffect(() => {
        initialize();
    }, [initialize]);

    return <AppShell />;
};

export default App;
