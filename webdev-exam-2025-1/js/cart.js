document.addEventListener('DOMContentLoaded', () => {
    const cartItems = document.getElementById('cart-items');
    const emptyCart = document.getElementById('empty-cart');
    const orderForm = document.getElementById('order-form');
    const totalPrice = document.getElementById('total-price');
    const deliveryCost = document.getElementById('delivery-cost');
    const deliveryDate = document.getElementById('delivery-date');
    const deliveryInterval = document.getElementById('delivery-interval');
    
    // Установка минимальной даты (завтра)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    deliveryDate.min = tomorrow.toISOString().split('T')[0];
    
    cart.updateCount();
    loadCart();
    
    // Загрузка корзины
    async function loadCart() {
        const items = cart.get();
        
        if (items.length === 0) {
            cartItems.style.display = 'none';
            emptyCart.style.display = 'block';
            updateTotal();
            return;
        }
        
        emptyCart.style.display = 'none';
        cartItems.style.display = 'grid';
        cartItems.innerHTML = '<div class="loading">Загрузка...</div>';
        
        try {
            const products = await Promise.all(items.map(id => api.getGoodById(id)));
            let total = 0;
            
            cartItems.innerHTML = '';
            products.forEach(product => {
                if (!product) return;
                
                const price = product.discount_price || product.actual_price;
                total += price;
                
                const item = document.createElement('div');
                item.className = 'cart-item';
                item.innerHTML = `
                    <img src="${product.image_url}" alt="${product.name}" class="cart-item-image"
                         onerror="this.src='https://via.placeholder.com/100x100?text=No+Image'">
                    <div class="cart-item-info">
                        <h4 title="${product.name}">${product.name}</h4>
                        <div class="rating">${getStars(product.rating)} ${product.rating?.toFixed(1) || '0.0'}</div>
                        <div class="cart-item-price">
                            <strong>${price} ₽</strong>
                            ${product.discount_price ? `<s>${product.actual_price} ₽</s>` : ''}
                        </div>
                    </div>
                    <button class="remove-btn" data-id="${product.id}">Удалить</button>
                `;
                cartItems.appendChild(item);
            });
            
            updateTotal(total);
            
            // Обработчики удаления
            document.querySelectorAll('.remove-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = parseInt(e.target.dataset.id);
                    cart.remove(id);
                    loadCart();
                    notifications.showInfo('Товар удален из корзины');
                });
            });
            
        } catch (error) {
            console.error('Ошибка загрузки корзины:', error);
            cartItems.innerHTML = '<div style="text-align: center; padding: 40px;">Ошибка при загрузке корзины</div>';
        }
    }
    
    // Расчет общей суммы
    function updateTotal(itemsTotal = 0) {
        const date = new Date(deliveryDate.value);
        const interval = deliveryInterval.value;
        const cost = getDeliveryCost(date, interval);
        
        deliveryCost.textContent = cost;
        totalPrice.textContent = itemsTotal + cost;
    }
    
    // Расчет стоимости доставки
    function getDeliveryCost(date, interval) {
        let cost = 200;
        const day = date.getDay(); // 0=вс, 6=сб
        
        if (day === 0 || day === 6) {
            cost += 300;
        } else if (interval === '18:00-22:00') {
            cost += 200;
        }
        
        return cost;
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
    
    // Оформление заказа
    orderForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const items = cart.get();
        if (items.length === 0) {
            notifications.showError('Корзина пуста');
            return;
        }
        
        // Форматирование даты
        const date = new Date(deliveryDate.value);
        const formattedDate = `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
        
        const orderData = {
            full_name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            subscribe: document.getElementById('subscribe').checked,
            delivery_address: document.getElementById('address').value,
            delivery_date: formattedDate,
            delivery_interval: deliveryInterval.value,
            comment: document.getElementById('comment').value || '',
            good_ids: items
        };
        
        try {
            await api.createOrder(orderData);
            notifications.showSuccess('Заказ оформлен!');
            cart.clear();
            setTimeout(() => window.location.href = 'index.html', 2000);
        } catch (error) {
            notifications.showError('Ошибка: ' + error.message);
        }
    });
    
    // Сброс формы
    document.getElementById('reset-form').addEventListener('click', () => {
        orderForm.reset();
        updateTotal();
    });
    
    // Обновление при изменении доставки
    deliveryDate.addEventListener('change', () => updateTotal());
    deliveryInterval.addEventListener('change', () => updateTotal());
});