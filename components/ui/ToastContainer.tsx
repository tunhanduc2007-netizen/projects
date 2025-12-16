/**
 * 🎨 TOAST NOTIFICATION COMPONENT
 * Production-ready UI component
 */

import React from 'react';
import { Toast, ToastType } from '../../firebase/hooks';

interface ToastContainerProps {
    toasts: Toast[];
    onRemove: (id: string) => void;
}

const icons: Record<ToastType, string> = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
};

const colors: Record<ToastType, { bg: string; border: string; text: string }> = {
    success: {
        bg: 'rgba(34, 197, 94, 0.1)',
        border: '#22c55e',
        text: '#22c55e',
    },
    error: {
        bg: 'rgba(239, 68, 68, 0.1)',
        border: '#ef4444',
        text: '#ef4444',
    },
    warning: {
        bg: 'rgba(245, 158, 11, 0.1)',
        border: '#f59e0b',
        text: '#f59e0b',
    },
    info: {
        bg: 'rgba(59, 130, 246, 0.1)',
        border: '#3b82f6',
        text: '#3b82f6',
    },
};

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
    if (toasts.length === 0) return null;

    return (
        <div style={styles.container}>
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    style={{
                        ...styles.toast,
                        backgroundColor: colors[toast.type].bg,
                        borderColor: colors[toast.type].border,
                    }}
                    onClick={() => onRemove(toast.id)}
                >
                    <span style={{ ...styles.icon, color: colors[toast.type].text }}>
                        {icons[toast.type]}
                    </span>
                    <span style={{ ...styles.message, color: colors[toast.type].text }}>
                        {toast.message}
                    </span>
                    <button
                        style={styles.closeButton}
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemove(toast.id);
                        }}
                    >
                        ×
                    </button>
                </div>
            ))}
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    container: {
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxWidth: '400px',
    },
    toast: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '16px 20px',
        borderRadius: '12px',
        border: '1px solid',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        cursor: 'pointer',
        animation: 'slideIn 0.3s ease-out',
    },
    icon: {
        fontSize: '18px',
        fontWeight: 'bold',
        width: '24px',
        height: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    message: {
        flex: 1,
        fontSize: '14px',
        fontWeight: 500,
        lineHeight: 1.4,
    },
    closeButton: {
        background: 'none',
        border: 'none',
        fontSize: '20px',
        cursor: 'pointer',
        opacity: 0.6,
        padding: '0 4px',
        color: 'inherit',
    },
};

// Add animation keyframes
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(100px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
  `;
    document.head.appendChild(styleSheet);
}

export default ToastContainer;
