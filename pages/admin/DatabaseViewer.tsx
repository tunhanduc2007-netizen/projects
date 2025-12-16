import React, { useState, useEffect } from 'react';
import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    Timestamp
} from 'firebase/firestore';
import { db, isFirebaseAvailable } from '../../firebase/config';


// Type definitions
interface DbCollection {
    name: string;
    icon: string;
    color: string;
}

interface DbDocument {
    id: string;
    [key: string]: any;
}

const collections: DbCollection[] = [
    { name: 'members', icon: '👥', color: '#3b82f6' },
    { name: 'schedules', icon: '📅', color: '#10b981' },
    { name: 'contacts', icon: '📧', color: '#f59e0b' },
    { name: 'products', icon: '🛍️', color: '#8b5cf6' },
    { name: 'orders', icon: '🛒', color: '#ec4899' },
];

const DatabaseViewer: React.FC = () => {
    const [selectedCollection, setSelectedCollection] = useState<string>('members');
    const [documents, setDocuments] = useState<DbDocument[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedDoc, setSelectedDoc] = useState<DbDocument | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');
    const [notification, setNotification] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

    // Load documents from Firestore
    const loadDocuments = async (collectionName: string) => {
        // Check Firebase availability
        if (!isFirebaseAvailable() || !db) {
            setError('Firebase không khả dụng. Vui lòng chạy Firebase Emulator trên localhost.');
            setDocuments([]);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const querySnapshot = await getDocs(collection(db, collectionName));
            const docs = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setDocuments(docs);
            notify(`Đã tải ${docs.length} documents từ ${collectionName}`, 'success');
        } catch (err: any) {
            setError(err.message);
            notify(`Lỗi: ${err.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isFirebaseAvailable()) {
            loadDocuments(selectedCollection);
        } else {
            setError('Firebase không khả dụng. Vui lòng chạy Firebase Emulator trên localhost.');
        }
    }, [selectedCollection]);

    const notify = (msg: string, type: 'success' | 'error' = 'success') => {
        setNotification({ msg, type });
        setTimeout(() => setNotification(null), 3000);
    };

    // Add new document
    const handleAddDocument = async () => {
        try {
            const newData = JSON.parse(editData);
            await addDoc(collection(db, selectedCollection), {
                ...newData,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            });
            notify('✅ Đã thêm document mới!', 'success');
            loadDocuments(selectedCollection);
            setIsEditing(false);
            setEditData('');
        } catch (err: any) {
            notify(`❌ Lỗi: ${err.message}`, 'error');
        }
    };

    // Update document
    const handleUpdateDocument = async () => {
        if (!selectedDoc) return;
        try {
            const updatedData = JSON.parse(editData);
            const { id, ...dataToUpdate } = updatedData;
            await updateDoc(doc(db, selectedCollection, selectedDoc.id), {
                ...dataToUpdate,
                updatedAt: Timestamp.now()
            });
            notify('✅ Đã cập nhật document!', 'success');
            loadDocuments(selectedCollection);
            setIsEditing(false);
            setSelectedDoc(null);
        } catch (err: any) {
            notify(`❌ Lỗi: ${err.message}`, 'error');
        }
    };

    // Delete document
    const handleDeleteDocument = async (id: string) => {
        if (!confirm('Bạn có chắc muốn xóa document này?')) return;
        try {
            await deleteDoc(doc(db, selectedCollection, id));
            notify('✅ Đã xóa document!', 'success');
            loadDocuments(selectedCollection);
            if (selectedDoc?.id === id) {
                setSelectedDoc(null);
            }
        } catch (err: any) {
            notify(`❌ Lỗi: ${err.message}`, 'error');
        }
    };

    // Export data as JSON
    const handleExport = () => {
        const dataStr = JSON.stringify(documents, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileDefaultName = `${selectedCollection}_${new Date().toISOString()}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        notify('✅ Đã export dữ liệu!', 'success');
    };




    // Filter documents
    const filteredDocs = documents.filter(doc =>
        JSON.stringify(doc).toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Format value for display
    const formatValue = (value: any): string => {
        if (value === null || value === undefined) return '-';
        if (value instanceof Timestamp) {
            return new Date(value.seconds * 1000).toLocaleString('vi-VN');
        }
        if (typeof value === 'object') {
            return JSON.stringify(value);
        }
        return String(value);
    };

    return (
        <div style={styles.container}>
            {/* Header */}
            <header style={styles.header}>
                <div style={styles.headerLeft}>
                    <h1 style={styles.title}>🔥 Firebase Database Viewer</h1>
                    <p style={styles.subtitle}>Quản lý Firestore trên Localhost</p>
                </div>
                <div style={styles.headerRight}>
                    <div style={styles.statusBadge}>
                        <div style={styles.statusDot}></div>
                        Localhost Connected
                    </div>
                </div>
            </header>

            {/* Notification */}
            {notification && (
                <div style={{
                    ...styles.notification,
                    backgroundColor: notification.type === 'success' ? '#10b981' : '#ef4444'
                }}>
                    {notification.msg}
                </div>
            )}

            {/* Main Content */}
            <div style={styles.mainContent}>
                {/* Sidebar - Collections */}
                <aside style={styles.sidebar}>
                    <h3 style={styles.sidebarTitle}>COLLECTIONS</h3>
                    {collections.map(col => (
                        <button
                            key={col.name}
                            onClick={() => setSelectedCollection(col.name)}
                            style={{
                                ...styles.collectionBtn,
                                backgroundColor: selectedCollection === col.name ? col.color : '#1f2937',
                                borderLeft: selectedCollection === col.name ? `4px solid ${col.color}` : '4px solid transparent'
                            }}
                        >
                            <span style={styles.collectionIcon}>{col.icon}</span>
                            <span style={styles.collectionName}>{col.name}</span>
                            <span style={styles.collectionCount}>
                                {selectedCollection === col.name ? documents.length : ''}
                            </span>
                        </button>
                    ))}
                </aside>

                {/* Main Area */}
                <main style={styles.mainArea}>
                    {/* Toolbar */}
                    <div style={styles.toolbar}>
                        <div style={styles.toolbarLeft}>
                            <input
                                type="text"
                                placeholder="🔍 Tìm kiếm..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={styles.searchInput}
                            />
                            <span style={styles.resultCount}>
                                {filteredDocs.length} documents
                            </span>
                        </div>
                        <div style={styles.toolbarRight}>
                            <button
                                onClick={() => loadDocuments(selectedCollection)}
                                style={styles.btnSecondary}
                            >
                                🔄 Refresh
                            </button>
                            <button
                                onClick={handleExport}
                                style={styles.btnSecondary}
                            >
                                📥 Export JSON
                            </button>
                            <button
                                onClick={() => {
                                    setIsEditing(true);
                                    setSelectedDoc(null);
                                    setEditData('{\n  \n}');
                                }}
                                style={styles.btnPrimary}
                            >
                                ➕ Add Document
                            </button>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div style={styles.contentArea}>
                        {/* Documents List */}
                        <div style={styles.documentsList}>
                            {loading ? (
                                <div style={styles.loadingState}>
                                    <div style={styles.spinner}></div>
                                    <p>Đang tải dữ liệu...</p>
                                </div>
                            ) : error ? (
                                <div style={styles.errorState}>
                                    <p style={styles.errorIcon}>⚠️</p>
                                    <p style={styles.errorText}>{error}</p>
                                    <button
                                        onClick={() => loadDocuments(selectedCollection)}
                                        style={styles.btnSecondary}
                                    >
                                        Thử lại
                                    </button>
                                </div>
                            ) : filteredDocs.length === 0 ? (
                                <div style={styles.emptyState}>
                                    <p style={styles.emptyIcon}>📭</p>
                                    <p style={styles.emptyText}>Không có documents</p>
                                    <button
                                        onClick={() => {
                                            setIsEditing(true);
                                            setSelectedDoc(null);
                                            setEditData('{\n  \n}');
                                        }}
                                        style={styles.btnPrimary}
                                    >
                                        ➕ Thêm document đầu tiên
                                    </button>
                                </div>
                            ) : (
                                <div style={styles.documentsTable}>
                                    <table style={styles.table}>
                                        <thead>
                                            <tr>
                                                <th style={styles.th}>ID</th>
                                                <th style={styles.th}>Data</th>
                                                <th style={styles.th}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredDocs.map(doc => (
                                                <tr
                                                    key={doc.id}
                                                    style={{
                                                        ...styles.tr,
                                                        backgroundColor: selectedDoc?.id === doc.id ? '#1f2937' : 'transparent'
                                                    }}
                                                >
                                                    <td style={styles.td}>
                                                        <code style={styles.docId}>{doc.id}</code>
                                                    </td>
                                                    <td style={styles.td}>
                                                        <div style={styles.docPreview}>
                                                            {Object.entries(doc)
                                                                .filter(([key]) => key !== 'id')
                                                                .slice(0, 3)
                                                                .map(([key, value]) => (
                                                                    <div key={key} style={styles.previewField}>
                                                                        <strong>{key}:</strong> {formatValue(value)}
                                                                    </div>
                                                                ))
                                                            }
                                                        </div>
                                                    </td>
                                                    <td style={styles.td}>
                                                        <div style={styles.actionBtns}>
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedDoc(doc);
                                                                    setIsEditing(false);
                                                                }}
                                                                style={styles.btnView}
                                                            >
                                                                👁️
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedDoc(doc);
                                                                    setEditData(JSON.stringify(doc, null, 2));
                                                                    setIsEditing(true);
                                                                }}
                                                                style={styles.btnEdit}
                                                            >
                                                                ✏️
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteDocument(doc.id)}
                                                                style={styles.btnDelete}
                                                            >
                                                                🗑️
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Detail Panel */}
                        {(selectedDoc || isEditing) && (
                            <div style={styles.detailPanel}>
                                <div style={styles.detailHeader}>
                                    <h3 style={styles.detailTitle}>
                                        {isEditing ? '✏️ Edit Document' : '👁️ View Document'}
                                    </h3>
                                    <button
                                        onClick={() => {
                                            setSelectedDoc(null);
                                            setIsEditing(false);
                                            setEditData('');
                                        }}
                                        style={styles.btnClose}
                                    >
                                        ✕
                                    </button>
                                </div>

                                {isEditing ? (
                                    <div style={styles.editArea}>
                                        <textarea
                                            value={editData}
                                            onChange={(e) => setEditData(e.target.value)}
                                            style={styles.jsonEditor}
                                            placeholder='{\n  "field": "value"\n}'
                                        />
                                        <div style={styles.editActions}>
                                            <button
                                                onClick={() => {
                                                    setIsEditing(false);
                                                    setEditData('');
                                                }}
                                                style={styles.btnCancel}
                                            >
                                                ✕ Cancel
                                            </button>
                                            <button
                                                onClick={selectedDoc ? handleUpdateDocument : handleAddDocument}
                                                style={styles.btnSave}
                                            >
                                                ✓ {selectedDoc ? 'Update' : 'Add'}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={styles.viewArea}>
                                        <pre style={styles.jsonView}>
                                            {JSON.stringify(selectedDoc, null, 2)}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

// Styles
const styles: { [key: string]: React.CSSProperties } = {
    container: {
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        color: '#f1f5f9',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '2rem',
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        borderBottom: '1px solid #334155',
    },
    headerLeft: {},
    title: {
        fontSize: '2rem',
        fontWeight: 'bold',
        margin: 0,
        background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    },
    subtitle: {
        margin: '0.5rem 0 0 0',
        color: '#94a3b8',
        fontSize: '0.9rem',
    },
    headerRight: {},
    statusBadge: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 1rem',
        backgroundColor: '#10b981',
        borderRadius: '20px',
        fontSize: '0.85rem',
        fontWeight: '500',
    },
    statusDot: {
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: '#fff',
        animation: 'pulse 2s infinite',
    },
    notification: {
        position: 'fixed',
        top: '2rem',
        right: '2rem',
        padding: '1rem 1.5rem',
        borderRadius: '8px',
        color: '#fff',
        fontWeight: '500',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
        zIndex: 1000,
        animation: 'slideIn 0.3s ease-out',
    },
    mainContent: {
        display: 'flex',
        height: 'calc(100vh - 120px)',
    },
    sidebar: {
        width: '250px',
        backgroundColor: '#1e293b',
        borderRight: '1px solid #334155',
        padding: '1.5rem',
        overflowY: 'auto',
    },
    sidebarTitle: {
        fontSize: '0.75rem',
        fontWeight: 'bold',
        color: '#64748b',
        marginBottom: '1rem',
        letterSpacing: '0.1em',
    },
    collectionBtn: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.75rem 1rem',
        marginBottom: '0.5rem',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        color: '#fff',
        fontSize: '0.95rem',
    },
    collectionIcon: {
        fontSize: '1.2rem',
    },
    collectionName: {
        flex: 1,
        textAlign: 'left',
        textTransform: 'capitalize',
    },
    collectionCount: {
        fontSize: '0.8rem',
        opacity: 0.8,
    },
    mainArea: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
    },
    toolbar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.5rem',
        backgroundColor: '#1e293b',
        borderBottom: '1px solid #334155',
        gap: '1rem',
        flexWrap: 'wrap',
    },
    toolbarLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        flex: 1,
    },
    searchInput: {
        padding: '0.75rem 1rem',
        backgroundColor: '#0f172a',
        border: '1px solid #334155',
        borderRadius: '8px',
        color: '#f1f5f9',
        fontSize: '0.9rem',
        minWidth: '300px',
        outline: 'none',
    },
    resultCount: {
        fontSize: '0.85rem',
        color: '#94a3b8',
    },
    toolbarRight: {
        display: 'flex',
        gap: '0.75rem',
    },
    btnPrimary: {
        padding: '0.75rem 1.5rem',
        backgroundColor: '#3b82f6',
        border: 'none',
        borderRadius: '8px',
        color: '#fff',
        fontSize: '0.9rem',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    btnSecondary: {
        padding: '0.75rem 1.5rem',
        backgroundColor: '#334155',
        border: 'none',
        borderRadius: '8px',
        color: '#fff',
        fontSize: '0.9rem',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    contentArea: {
        flex: 1,
        display: 'flex',
        overflow: 'hidden',
    },
    documentsList: {
        flex: 1,
        overflowY: 'auto',
        padding: '1.5rem',
    },
    loadingState: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        gap: '1rem',
    },
    spinner: {
        width: '40px',
        height: '40px',
        border: '4px solid #334155',
        borderTop: '4px solid #3b82f6',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
    },
    errorState: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        gap: '1rem',
    },
    errorIcon: {
        fontSize: '3rem',
        margin: 0,
    },
    errorText: {
        color: '#ef4444',
        fontSize: '1rem',
    },
    emptyState: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        gap: '1rem',
    },
    emptyIcon: {
        fontSize: '3rem',
        margin: 0,
    },
    emptyText: {
        color: '#94a3b8',
        fontSize: '1rem',
    },
    documentsTable: {
        backgroundColor: '#1e293b',
        borderRadius: '12px',
        overflow: 'hidden',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
    },
    th: {
        padding: '1rem',
        textAlign: 'left',
        backgroundColor: '#0f172a',
        color: '#94a3b8',
        fontSize: '0.85rem',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        borderBottom: '1px solid #334155',
    },
    tr: {
        transition: 'background-color 0.2s',
        cursor: 'pointer',
    },
    td: {
        padding: '1rem',
        borderBottom: '1px solid #334155',
    },
    docId: {
        fontSize: '0.8rem',
        color: '#3b82f6',
        backgroundColor: '#1e3a8a',
        padding: '0.25rem 0.5rem',
        borderRadius: '4px',
    },
    docPreview: {
        fontSize: '0.85rem',
        color: '#cbd5e1',
    },
    previewField: {
        marginBottom: '0.25rem',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    actionBtns: {
        display: 'flex',
        gap: '0.5rem',
    },
    btnView: {
        padding: '0.5rem 0.75rem',
        backgroundColor: '#3b82f6',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '1rem',
    },
    btnEdit: {
        padding: '0.5rem 0.75rem',
        backgroundColor: '#f59e0b',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '1rem',
    },
    btnDelete: {
        padding: '0.5rem 0.75rem',
        backgroundColor: '#ef4444',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '1rem',
    },
    detailPanel: {
        flex: '0 0 50%',
        backgroundColor: '#1e293b',
        borderLeft: '1px solid #334155',
        display: 'flex',
        flexDirection: 'column',
    },
    detailHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.5rem',
        borderBottom: '1px solid #334155',
    },
    detailTitle: {
        margin: 0,
        fontSize: '1.1rem',
        fontWeight: '600',
    },
    btnClose: {
        width: '32px',
        height: '32px',
        backgroundColor: '#334155',
        border: 'none',
        borderRadius: '6px',
        color: '#fff',
        cursor: 'pointer',
        fontSize: '1.2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    editArea: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '1.5rem',
    },
    jsonEditor: {
        flex: 1,
        padding: '1rem',
        backgroundColor: '#0f172a',
        border: '1px solid #334155',
        borderRadius: '8px',
        color: '#f1f5f9',
        fontFamily: 'Monaco, Consolas, monospace',
        fontSize: '0.9rem',
        resize: 'none',
        outline: 'none',
    },
    editActions: {
        display: 'flex',
        gap: '0.75rem',
        marginTop: '1rem',
        justifyContent: 'flex-end',
    },
    btnCancel: {
        padding: '0.75rem 1.5rem',
        backgroundColor: '#475569',
        border: 'none',
        borderRadius: '8px',
        color: '#fff',
        fontSize: '0.9rem',
        fontWeight: '500',
        cursor: 'pointer',
    },
    btnSave: {
        padding: '0.75rem 1.5rem',
        backgroundColor: '#10b981',
        border: 'none',
        borderRadius: '8px',
        color: '#fff',
        fontSize: '0.9rem',
        fontWeight: '500',
        cursor: 'pointer',
    },
    viewArea: {
        flex: 1,
        padding: '1.5rem',
        overflowY: 'auto',
    },
    jsonView: {
        padding: '1rem',
        backgroundColor: '#0f172a',
        border: '1px solid #334155',
        borderRadius: '8px',
        color: '#10b981',
        fontFamily: 'Monaco, Consolas, monospace',
        fontSize: '0.85rem',
        margin: 0,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
    },
};

export default DatabaseViewer;
