/**
 * 🔄 LOADING SPINNER COMPONENT
 * Production-ready loading states
 */

import React from 'react';

interface LoadingSpinnerProps {
    size?: 'small' | 'medium' | 'large';
    color?: string;
    text?: string;
    fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'medium',
    color = '#dc2626',
    text,
    fullScreen = false,
}) => {
    const sizeMap = {
        small: 24,
        medium: 40,
        large: 60,
    };

    const spinnerSize = sizeMap[size];

    const spinner = (
        <div style={styles.wrapper}>
            <div
                style={{
                    ...styles.spinner,
                    width: spinnerSize,
                    height: spinnerSize,
                    borderColor: `${color}20`,
                    borderTopColor: color,
                }}
            />
            {text && <p style={{ ...styles.text, color }}>{text}</p>}
        </div>
    );

    if (fullScreen) {
        return <div style={styles.fullScreen}>{spinner}</div>;
    }

    return spinner;
};

/**
 * 🎬 LOADING SKELETON COMPONENT
 */

interface SkeletonProps {
    width?: string | number;
    height?: string | number;
    borderRadius?: string | number;
    style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({
    width = '100%',
    height = 20,
    borderRadius = 4,
    style,
}) => {
    return (
        <div
            style={{
                ...styles.skeleton,
                width,
                height,
                borderRadius,
                ...style,
            }}
        />
    );
};

/**
 * 📊 LOADING CARD SKELETON
 */

export const CardSkeleton: React.FC = () => {
    return (
        <div style={styles.card}>
            <Skeleton height={200} borderRadius={12} style={{ marginBottom: 16 }} />
            <Skeleton height={24} width="80%" style={{ marginBottom: 8 }} />
            <Skeleton height={16} width="60%" style={{ marginBottom: 12 }} />
            <Skeleton height={32} width="40%" />
        </div>
    );
};

/**
 * 📋 LOADING TABLE SKELETON
 */

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
    return (
        <div style={styles.table}>
            <div style={styles.tableHeader}>
                {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} height={20} width={`${Math.random() * 30 + 15}%`} />
                ))}
            </div>
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} style={styles.tableRow}>
                    {[1, 2, 3, 4].map((j) => (
                        <Skeleton key={j} height={16} width={`${Math.random() * 40 + 20}%`} />
                    ))}
                </div>
            ))}
        </div>
    );
};

/**
 * ✅ SUCCESS ANIMATION
 */

export const SuccessAnimation: React.FC<{ message?: string }> = ({ message = 'Thành công!' }) => {
    return (
        <div style={styles.successWrapper}>
            <div style={styles.successIcon}>
                <svg viewBox="0 0 24 24" width="48" height="48">
                    <circle cx="12" cy="12" r="10" fill="#22c55e" />
                    <path
                        d="M8 12l3 3 5-6"
                        stroke="white"
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{
                            animation: 'checkmark 0.5s ease-out forwards',
                            strokeDasharray: 20,
                            strokeDashoffset: 20,
                        }}
                    />
                </svg>
            </div>
            <p style={styles.successText}>{message}</p>
        </div>
    );
};

/**
 * ❌ ERROR ANIMATION
 */

export const ErrorAnimation: React.FC<{ message?: string }> = ({ message = 'Có lỗi xảy ra!' }) => {
    return (
        <div style={styles.errorWrapper}>
            <div style={styles.errorIcon}>
                <svg viewBox="0 0 24 24" width="48" height="48">
                    <circle cx="12" cy="12" r="10" fill="#ef4444" />
                    <path
                        d="M8 8l8 8M16 8l-8 8"
                        stroke="white"
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </div>
            <p style={styles.errorText}>{message}</p>
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    wrapper: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        padding: '20px',
    },
    fullScreen: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
    },
    spinner: {
        border: '3px solid',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
    },
    text: {
        fontSize: '14px',
        fontWeight: 500,
        margin: 0,
    },
    skeleton: {
        backgroundColor: '#374151',
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    },
    card: {
        padding: '16px',
        backgroundColor: '#1f2937',
        borderRadius: '16px',
    },
    table: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    tableHeader: {
        display: 'flex',
        gap: '16px',
        padding: '12px 16px',
        backgroundColor: '#374151',
        borderRadius: '8px',
    },
    tableRow: {
        display: 'flex',
        gap: '16px',
        padding: '12px 16px',
        backgroundColor: '#1f2937',
        borderRadius: '8px',
    },
    successWrapper: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        padding: '24px',
        animation: 'fadeIn 0.3s ease-out',
    },
    successIcon: {
        animation: 'scaleIn 0.3s ease-out',
    },
    successText: {
        margin: 0,
        fontSize: '16px',
        fontWeight: 600,
        color: '#22c55e',
    },
    errorWrapper: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        padding: '24px',
    },
    errorIcon: {
        animation: 'shake 0.5s ease-out',
    },
    errorText: {
        margin: 0,
        fontSize: '16px',
        fontWeight: 600,
        color: '#ef4444',
    },
};

// Add animation keyframes
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    @keyframes checkmark {
      to { stroke-dashoffset: 0; }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes scaleIn {
      from { transform: scale(0); }
      to { transform: scale(1); }
    }
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-5px); }
      75% { transform: translateX(5px); }
    }
  `;
    document.head.appendChild(styleSheet);
}

export default LoadingSpinner;
