document.addEventListener('DOMContentLoaded', () => {
    const catalogGrid = document.getElementById('catalog-grid');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const sortSelect = document.getElementById('sort-select');
    const categoryList = document.getElementById('category-list');
    const applyBtn = document.getElementById('apply-filters');
    const autocomplete = document.getElementById('autocomplete-dropdown');
    
    let allProducts = [];
    let filters = {
        categories: [],
        minPrice: 100,
        maxPrice: 5000,
        discountOnly: false,
        query: '',
        sortBy: 'rating_desc'
    };
    
    cart.updateCount();
    loadProducts();
    
    // События
    searchBtn.addEventListener('click', searchProducts);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchProducts();
    });
    
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        if (query.length >= 2) {
            setTimeout(() => getAutocomplete(query), 300);
        } else {
            autocomplete.style.display = 'none';
        }
    });
    
    sortSelect.addEventListener('change', (e) => {
        filters.sortBy = e.target.value;
        applyFilters();
    });
    
    applyBtn.addEventListener('click', () => {
        updateFilters();
        applyFilters();
    });
    
    // Загрузка товаров
    async function loadProducts() {
        try {
            allProducts = await api.getGoods({ query: filters.query });
            updateCategories();
            applyFilters();
        } catch (error) {
            console.error('Ошибка:', error);
            catalogGrid.innerHTML = '<div style="text-align: center; padding: 40px;">Ошибка загрузки</div>';
        }
    }
    
    // Поиск
    function searchProducts() {
        filters.query = searchInput.value.trim();
        loadProducts();
    }
    
    // Автодополнение
    async function getAutocomplete(query) {
        try {
            const suggestions = await api.getAutocomplete(query);
            if (suggestions.length === 0) return;
            
            autocomplete.innerHTML = suggestions.map(text => 
                `<div class="autocomplete-item">${text}</div>`
            ).join('');
            
            autocomplete.style.display = 'block';
            
            autocomplete.querySelectorAll('.autocomplete-item').forEach(item => {
                item.addEventListener('click', () => {
                    searchInput.value = item.textContent;
                    autocomplete.style.display = 'none';
                });
            });
        } catch (error) {
            console.error('Ошибка автодополнения:', error);
        }
    }
    
    // Применение фильтров
    function applyFilters() {
        let filtered = [...allProducts];
        
        // Фильтрация
        if (filters.categories.length > 0) {
            filtered = filtered.filter(p => filters.categories.includes(p.main_category));
        }
        
        filtered = filtered.filter(p => {
            const price = p.discount_price || p.actual_price;
            return price >= filters.minPrice && price <= filters.maxPrice;
        });
        
        if (filters.discountOnly) {
            filtered = filtered.filter(p => p.discount_price);
        }
        
        // Сортировка
        filtered.sort((a, b) => {
            const priceA = a.discount_price || a.actual_price;
            const priceB = b.discount_price || b.actual_price;
            
            switch (filters.sortBy) {
                case 'rating_desc': return b.rating - a.rating;
                case 'rating_asc': return a.rating - b.rating;
                case 'price_desc': return priceB - priceA;
                case 'price_asc': return priceA - priceB;
                case 'discount_desc':
                    const discA = a.discount_price ? ((a.actual_price - a.discount_price) / a.actual_price) * 100 : 0;
                    const discB = b.discount_price ? ((b.actual_price - b.discount_price) / b.actual_price) * 100 : 0;
                    return discB - discA;
                default: return 0;
            }
        });
        
        showProducts(filtered);
    }
    
    // Отображение товаров
    function showProducts(products) {
        if (!products || products.length === 0) {
            catalogGrid.innerHTML = '<div style="text-align: center; padding: 40px;">Товары не найдены</div>';
            return;
        }
        
        const cartItems = cart.get();
        
        catalogGrid.innerHTML = products.map(product => {
            const inCart = cartItems.includes(product.id);
            const hasDiscount = product.discount_price && product.discount_price < product.actual_price;
            const discountPercent = hasDiscount ? 
                Math.round(((product.actual_price - product.discount_price) / product.actual_price) * 100) : 0;
            const price = hasDiscount ? product.discount_price : product.actual_price;
            
            return `
                <div class="product-card">
                    <img src="${product.image_url}" alt="${product.name}" class="product-image"
                         onerror="this.src='https://via.placeholder.com/250x200?text=No+Image'">
                    <div class="product-info">
                        <h3 title="${product.name}">${product.name}</h3>
                        <div class="rating">${getStars(product.rating)} ${product.rating?.toFixed(1) || '0.0'}</div>
                        <div class="price">
                            <span class="current-price">${price} ₽</span>
                            ${hasDiscount ? `
                                <span class="old-price">${product.actual_price} ₽</span>
                                <span class="discount">-${discountPercent}%</span>
                            ` : ''}
                        </div>
                        <button class="add-to-cart-btn ${inCart ? 'added' : ''}" data-id="${product.id}">
                            ${inCart ? 'В корзине' : 'Добавить'}
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
        // Обработчики кнопок
        document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                const inCart = e.target.classList.contains('added');
                
                if (inCart) {
                    cart.remove(id);
                    e.target.textContent = 'Добавить';
                    e.target.classList.remove('added');
                    notifications.showInfo('Удалено из корзины');
                } else {
                    cart.add(id);
                    e.target.textContent = 'В корзине';
                    e.target.classList.add('added');
                    notifications.showSuccess('Добавлено в корзину');
                }
            });
        });
    }
    
    // Обновление категорий
    function updateCategories() {
        const categories = [...new Set(allProducts.map(p => p.main_category).filter(Boolean))];
        
        categoryList.innerHTML = categories.map(cat => `
            <label class="checkbox-label">
                <input type="checkbox" value="${cat}" ${filters.categories.includes(cat) ? 'checked' : ''}>
                <span>${cat}</span>
            </label>
        `).join('');
        
        categoryList.querySelectorAll('input').forEach(cb => {
            cb.addEventListener('change', updateFilters);
        });
    }
    
    // Обновление фильтров из UI
    function updateFilters() {
        filters.categories = Array.from(
            categoryList.querySelectorAll('input:checked')
        ).map(cb => cb.value);
        
        filters.minPrice = parseInt(document.getElementById('price-min').value) || 0;
        filters.maxPrice = parseInt(document.getElementById('price-max').value) || 10000;
        filters.discountOnly = document.getElementById('discount-only').checked;
    }
    
    // Звезды рейтинга
    function getStars(rating) {
        if (!rating) return '☆☆☆☆☆';
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            stars += i <= Math.floor(rating) ? '★' : '☆';
        }
        return stars;
    }
    
    // Закрытие автодополнения при клике вне
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !autocomplete.contains(e.target)) {
            autocomplete.style.display = 'none';
        }
    });
});