/**
 * ============================================
 * FIREBASE REALTIME HOOKS
 * React hooks for realtime data synchronization
 * ============================================
 */

import { useState, useEffect, useCallback } from 'react';
import { Unsubscribe } from 'firebase/firestore';
import {
    Member,
    Schedule,
    Contact,
    Product,
    Order,
    Payment,
} from '../firebase/types';
import {
    subscribeToMembers,
    subscribeToActiveMembers,
} from '../firebase/services/members';
import {
    subscribeToSchedules,
} from '../firebase/services/schedules';
import {
    subscribeToContacts,
    subscribeToUnreadContacts,
} from '../firebase/services/contacts';
import {
    subscribeToProducts,
} from '../firebase/services/products';
import {
    subscribeToOrders,
    subscribeToUserOrders,
} from '../firebase/services/orders';
import {
    subscribeToPayments,
} from '../firebase/services/payments';

// ============================================
// GENERIC STATE TYPE
// ============================================

interface RealtimeState<T> {
    data: T[];
    loading: boolean;
    error: Error | null;
}

// ============================================
// useMembers Hook
// ============================================

export function useMembers(activeOnly: boolean = false): RealtimeState<Member> {
    const [state, setState] = useState<RealtimeState<Member>>({
        data: [],
        loading: true,
        error: null,
    });

    useEffect(() => {
        setState(prev => ({ ...prev, loading: true }));

        const unsubscribe = activeOnly
            ? subscribeToActiveMembers(
                (members) => {
                    setState({ data: members, loading: false, error: null });
                },
                (error) => {
                    setState({ data: [], loading: false, error });
                }
            )
            : subscribeToMembers(
                (members) => {
                    setState({ data: members, loading: false, error: null });
                },
                (error) => {
                    setState({ data: [], loading: false, error });
                }
            );

        return () => unsubscribe();
    }, [activeOnly]);

    return state;
}

// ============================================
// useSchedules Hook
// ============================================

export function useSchedules(): RealtimeState<Schedule> {
    const [state, setState] = useState<RealtimeState<Schedule>>({
        data: [],
        loading: true,
        error: null,
    });

    useEffect(() => {
        setState(prev => ({ ...prev, loading: true }));

        const unsubscribe = subscribeToSchedules(
            (schedules) => {
                setState({ data: schedules, loading: false, error: null });
            },
            (error) => {
                setState({ data: [], loading: false, error });
            }
        );

        return () => unsubscribe();
    }, []);

    return state;
}

// ============================================
// useContacts Hook
// ============================================

export function useContacts(unreadOnly: boolean = false): RealtimeState<Contact> {
    const [state, setState] = useState<RealtimeState<Contact>>({
        data: [],
        loading: true,
        error: null,
    });

    useEffect(() => {
        setState(prev => ({ ...prev, loading: true }));

        const unsubscribe = unreadOnly
            ? subscribeToUnreadContacts(
                (contacts) => {
                    setState({ data: contacts, loading: false, error: null });
                },
                (error) => {
                    setState({ data: [], loading: false, error });
                }
            )
            : subscribeToContacts(
                (contacts) => {
                    setState({ data: contacts, loading: false, error: null });
                },
                (error) => {
                    setState({ data: [], loading: false, error });
                }
            );

        return () => unsubscribe();
    }, [unreadOnly]);

    return state;
}

// ============================================
// useProducts Hook
// ============================================

export function useProducts(): RealtimeState<Product> {
    const [state, setState] = useState<RealtimeState<Product>>({
        data: [],
        loading: true,
        error: null,
    });

    useEffect(() => {
        setState(prev => ({ ...prev, loading: true }));

        const unsubscribe = subscribeToProducts(
            (products) => {
                setState({ data: products, loading: false, error: null });
            },
            (error) => {
                setState({ data: [], loading: false, error });
            }
        );

        return () => unsubscribe();
    }, []);

    return state;
}

// ============================================
// useOrders Hook
// ============================================

export function useOrders(userId?: string): RealtimeState<Order> {
    const [state, setState] = useState<RealtimeState<Order>>({
        data: [],
        loading: true,
        error: null,
    });

    useEffect(() => {
        setState(prev => ({ ...prev, loading: true }));

        const unsubscribe = userId
            ? subscribeToUserOrders(
                userId,
                (orders) => {
                    setState({ data: orders, loading: false, error: null });
                },
                (error) => {
                    setState({ data: [], loading: false, error });
                }
            )
            : subscribeToOrders(
                (orders) => {
                    setState({ data: orders, loading: false, error: null });
                },
                (error) => {
                    setState({ data: [], loading: false, error });
                }
            );

        return () => unsubscribe();
    }, [userId]);

    return state;
}

// ============================================
// usePayments Hook
// ============================================

export function usePayments(): RealtimeState<Payment> {
    const [state, setState] = useState<RealtimeState<Payment>>({
        data: [],
        loading: true,
        error: null,
    });

    useEffect(() => {
        setState(prev => ({ ...prev, loading: true }));

        const unsubscribe = subscribeToPayments(
            (payments) => {
                setState({ data: payments, loading: false, error: null });
            },
            (error) => {
                setState({ data: [], loading: false, error });
            }
        );

        return () => unsubscribe();
    }, []);

    return state;
}

// ============================================
// TOAST NOTIFICATION HOOK
// ============================================

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
    id: string;
    type: ToastType;
    message: string;
}

let toastIdCounter = 0;

export function useToast() {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = `toast-${++toastIdCounter}`;
        setToasts(prev => [...prev, { id, type, message }]);

        // Auto remove after 5 seconds
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 5000);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const success = useCallback((message: string) => addToast(message, 'success'), [addToast]);
    const error = useCallback((message: string) => addToast(message, 'error'), [addToast]);
    const info = useCallback((message: string) => addToast(message, 'info'), [addToast]);
    const warning = useCallback((message: string) => addToast(message, 'warning'), [addToast]);

    return { toasts, addToast, removeToast, success, error, info, warning };
}

// ============================================
// LOADING STATE HOOK
// ============================================

export function useLoadingState(initialState: boolean = false) {
    const [loading, setLoading] = useState(initialState);

    const withLoading = useCallback(async <T>(fn: () => Promise<T>): Promise<T> => {
        setLoading(true);
        try {
            return await fn();
        } finally {
            setLoading(false);
        }
    }, []);

    return { loading, setLoading, withLoading };
}
