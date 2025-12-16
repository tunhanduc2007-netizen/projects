import React, { useState, useEffect } from 'react';

// Types & Data
interface Member { id: string; name: string; email: string; phone: string; type: string; status: string; fee: string; createdAt: string; avatar?: string; }
const getLS = <T,>(key: string, def: T): T => { try { return localStorage.getItem(key) ? JSON.parse(localStorage.getItem(key)!) : def; } catch { return def; } };
const setLS = <T,>(key: string, val: T) => localStorage.setItem(key, JSON.stringify(val));
const ADMIN = { username: 'tnduck', password: 'Chaobacon1234', name: 'TNDUCK' };
const initData: Member[] = [
    { id: '1', name: 'Nguyễn Văn An', email: 'an@gmail.com', phone: '0901234567', type: 'VIP', status: 'active', fee: '500,000₫', createdAt: '01/12/2024' },
    { id: '2', name: 'Trần Thị Bình', email: 'binh@gmail.com', phone: '0912345678', type: 'Premium', status: 'active', fee: '300,000₫', createdAt: '05/12/2024' },
    { id: '3', name: 'Lê Hoàng Cường', email: 'cuong@gmail.com', phone: '0923456789', type: 'Basic', status: 'inactive', fee: '150,000₫', createdAt: '10/12/2024' },
    { id: '4', name: 'Phạm Minh Dũng', email: 'dung@gmail.com', phone: '0934567890', type: 'Premium', status: 'active', fee: '300,000₫', createdAt: '12/12/2024' },
];

type Tab = 'dashboard' | 'members' | 'schedules' | 'products' | 'messages' | 'settings';

const AdminPanel: React.FC = () => {
    const [logged, setLogged] = useState(() => getLS('auth', false));
    const [dark, setDark] = useState(() => getLS('dark', false));
    const [tab, setTab] = useState<Tab>('dashboard');
    const [data, setData] = useState<Member[]>(() => getLS('members', initData));
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState<string[]>([]);
    const [modal, setModal] = useState<{ type: string; item?: Member } | null>(null);
    const [toast, setToast] = useState<{ msg: string; type: string; progress: number } | null>(null);
    const [loading, setLoading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [sortCol, setSortCol] = useState('name');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

    useEffect(() => { setLS('members', data); }, [data]);
    useEffect(() => { setLS('dark', dark); document.body.className = dark ? 'dark' : ''; }, [dark]);
    useEffect(() => { if (toast) { const t = setInterval(() => setToast(p => p ? { ...p, progress: p.progress - 2 } : null), 60); const t2 = setTimeout(() => setToast(null), 3000); return () => { clearInterval(t); clearTimeout(t2); }; } }, [toast]);

    const notify = (msg: string, type = 'success') => setToast({ msg, type, progress: 100 });

    const login = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); setLoading(true);
        setTimeout(() => {
            const f = new FormData(e.currentTarget);
            if (f.get('u') === ADMIN.username && f.get('p') === ADMIN.password) { setLogged(true); setLS('auth', true); }
            else notify('Sai tài khoản!', 'error');
            setLoading(false);
        }, 800);
    };

    const add = (m: Omit<Member, 'id' | 'createdAt'>) => { setData([...data, { ...m, id: Date.now().toString(), createdAt: new Date().toLocaleDateString('vi') }]); setModal(null); notify('Thêm thành công!'); };
    const edit = (m: Member) => { setData(data.map(d => d.id === m.id ? m : d)); setModal(null); notify('Cập nhật thành công!'); };
    const del = (ids: string[]) => { setData(data.filter(d => !ids.includes(d.id))); setSelected([]); setModal(null); notify('Đã xóa!'); };

    const filtered = data.filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || m.email.includes(search)).sort((a, b) => {
        const va = (a as Record<string, string>)[sortCol] || '', vb = (b as Record<string, string>)[sortCol] || '';
        return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
    });

    const sort = (c: string) => { if (sortCol === c) setSortDir(sortDir === 'asc' ? 'desc' : 'asc'); else { setSortCol(c); setSortDir('asc'); } };

    // Login Screen
    if (!logged) return (
        <div className={`login-screen ${dark ? 'dark' : ''}`}>
            <div className="login-bg"></div>
            <div className="login-card animate-in">
                <div className="login-icon">🗄️</div>
                <h1>Database Admin</h1>
                <p>Đăng nhập để tiếp tục</p>
                <form onSubmit={login}>
                    <div className="input-float"><input name="u" required /><label>Tên đăng nhập</label></div>
                    <div className="input-float"><input name="p" type="password" required /><label>Mật khẩu</label></div>
                    <button type="submit" className={loading ? 'loading' : ''}>{loading ? <span className="spinner"></span> : 'ĐĂNG NHẬP'}</button>
                </form>
                <div className="login-footer"><button className="theme-btn" onClick={() => setDark(!dark)}>{dark ? '☀️' : '🌙'}</button><a href="/">← Trang chủ</a></div>
            </div>
            <style>{css(dark)}</style>
        </div>
    );

    return (
        <div className={`admin ${dark ? 'dark' : ''}`}>
            {/* Topbar */}
            <header className="topbar glass">
                <div className="topbar-left">
                    <button className="menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>{sidebarOpen ? '✕' : '☰'}</button>
                    <span className="logo">🗄️ CLB Database</span>
                </div>
                <div className="topbar-right">
                    <button className="theme-btn" onClick={() => setDark(!dark)}>{dark ? '☀️' : '🌙'}</button>
                    <div className="avatar-wrap"><div className="avatar">{ADMIN.name[0]}</div><span>{ADMIN.name}</span></div>
                    <button className="logout-btn" onClick={() => { setLogged(false); setLS('auth', false); }}>Đăng xuất</button>
                </div>
            </header>

            <div className="layout">
                {/* Sidebar */}
                <aside className={`sidebar glass ${sidebarOpen ? 'open' : 'closed'}`}>
                    {[{ id: 'dashboard', icon: '📊', label: 'Dashboard' }, { id: 'members', icon: '👥', label: 'Thành viên' }, { id: 'schedules', icon: '📅', label: 'Lịch tập' }, { id: 'products', icon: '📦', label: 'Sản phẩm' }, { id: 'messages', icon: '✉️', label: 'Tin nhắn' }, { id: 'settings', icon: '⚙️', label: 'Cài đặt' }].map((t, i) => (
                        <button key={t.id} className={tab === t.id ? 'active' : ''} onClick={() => setTab(t.id as Tab)} style={{ animationDelay: `${i * 50}ms` }}>
                            <span className="icon">{t.icon}</span>
                            <span className="label">{t.label}</span>
                            {tab === t.id && <div className="indicator"></div>}
                        </button>
                    ))}
                </aside>

                {/* Main */}
                <main className="main">
                    <div className="page-content animate-page">
                        {tab === 'dashboard' && (
                            <>
                                <h2 className="page-title">📊 Dashboard</h2>
                                <div className="stats-row">
                                    {[{ v: data.length, l: 'Tổng thành viên', c: 'blue' }, { v: data.filter(d => d.status === 'active').length, l: 'Đang hoạt động', c: 'green' }, { v: data.filter(d => d.type === 'VIP').length, l: 'Thành viên VIP', c: 'gold' }, { v: data.filter(d => d.type === 'Premium').length, l: 'Thành viên Premium', c: 'purple' }].map((s, i) => (
                                        <div key={i} className={`stat-card glass ${s.c}`} style={{ animationDelay: `${i * 100}ms` }}>
                                            <div className="stat-value">{s.v}</div>
                                            <div className="stat-label">{s.l}</div>
                                        </div>
                                    ))}
                                </div>
                                <div className="card glass animate-up" style={{ animationDelay: '300ms' }}>
                                    <h3>📝 Hoạt động gần đây</h3>
                                    <ul className="activity-list">{['✅ Thêm thành viên mới - Hôm nay', '📝 Cập nhật thông tin - Hôm qua', '🗑️ Xóa bản ghi - 2 ngày trước'].map((a, i) => <li key={i} style={{ animationDelay: `${400 + i * 100}ms` }}>{a}</li>)}</ul>
                                </div>
                            </>
                        )}

                        {tab === 'members' && (
                            <>
                                <div className="section-header">
                                    <h2 className="page-title">👥 Quản lý thành viên</h2>
                                    <div className="actions">
                                        <button className="btn primary ripple" onClick={() => setModal({ type: 'add' })}>➕ Thêm mới</button>
                                        <button className="btn outline">⬆ Import</button>
                                        <button className="btn outline">⬇ Export</button>
                                    </div>
                                </div>

                                <div className="toolbar glass">
                                    <div className="search-wrap"><span>🔍</span><input placeholder="Tìm kiếm..." value={search} onChange={e => setSearch(e.target.value)} /></div>
                                    {selected.length > 0 && <button className="btn danger" onClick={() => setModal({ type: 'del-multi' })}>🗑️ Xóa ({selected.length})</button>}
                                </div>

                                <div className="table-wrap glass">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th><input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0} onChange={e => setSelected(e.target.checked ? filtered.map(m => m.id) : [])} /></th>
                                                <th onClick={() => sort('id')}>ID <span className={`sort-icon ${sortCol === 'id' ? sortDir : ''}`}>↕</span></th>
                                                <th onClick={() => sort('name')}>Họ tên <span className={`sort-icon ${sortCol === 'name' ? sortDir : ''}`}>↕</span></th>
                                                <th>Email</th>
                                                <th>SĐT</th>
                                                <th>Gói</th>
                                                <th onClick={() => sort('status')}>Trạng thái</th>
                                                <th>Ngày tạo</th>
                                                <th>Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filtered.length === 0 ? <tr><td colSpan={9} className="empty"><div className="empty-state">📭<p>Không có dữ liệu</p></div></td></tr> :
                                                filtered.map((m, i) => (
                                                    <tr key={m.id} className={`row-animate ${selected.includes(m.id) ? 'selected' : ''}`} style={{ animationDelay: `${i * 50}ms` }}>
                                                        <td><input type="checkbox" checked={selected.includes(m.id)} onChange={e => setSelected(e.target.checked ? [...selected, m.id] : selected.filter(s => s !== m.id))} /></td>
                                                        <td className="id">#{m.id.slice(-4)}</td>
                                                        <td><div className="user-cell"><div className="user-avatar">{m.name[0]}</div><strong>{m.name}</strong></div></td>
                                                        <td>{m.email}</td>
                                                        <td>{m.phone}</td>
                                                        <td><span className={`badge ${m.type.toLowerCase()}`}>{m.type}</span></td>
                                                        <td><span className={`status-pill ${m.status}`}><span className="dot"></span>{m.status === 'active' ? 'Hoạt động' : 'Ngưng'}</span></td>
                                                        <td>{m.createdAt}</td>
                                                        <td className="actions-cell">
                                                            <button className="icon-btn" onClick={() => setModal({ type: 'view', item: m })}>👁️</button>
                                                            <button className="icon-btn" onClick={() => setModal({ type: 'edit', item: m })}>✏️</button>
                                                            <button className="icon-btn danger" onClick={() => setModal({ type: 'del', item: m })}>🗑️</button>
                                                        </td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="pagination">
                                    <span>Hiển thị {filtered.length} / {data.length}</span>
                                    <div className="page-btns"><button>←</button><button className="active">1</button><button>→</button></div>
                                </div>
                            </>
                        )}

                        {['schedules', 'products', 'messages', 'settings'].includes(tab) && (
                            <div className="empty-page"><div className="empty-icon">🚧</div><h2>Đang phát triển</h2><p>Chức năng này sẽ sớm được cập nhật</p></div>
                        )}
                    </div>
                </main>
            </div>

            {/* Modal */}
            {modal && (
                <div className="modal-overlay" onClick={() => setModal(null)}>
                    <div className="modal glass animate-modal" onClick={e => e.stopPropagation()}>
                        <button className="close-btn" onClick={() => setModal(null)}>✕</button>
                        {modal.type === 'add' && <Form onSubmit={add} />}
                        {modal.type === 'edit' && modal.item && <Form item={modal.item} onSubmit={edit} />}
                        {modal.type === 'view' && modal.item && <View item={modal.item} />}
                        {(modal.type === 'del' || modal.type === 'del-multi') && (
                            <div className="confirm"><div className="warn-icon">⚠️</div><h3>Xác nhận xóa?</h3><p>Hành động này không thể hoàn tác</p>
                                <div className="btn-row"><button className="btn outline" onClick={() => setModal(null)}>Hủy</button><button className="btn danger" onClick={() => del(modal.type === 'del-multi' ? selected : [modal.item!.id])}>Xóa</button></div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast && <div className={`toast ${toast.type}`}><span>{toast.msg}</span><div className="progress" style={{ width: `${toast.progress}%` }}></div></div>}

            <style>{css(dark)}</style>
        </div>
    );
};

// Form Component
const Form: React.FC<{ item?: Member; onSubmit: (m: any) => void }> = ({ item, onSubmit }) => {
    const [f, setF] = useState(item || { name: '', email: '', phone: '', type: 'Basic', status: 'active', fee: '' });
    return (
        <form className="form" onSubmit={e => { e.preventDefault(); onSubmit(f); }}>
            <h3>{item ? '✏️ Chỉnh sửa' : '➕ Thêm mới'}</h3>
            <div className="input-float"><input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} required /><label>Họ tên *</label></div>
            <div className="input-float"><input type="email" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} required /><label>Email *</label></div>
            <div className="input-float"><input value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} /><label>Số điện thoại</label></div>
            <div className="row">
                <div className="input-float"><select value={f.type} onChange={e => setF({ ...f, type: e.target.value })}><option>Basic</option><option>Premium</option><option>VIP</option></select><label>Gói</label></div>
                <div className="input-float"><select value={f.status} onChange={e => setF({ ...f, status: e.target.value })}><option value="active">Hoạt động</option><option value="inactive">Ngưng</option></select><label>Trạng thái</label></div>
            </div>
            <div className="input-float"><input value={f.fee} onChange={e => setF({ ...f, fee: e.target.value })} /><label>Phí thành viên</label></div>
            <div className="btn-row"><button type="submit" className="btn primary">Lưu</button></div>
        </form>
    );
};

// View Component
const View: React.FC<{ item: Member }> = ({ item }) => (
    <div className="view"><h3>👤 Thông tin</h3>
        {[['ID', '#' + item.id.slice(-4)], ['Họ tên', item.name], ['Email', item.email], ['SĐT', item.phone], ['Gói', item.type], ['Trạng thái', item.status === 'active' ? 'Hoạt động' : 'Ngưng'], ['Ngày tạo', item.createdAt]].map(([k, v], i) => (
            <div key={i} className="info-row"><span>{k}</span><strong>{v}</strong></div>
        ))}
    </div>
);

// Styles
const css = (dark: boolean) => `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
:root{--bg:${dark ? '#0f172a' : '#f1f5f9'};--bg2:${dark ? '#1e293b' : '#fff'};--glass:${dark ? 'rgba(30,41,59,0.8)' : 'rgba(255,255,255,0.7)'};--text:${dark ? '#f1f5f9' : '#1e293b'};--text2:${dark ? '#94a3b8' : '#64748b'};--border:${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'};--primary:#3b82f6;--success:#10b981;--danger:#ef4444;--purple:#8b5cf6;--gold:#f59e0b}

/* Animations */
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes slideIn{from{opacity:0;transform:translateX(-20px)}to{opacity:1;transform:translateX(0)}}
@keyframes scaleIn{from{opacity:0;transform:scale(0.9)}to{opacity:1;transform:scale(1)}}
@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes progress{from{width:100%}to{width:0}}

.animate-in{animation:scaleIn 0.4s cubic-bezier(0.16,1,0.3,1)}
.animate-up{animation:slideUp 0.5s cubic-bezier(0.16,1,0.3,1) both}
.animate-page{animation:fadeIn 0.3s ease}
.animate-modal{animation:scaleIn 0.3s cubic-bezier(0.16,1,0.3,1)}
.row-animate{animation:slideUp 0.4s cubic-bezier(0.16,1,0.3,1) both}

/* Glass */
.glass{background:var(--glass);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid var(--border)}

/* Base */
body,.admin,.login-screen{font-family:'Inter',sans-serif;background:var(--bg);color:var(--text);min-height:100vh;transition:background 0.3s,color 0.3s}

/* Login */
.login-screen{display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden}
.login-bg{position:absolute;inset:0;background:linear-gradient(135deg,var(--primary),var(--purple));opacity:0.1}
.login-card{position:relative;z-index:1;padding:48px;border-radius:24px;text-align:center;width:100%;max-width:400px}
.login-icon{font-size:4rem;margin-bottom:16px;animation:pulse 2s infinite}
.login-card h1{font-size:1.75rem;margin-bottom:8px}
.login-card>p{color:var(--text2);margin-bottom:32px}
.login-card form{display:flex;flex-direction:column;gap:20px}
.login-footer{display:flex;justify-content:space-between;align-items:center;margin-top:24px}
.login-footer a{color:var(--text2);text-decoration:none;transition:color 0.2s}
.login-footer a:hover{color:var(--primary)}

/* Float Input */
.input-float{position:relative}
.input-float input,.input-float select{width:100%;padding:16px;background:var(--bg);border:2px solid var(--border);border-radius:12px;color:var(--text);font-size:1rem;transition:all 0.3s}
.input-float label{position:absolute;left:16px;top:50%;transform:translateY(-50%);color:var(--text2);pointer-events:none;transition:all 0.2s}
.input-float input:focus,.input-float input:valid,.input-float select:focus{border-color:var(--primary);box-shadow:0 0 0 4px rgba(59,130,246,0.15)}
.input-float input:focus+label,.input-float input:valid+label,.input-float select:focus+label,.input-float select:valid+label{top:0;font-size:0.75rem;background:var(--bg2);padding:0 8px;color:var(--primary)}

/* Buttons */
.btn{padding:12px 24px;border-radius:12px;font-weight:600;cursor:pointer;transition:all 0.2s;border:none;display:inline-flex;align-items:center;gap:8px}
.btn.primary{background:linear-gradient(135deg,var(--primary),#2563eb);color:#fff;box-shadow:0 4px 15px rgba(59,130,246,0.3)}
.btn.primary:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(59,130,246,0.4)}
.btn.primary:active{transform:scale(0.98)}
.btn.outline{background:transparent;border:2px solid var(--border);color:var(--text)}
.btn.outline:hover{border-color:var(--primary);color:var(--primary)}
.btn.danger{background:var(--danger);color:#fff}
.btn.danger:hover{background:#dc2626}
.btn.loading{pointer-events:none;opacity:0.7}
.spinner{width:20px;height:20px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:spin 0.8s linear infinite}
.theme-btn{background:none;border:none;font-size:1.5rem;cursor:pointer;transition:transform 0.3s}
.theme-btn:hover{transform:rotate(180deg)}

/* Layout */
.topbar{position:sticky;top:0;z-index:100;display:flex;justify-content:space-between;align-items:center;padding:12px 24px;border-radius:0 0 16px 16px}
.topbar-left,.topbar-right{display:flex;align-items:center;gap:16px}
.logo{font-weight:700;font-size:1.1rem}
.menu-btn{background:none;border:none;font-size:1.2rem;color:var(--text);cursor:pointer}
.avatar-wrap{display:flex;align-items:center;gap:8px}
.avatar{width:36px;height:36px;border-radius:12px;background:linear-gradient(135deg,var(--primary),var(--purple));color:#fff;display:flex;align-items:center;justify-content:center;font-weight:600;transition:transform 0.2s}
.avatar:hover{transform:scale(1.1)}
.logout-btn{background:rgba(239,68,68,0.1);color:var(--danger);border:none;padding:8px 16px;border-radius:8px;cursor:pointer;font-weight:500;transition:all 0.2s}
.logout-btn:hover{background:var(--danger);color:#fff}

.layout{display:flex}
.sidebar{width:240px;padding:20px 12px;display:flex;flex-direction:column;gap:8px;border-radius:0 16px 16px 0;margin:16px 0 16px 16px;transition:width 0.3s,opacity 0.3s}
.sidebar.closed{width:70px}.sidebar.closed .label{display:none}
.sidebar button{display:flex;align-items:center;gap:12px;padding:14px 16px;border:none;background:none;color:var(--text2);border-radius:12px;cursor:pointer;position:relative;transition:all 0.2s;animation:slideIn 0.4s cubic-bezier(0.16,1,0.3,1) both}
.sidebar button:hover{background:rgba(59,130,246,0.1);color:var(--primary)}
.sidebar button.active{background:linear-gradient(135deg,var(--primary),#2563eb);color:#fff;box-shadow:0 4px 15px rgba(59,130,246,0.3)}
.sidebar .icon{font-size:1.2rem}
.sidebar .indicator{position:absolute;right:0;top:50%;transform:translateY(-50%);width:4px;height:24px;background:#fff;border-radius:4px}

.main{flex:1;padding:24px;overflow-y:auto}
.page-title{font-size:1.5rem;margin-bottom:24px;animation:slideUp 0.4s ease}

/* Stats */
.stats-row{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px}
.stat-card{padding:24px;border-radius:16px;animation:slideUp 0.5s cubic-bezier(0.16,1,0.3,1) both}
.stat-card.blue{border-left:4px solid var(--primary)}.stat-card.green{border-left:4px solid var(--success)}.stat-card.gold{border-left:4px solid var(--gold)}.stat-card.purple{border-left:4px solid var(--purple)}
.stat-value{font-size:2.5rem;font-weight:700;background:linear-gradient(135deg,var(--primary),var(--purple));-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.stat-label{color:var(--text2);margin-top:8px}

.card{padding:24px;border-radius:16px}
.activity-list{list-style:none}
.activity-list li{padding:12px 0;border-bottom:1px solid var(--border);color:var(--text2);animation:slideIn 0.4s ease both}

/* Table */
.section-header{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;margin-bottom:20px}
.actions{display:flex;gap:8px}
.toolbar{display:flex;justify-content:space-between;align-items:center;padding:16px;border-radius:16px;margin-bottom:16px}
.search-wrap{display:flex;align-items:center;gap:8px;background:var(--bg);padding:10px 16px;border-radius:12px;border:2px solid transparent;transition:all 0.3s}
.search-wrap:focus-within{border-color:var(--primary);box-shadow:0 0 0 4px rgba(59,130,246,0.1)}
.search-wrap input{border:none;background:none;color:var(--text);outline:none;width:200px}

.table-wrap{border-radius:16px;overflow:hidden}
table{width:100%;border-collapse:collapse}
th,td{padding:16px;text-align:left}
th{background:var(--bg);color:var(--text2);font-size:0.8rem;text-transform:uppercase;letter-spacing:0.5px;cursor:pointer;user-select:none;position:sticky;top:0}
th:hover{color:var(--text)}
.sort-icon{opacity:0.3;transition:all 0.2s}.sort-icon.asc{opacity:1;color:var(--primary)}.sort-icon.desc{opacity:1;color:var(--primary);transform:rotate(180deg)}
tr{border-bottom:1px solid var(--border);transition:all 0.2s}
tr:hover{background:rgba(59,130,246,0.05)}
tr.selected{background:rgba(59,130,246,0.1)}
.id{color:var(--text2);font-family:monospace}
.user-cell{display:flex;align-items:center;gap:12px}
.user-avatar{width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,var(--primary),var(--purple));color:#fff;display:flex;align-items:center;justify-content:center;font-weight:600}

.badge{padding:6px 12px;border-radius:20px;font-size:0.75rem;font-weight:600}
.badge.vip{background:rgba(245,158,11,0.15);color:var(--gold)}.badge.premium{background:rgba(139,92,246,0.15);color:var(--purple)}.badge.basic{background:rgba(59,130,246,0.15);color:var(--primary)}

.status-pill{display:inline-flex;align-items:center;gap:6px;font-size:0.85rem}
.status-pill .dot{width:8px;height:8px;border-radius:50%;animation:pulse 2s infinite}
.status-pill.active .dot{background:var(--success)}.status-pill.inactive .dot{background:var(--text2)}

.actions-cell{display:flex;gap:4px}
.icon-btn{background:none;border:none;padding:8px;border-radius:8px;cursor:pointer;transition:all 0.2s}
.icon-btn:hover{background:var(--bg)}.icon-btn.danger:hover{background:rgba(239,68,68,0.1)}

.empty{text-align:center;padding:60px}
.empty-state{color:var(--text2)}.empty-state p{margin-top:8px}

.pagination{display:flex;justify-content:space-between;align-items:center;margin-top:16px;color:var(--text2)}
.page-btns{display:flex;gap:4px}
.page-btns button{padding:8px 14px;border:1px solid var(--border);background:var(--bg2);color:var(--text);border-radius:8px;cursor:pointer;transition:all 0.2s}
.page-btns button:hover,.page-btns button.active{background:var(--primary);color:#fff;border-color:var(--primary)}

.empty-page{text-align:center;padding:80px 20px;color:var(--text2)}
.empty-icon{font-size:4rem;margin-bottom:16px}

/* Modal */
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.5);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:200;padding:20px}
.modal{padding:32px;border-radius:24px;width:100%;max-width:480px;position:relative}
.close-btn{position:absolute;top:16px;right:16px;background:none;border:none;font-size:1.2rem;color:var(--text2);cursor:pointer;transition:color 0.2s}
.close-btn:hover{color:var(--text)}
.form h3,.view h3,.confirm h3{margin-bottom:24px}
.form{display:flex;flex-direction:column;gap:20px}
.row{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.btn-row{display:flex;justify-content:flex-end;gap:12px;margin-top:8px}
.view .info-row{display:flex;justify-content:space-between;padding:14px 0;border-bottom:1px solid var(--border)}
.view .info-row span{color:var(--text2)}
.confirm{text-align:center}
.warn-icon{font-size:4rem;margin-bottom:16px}
.confirm p{color:var(--text2);margin-bottom:24px}
.confirm .btn-row{justify-content:center}

/* Toast */
.toast{position:fixed;bottom:24px;right:24px;padding:16px 24px;border-radius:12px;color:#fff;font-weight:500;z-index:300;animation:slideUp 0.3s ease;overflow:hidden}
.toast.success{background:var(--success)}.toast.error{background:var(--danger)}
.toast .progress{position:absolute;bottom:0;left:0;height:3px;background:rgba(255,255,255,0.3);transition:width 0.1s linear}

/* Responsive */
@media(max-width:1024px){.stats-row{grid-template-columns:repeat(2,1fr)}}
@media(max-width:768px){.layout{flex-direction:column}.sidebar{width:100%;flex-direction:row;overflow-x:auto;margin:0;border-radius:0}.sidebar .label,.sidebar .indicator{display:none}.main{padding:16px}}
`;

export default AdminPanel;
