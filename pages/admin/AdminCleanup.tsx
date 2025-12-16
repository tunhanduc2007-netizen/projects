/**
 * 🧹 DATABASE CLEANUP PAGE
 * Xóa tất cả fake data và làm sạch Firestore
 */

import React, { useState } from 'react';
import { cleanupFirestore } from '../../scripts/cleanupFirestore';
import { db } from '../../firebase/config';

const AdminCleanup: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
    const [confirmed, setConfirmed] = useState(false);

    const isFirebaseAvailable = (): boolean => {
        return db !== null;
    };

    const handleCleanup = async () => {
        if (!confirmed) {
            alert('Bạn phải xác nhận trước khi xóa!');
            return;
        }

        if (!isFirebaseAvailable()) {
            setResult({ success: false, message: 'Firebase không khả dụng' });
            return;
        }

        setLoading(true);
        setResult(null);

        try {
            const res = await cleanupFirestore();
            setResult(res);
        } catch (error: any) {
            setResult({ success: false, message: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.title}>🧹 Database Cleanup</h1>
                <p style={styles.subtitle}>Xóa tất cả fake data và làm sạch Firestore</p>

                <div style={styles.warning}>
                    ⚠️ <strong>CẢNH BÁO:</strong> Hành động này sẽ XÓA TẤT CẢ dữ liệu trong Firestore.
                    Không thể hoàn tác!
                </div>

                {result && (
                    <div style={{
                        ...styles.result,
                        backgroundColor: result.success ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        borderColor: result.success ? '#22c55e' : '#ef4444',
                        color: result.success ? '#22c55e' : '#ef4444',
                    }}>
                        {result.success ? '✅' : '❌'} {result.message}
                    </div>
                )}

                <div style={styles.confirmBox}>
                    <label style={styles.checkboxLabel}>
                        <input
                            type="checkbox"
                            checked={confirmed}
                            onChange={(e) => setConfirmed(e.target.checked)}
                            style={styles.checkbox}
                        />
                        Tôi hiểu rằng hành động này không thể hoàn tác và muốn xóa tất cả dữ liệu
                    </label>
                </div>

                <button
                    onClick={handleCleanup}
                    disabled={loading || !confirmed}
                    style={{
                        ...styles.button,
                        opacity: (loading || !confirmed) ? 0.5 : 1,
                        cursor: (loading || !confirmed) ? 'not-allowed' : 'pointer',
                    }}
                >
                    {loading ? '🔄 Đang xóa...' : '🗑️ XÓA TẤT CẢ DATA'}
                </button>

                <div style={styles.info}>
                    <h3>Collections sẽ bị xóa:</h3>
                    <ul>
                        <li>users</li>
                        <li>members</li>
                        <li>visitors</li>
                        <li>schedules</li>
                        <li>products</li>
                        <li>orders</li>
                        <li>payments</li>
                        <li>contacts</li>
                        <li>reviews</li>
                        <li>events</li>
                        <li>bookings</li>
                        <li>coaches</li>
                        <li>club_info</li>
                        <li>logs</li>
                        <li>audit_logs</li>
                        <li>notifications</li>
                        <li>daily_stats</li>
                    </ul>
                </div>

                <div style={styles.links}>
                    <a href="/admin" style={styles.link}>← Quay lại Admin Panel</a>
                    <a href="https://console.firebase.google.com/project/clbbongbanlequydon/firestore" target="_blank" rel="noopener noreferrer" style={styles.link}>
                        🔥 Firebase Console
                    </a>
                </div>
            </div>
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    container: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        padding: '40px 20px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    card: {
        backgroundColor: '#1e293b',
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '600px',
        width: '100%',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
    },
    title: {
        fontSize: '28px',
        fontWeight: 700,
        color: '#f8fafc',
        marginBottom: '8px',
    },
    subtitle: {
        fontSize: '14px',
        color: '#94a3b8',
        marginBottom: '24px',
    },
    warning: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid #ef4444',
        borderRadius: '8px',
        padding: '16px',
        color: '#fca5a5',
        marginBottom: '24px',
        lineHeight: 1.6,
    },
    result: {
        border: '1px solid',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '24px',
        fontWeight: 500,
    },
    confirmBox: {
        marginBottom: '24px',
    },
    checkboxLabel: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        color: '#94a3b8',
        cursor: 'pointer',
        lineHeight: 1.5,
    },
    checkbox: {
        marginTop: '4px',
    },
    button: {
        width: '100%',
        padding: '16px',
        backgroundColor: '#dc2626',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: 600,
    },
    info: {
        backgroundColor: '#0f172a',
        borderRadius: '8px',
        padding: '16px',
        marginTop: '24px',
        color: '#94a3b8',
        fontSize: '13px',
    },
    links: {
        display: 'flex',
        gap: '16px',
        marginTop: '24px',
    },
    link: {
        color: '#60a5fa',
        textDecoration: 'none',
        fontSize: '14px',
    },
};

export default AdminCleanup;
