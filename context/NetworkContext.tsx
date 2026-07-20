import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { flushQueue } from '../lib/offlineQueue';

type NetworkContextType = {
    isConnected: boolean;
    isInternetReachable: boolean | null;
};

const NetworkContext = createContext<NetworkContextType>({
    isConnected: true,
    isInternetReachable: null,
});

export function NetworkProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<NetworkContextType>({
        isConnected: true,
        isInternetReachable: null,
    });
    // Referencia al estado anterior para detectar transición offline → online
    const prevConnected = useRef<boolean>(true);

    useEffect(() => {
        // Estado inicial
        NetInfo.fetch().then((s: NetInfoState) => {
            const connected = s.isConnected ?? true;
            prevConnected.current = connected;
            setState({ isConnected: connected, isInternetReachable: s.isInternetReachable });
        });

        // Suscripción a cambios
        const unsubscribe = NetInfo.addEventListener((s: NetInfoState) => {
            const connected = s.isConnected ?? true;
            setState({ isConnected: connected, isInternetReachable: s.isInternetReachable });

            // Transición offline → online: vaciar cola pendiente
            if (connected && !prevConnected.current) {
                flushQueue();
            }
            prevConnected.current = connected;
        });

        return unsubscribe;
    }, []);

    return (
        <NetworkContext.Provider value={state}>
            {children}
        </NetworkContext.Provider>
    );
}

export function useNetwork() {
    return useContext(NetworkContext);
}
