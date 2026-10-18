import { setupListeners } from '@reduxjs/toolkit/query';
import { AppState, type AppStateStatus } from 'react-native';
import type { AppDispatch } from './store';

/** React Native's name for the app in the foreground. */
const ACTIVE: AppStateStatus = 'active';

/**
 * RTK Query's `refetchOnFocus` listens to `window` events, which React Native
 * does not have; the app coming back to the foreground stands in for focus.
 */
export function setupAppListeners(dispatch: AppDispatch): () => void {
  return setupListeners(dispatch, (_dispatch, { onFocus, onFocusLost }) => {
    const subscription = AppState.addEventListener('change', state => {
      _dispatch(state === ACTIVE ? onFocus() : onFocusLost());
    });
    return () => subscription.remove();
  });
}
