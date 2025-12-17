/**
 * API Service - Kết nối Frontend với Backend
 * CLB Bóng Bàn Lê Quý Đôn
 */

// Production: Render.com | Development: localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || (
    typeof window !== 'undefined' && window.location.hostname === 'localhost'
        ? 'http://localhost:3001/api'
        : 'https://projects-0x2d.onrender.com/api'
);

/**
 * Fetch wrapper với error handling
 */
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    const config: RequestInit = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    };

    // Add auth token if exists
    const token = localStorage.getItem('admin_token');
    if (token) {
        config.headers = {
            ...config.headers,
            'Authorization': `Bearer ${token}`,
        };
    }

    try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Đã xảy ra lỗi');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// ============================================
// AUTH API
// ============================================
export const authAPI = {
    login: async (username: string, password: string) => {
        const data = await fetchAPI('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        });
        if (data.data?.token) {
            localStorage.setItem('admin_token', data.data.token);
            localStorage.setItem('admin_user', JSON.stringify(data.data.admin));
        }
        return data;
    },

    logout: () => {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
    },

    getMe: async () => {
        return fetchAPI('/auth/me');
    },

    isLoggedIn: () => {
        return !!localStorage.getItem('admin_token');
    },

    getUser: () => {
        const user = localStorage.getItem('admin_user');
        return user ? JSON.parse(user) : null;
    }
};

// ============================================
// COACHES API
// ============================================
export const coachesAPI = {
    getAll: async () => {
        return fetchAPI('/coaches');
    },

    getById: async (id: string) => {
        return fetchAPI(`/coaches/${id}`);
    },

    create: async (data: any) => {
        return fetchAPI('/coaches', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    update: async (id: string, data: any) => {
        return fetchAPI(`/coaches/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    delete: async (id: string) => {
        return fetchAPI(`/coaches/${id}`, {
            method: 'DELETE',
        });
    }
};

// ============================================
// SCHEDULE API
// ============================================
export const scheduleAPI = {
    getWeekly: async () => {
        return fetchAPI('/schedule');
    },

    getByDay: async (day: number) => {
        return fetchAPI(`/schedule/day/${day}`);
    },

    getByCoach: async (coachId: string) => {
        return fetchAPI(`/schedule/coach/${coachId}`);
    },

    create: async (data: any) => {
        return fetchAPI('/schedule', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    update: async (id: string, data: any) => {
        return fetchAPI(`/schedule/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    delete: async (id: string) => {
        return fetchAPI(`/schedule/${id}`, {
            method: 'DELETE',
        });
    }
};

// ============================================
// MEMBERS API
// ============================================
export const membersAPI = {
    getAll: async (params?: { status?: string; payment_type?: string }) => {
        const query = new URLSearchParams(params as any).toString();
        return fetchAPI(`/members${query ? `?${query}` : ''}`);
    },

    getById: async (id: string) => {
        return fetchAPI(`/members/${id}`);
    },

    create: async (data: any) => {
        return fetchAPI('/members', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    update: async (id: string, data: any) => {
        return fetchAPI(`/members/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    delete: async (id: string) => {
        return fetchAPI(`/members/${id}`, {
            method: 'DELETE',
        });
    },

    getStats: async () => {
        return fetchAPI('/members/stats');
    }
};

// ============================================
// PAYMENTS API
// ============================================
export const paymentsAPI = {
    getAll: async (params?: { member_id?: string }) => {
        const query = new URLSearchParams(params as any).toString();
        return fetchAPI(`/payments${query ? `?${query}` : ''}`);
    },

    create: async (data: any) => {
        return fetchAPI('/payments', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    getStats: async () => {
        return fetchAPI('/payments/stats');
    },

    delete: async (id: string) => {
        return fetchAPI(`/payments/${id}`, {
            method: 'DELETE',
        });
    }
};

// ============================================
// EVENTS API
// ============================================
export const eventsAPI = {
    getAll: async () => {
        return fetchAPI('/events');
    },

    create: async (data: any) => {
        return fetchAPI('/events', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    update: async (id: string, data: any) => {
        return fetchAPI(`/events/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    delete: async (id: string) => {
        return fetchAPI(`/events/${id}`, {
            method: 'DELETE',
        });
    }
};

// ============================================
// GALLERY API
// ============================================
export const galleryAPI = {
    getAll: async () => {
        return fetchAPI('/gallery');
    },

    getFeatured: async () => {
        return fetchAPI('/gallery/featured');
    },

    create: async (data: any) => {
        return fetchAPI('/gallery', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    delete: async (id: string) => {
        return fetchAPI(`/gallery/${id}`, {
            method: 'DELETE',
        });
    }
};

// ============================================
// CONTACT API
// ============================================
export const contactAPI = {
    submit: async (data: any) => {
        return fetchAPI('/contact', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    getAll: async () => {
        return fetchAPI('/contact');
    },

    updateStatus: async (id: string, status: string, notes?: string) => {
        return fetchAPI(`/contact/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status, notes }),
        });
    },

    delete: async (id: string) => {
        return fetchAPI(`/contact/${id}`, {
            method: 'DELETE',
        });
    }
};

// ============================================
// ORDERS API
// ============================================
export const ordersAPI = {
    getAll: async (params?: { status?: string }) => {
        const query = new URLSearchParams(params as any).toString();
        return fetchAPI(`/orders${query ? `?${query}` : ''}`);
    },

    create: async (data: any) => {
        return fetchAPI('/orders', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    updateStatus: async (id: string, status: string) => {
        return fetchAPI(`/orders/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status }),
        });
    }
};

// ============================================
// SYSTEM LOGS API
// ============================================
export const logsAPI = {
    getRecent: async () => {
        return fetchAPI('/logs');
    }
};

export default {
    auth: authAPI,
    coaches: coachesAPI,
    schedule: scheduleAPI,
    members: membersAPI,
    payments: paymentsAPI,
    events: eventsAPI,
    gallery: galleryAPI,
    contact: contactAPI,
    orders: ordersAPI,
    logs: logsAPI,
};
