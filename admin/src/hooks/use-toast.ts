'use client';

import * as React from 'react';
import {
    toast,
    listeners,
    memoryState,
    dispatch,
    type ToasterToast,
    type ToastVariant
} from '@/store/toast-store';

/**
 * Hook to subscribe to toast state
 */
function useToast() {
    const [state, setState] = React.useState(memoryState);

    React.useEffect(() => {
        listeners.push(setState);
        return () => {
            const index = listeners.indexOf(setState);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        };
    }, []); // Fixed: empty dependency array to subscribe only once

    return {
        ...state,
        toast,
        dismiss: (toastId?: string) => dispatch({ type: 'DISMISS_TOAST', toastId }),
    };
}

export { useToast, toast };
export type { ToasterToast, ToastVariant };
