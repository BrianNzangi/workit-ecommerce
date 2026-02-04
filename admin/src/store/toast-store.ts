import { ReactNode } from 'react';

// Types
export type ToastVariant = 'default' | 'success' | 'error';

export type ToasterToast = {
    id: string;
    title?: ReactNode;
    description?: ReactNode;
    variant?: ToastVariant;
    open?: boolean;
    action?: ReactNode;
    [key: string]: any; // Allow for other props
};

export type State = {
    toasts: ToasterToast[];
};

type Action =
    | { type: 'ADD_TOAST'; toast: ToasterToast }
    | { type: 'UPDATE_TOAST'; toast: Partial<ToasterToast> }
    | { type: 'DISMISS_TOAST'; toastId?: string }
    | { type: 'REMOVE_TOAST'; toastId?: string };

// Constants
const TOAST_LIMIT = 3;
const TOAST_REMOVE_DELAY = 5000;

// State management
let count = 0;

function genId() {
    count = (count + 1) % Number.MAX_VALUE;
    return count.toString();
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

const addToRemoveQueue = (toastId: string) => {
    if (toastTimeouts.has(toastId)) {
        return;
    }

    const timeout = setTimeout(() => {
        toastTimeouts.delete(toastId);
        dispatch({
            type: 'REMOVE_TOAST',
            toastId: toastId,
        });
    }, TOAST_REMOVE_DELAY);

    toastTimeouts.set(toastId, timeout);
};

export const reducer = (state: State, action: Action): State => {
    switch (action.type) {
        case 'ADD_TOAST':
            return {
                ...state,
                toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
            };

        case 'UPDATE_TOAST':
            return {
                ...state,
                toasts: state.toasts.map((t) =>
                    t.id === action.toast.id ? { ...t, ...action.toast } : t
                ),
            };

        case 'DISMISS_TOAST': {
            const { toastId } = action;

            if (toastId) {
                addToRemoveQueue(toastId);
            } else {
                state.toasts.forEach((toast) => {
                    addToRemoveQueue(toast.id);
                });
            }

            return {
                ...state,
                toasts: state.toasts.map((t) =>
                    t.id === toastId || toastId === undefined
                        ? {
                            ...t,
                            open: false,
                        }
                        : t
                ),
            };
        }
        case 'REMOVE_TOAST':
            if (action.toastId === undefined) {
                return {
                    ...state,
                    toasts: [],
                };
            }
            return {
                ...state,
                toasts: state.toasts.filter((t) => t.id !== action.toastId),
            };
    }
};

const listeners: Array<(state: State) => void> = [];

let memoryState: State = { toasts: [] };

export function dispatch(action: Action) {
    memoryState = reducer(memoryState, action);
    listeners.forEach((listener) => {
        listener(memoryState);
    });
}

/**
 * Global toast function - can be used anywhere (even outside components)
 * This acts as a global event emitter for toasts.
 */
function toast({
    title,
    description,
    variant = 'default',
    ...props
}: Omit<ToasterToast, 'id'>) {
    const id = genId();

    const update = (props: ToasterToast) =>
        dispatch({
            type: 'UPDATE_TOAST',
            toast: { ...props, id },
        });

    const dismiss = () => dispatch({ type: 'DISMISS_TOAST', toastId: id });

    dispatch({
        type: 'ADD_TOAST',
        toast: {
            ...props,
            id,
            title,
            description,
            variant,
            open: true,
        },
    });

    // Auto-dismiss using the existing constant to ensure consistency
    // Note: addToRemoveQueue is essentially what dismiss does but slightly different timing?
    // Actually, usually toast libraries rely on the component to trigger removal via onOpenChange(false)
    // or a timeout. Here we are doing it manually.
    setTimeout(() => {
        dismiss();
    }, TOAST_REMOVE_DELAY);

    return {
        id: id,
        dismiss,
        update,
    };
}

export { toast, listeners, memoryState };
