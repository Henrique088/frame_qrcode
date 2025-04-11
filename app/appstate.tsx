import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

export default function useAppState() {
  const [appState, setAppState] = useState(AppState.currentState);
  const appStateRef = useRef(appState);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", nextAppState => {
      if (appStateRef.current !== nextAppState) {
        appStateRef.current = nextAppState;
        setAppState(nextAppState);
      }
    });

    return () => subscription.remove();
  }, []);

  return appState; // 'active', 'background', 'inactive'
}
