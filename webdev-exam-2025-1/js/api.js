const API_CONFIG = {
    BASE_URL: 'https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api',
    API_KEY: '0619ea01-3d30-4d86-b384-f68d2e7f9029'
};

const api = {
    async request(url, options = {}) {
        const fullUrl = new URL(`${API_CONFIG.BASE_URL}${url}`);
        fullUrl.searchParams.append('api_key', API_CONFIG.API_KEY);
        
        if (options.params) {
            Object.entries(options.params).forEach(([key, value]) => {
                if (value) fullUrl.searchParams.append(key, value);
            });
        }
        
        const config = {
            method: options.method || 'GET',
            headers: {
                'Accept': 'application/json',
                ...options.headers
            }
        };
        
        if (options.body) {
            config.body = JSON.stringify(options.body);
            config.headers['Content-Type'] = 'application/json';
        }
        
        try {
            const response = await fetch(fullUrl, config);
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    // Товары
    getGoods(params) {
        return this.request('/goods', { params });
    },
    
    getGoodById(id) {
        return this.request(`/goods/${id}`);
    },
    
    // Автодополнение
    getAutocomplete(query) {
        return this.request('/autocomplete', { params: { query } });
    },
    
    // Заказы
    getOrders() {
        return this.request('/orders');
    },
    
    getOrder(id) {
        return this.request(`/orders/${id}`);
    },
    
    createOrder(data) {
        return this.request('/orders', { method: 'POST', body: data });
    },
    
    updateOrder(id, data) {
        return this.request(`/orders/${id}`, { method: 'PUT', body: data });
    },
    
    deleteOrder(id) {
        return this.request(`/orders/${id}`, { method: 'DELETE' });
    }
};

// Корзина
const cart = {
    key: 'shopping_cart',
    
    get() {
        return JSON.parse(localStorage.getItem(this.key) || '[]');
    },
    
    save(items) {
        localStorage.setItem(this.key, JSON.stringify(items));
    },
    
    add(productId) {
        const items = this.get();
        if (!items.includes(productId)) {
            items.push(productId);
            this.save(items);
            this.updateCount();
            return true;
        }
        return false;
    },
    
    remove(productId) {
        let items = this.get();
        items = items.filter(id => id !== productId);
        this.save(items);
        this.updateCount();
    },
    
    clear() {
        localStorage.removeItem(this.key);
        this.updateCount();
    },
    
    updateCount() {
        const count = this.get().length;
        document.querySelectorAll('.cart-count').forEach(el => {
            el.textContent = count;
            el.style.display = count > 0 ? 'flex' : 'none';
        });
    }
};