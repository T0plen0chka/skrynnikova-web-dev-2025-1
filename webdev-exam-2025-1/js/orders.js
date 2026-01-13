document.addEventListener('DOMContentLoaded', () => {
    const ordersBody = document.getElementById('orders-body');
    const noOrders = document.getElementById('no-orders');
    
    let orders = [];
    let deleteOrderId = null;
    
    cart.updateCount();
    loadOrders();
    
    // Загрузка заказов
    async function loadOrders() {
        try {
            orders = await api.getOrders();
            
            if (!orders || orders.length === 0) {
                noOrders.style.display = 'block';
                return;
            }
            
            noOrders.style.display = 'none';
            ordersBody.innerHTML = '';
            
            const ordersWithDetails = await Promise.all(orders.map(async (order) => {
                const products = await Promise.all(order.good_ids.map(id => api.getGoodById(id)));
                const total = products.reduce((sum, p) => sum + (p?.discount_price || p?.actual_price || 0), 0);
                return { ...order, products, total };
            }));
            
            ordersWithDetails.forEach((order, index) => {
                const date = new Date(order.created_at);
                const itemsText = order.products.slice(0, 2).map(p => p?.name).join(', ') + 
                    (order.products.length > 2 ? '...' : '');
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${date.toLocaleDateString('ru-RU')} ${date.toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'})}</td>
                    <td title="${itemsText}">${itemsText}</td>
                    <td>${order.total} ₽</td>
                    <td>${order.delivery_date}<br>${order.delivery_interval}</td>
                    <td class="actions">
                        <button class="action-btn view-btn" data-id="${order.id}"><i class="fas fa-eye"></i></button>
                        <button class="action-btn edit-btn" data-id="${order.id}"><i class="fas fa-edit"></i></button>
                        <button class="action-btn delete-btn" data-id="${order.id}"><i class="fas fa-trash"></i></button>
                    </td>
                `;
                ordersBody.appendChild(row);
            });
            
            // Обработчики кнопок
            document.querySelectorAll('.view-btn').forEach(btn => {
                btn.addEventListener('click', () => viewOrder(parseInt(btn.dataset.id)));
            });
            
            document.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', () => editOrder(parseInt(btn.dataset.id)));
            });
            
            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', () => confirmDelete(parseInt(btn.dataset.id)));
            });
            
        } catch (error) {
            console.error('Ошибка загрузки заказов:', error);
            noOrders.style.display = 'block';
            noOrders.innerHTML = '<p style="color: red;">Ошибка загрузки</p>';
        }
    }
    
    // Просмотр заказа
    async function viewOrder(id) {
        try {
            const order = await api.getOrder(id);
            const products = await Promise.all(order.good_ids.map(id => api.getGoodById(id)));
            
            const modal = document.getElementById('view-order-modal');
            const content = document.getElementById('view-order-content');
            
            content.innerHTML = `
                <div class="order-details">
                    <p><strong>Имя:</strong> ${order.full_name}</p>
                    <p><strong>Телефон:</strong> ${order.phone}</p>
                    <p><strong>Адрес:</strong> ${order.delivery_address}</p>
                    <p><strong>Дата доставки:</strong> ${order.delivery_date}</p>
                    <p><strong>Время:</strong> ${order.delivery_interval}</p>
                    <p><strong>Товары:</strong></p>
                    <ul>${products.map(p => p ? `<li>${p.name} - ${p.discount_price || p.actual_price} ₽</li>` : '').join('')}</ul>
                    ${order.comment ? `<p><strong>Комментарий:</strong> ${order.comment}</p>` : ''}
                </div>
            `;
            
            modal.classList.add('active');
        } catch (error) {
            notifications.showError('Ошибка загрузки заказа');
        }
    }
    
    // Редактирование заказа
    async function editOrder(id) {
        try {
            const order = await api.getOrder(id);
            const [day, month, year] = order.delivery_date.split('.');
            
            document.getElementById('edit-name').value = order.full_name;
            document.getElementById('edit-phone').value = order.phone;
            document.getElementById('edit-email').value = order.email;
            document.getElementById('edit-address').value = order.delivery_address;
            document.getElementById('edit-date').value = `${year}-${month}-${day}`;
            document.getElementById('edit-interval').value = order.delivery_interval;
            document.getElementById('edit-comment').value = order.comment || '';
            
            const modal = document.getElementById('edit-order-modal');
            modal.dataset.orderId = id;
            modal.classList.add('active');
            
        } catch (error) {
            notifications.showError('Ошибка загрузки заказа');
        }
    }
    
    // Подтверждение удаления
    function confirmDelete(id) {
        deleteOrderId = id;
        document.getElementById('delete-order-modal').classList.add('active');
    }
    
    // Удаление заказа
    async function deleteOrder() {
        if (!deleteOrderId) return;
        
        try {
            await api.deleteOrder(deleteOrderId);
            notifications.showSuccess('Заказ удален');
            document.getElementById('delete-order-modal').classList.remove('active');
            loadOrders();
        } catch (error) {
            notifications.showError('Ошибка удаления');
        }
    }
    
    // Сохранение изменений
    document.getElementById('edit-order-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const id = document.getElementById('edit-order-modal').dataset.orderId;
        const date = new Date(document.getElementById('edit-date').value);
        const formattedDate = `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
        
        const data = {
            full_name: document.getElementById('edit-name').value,
            phone: document.getElementById('edit-phone').value,
            email: document.getElementById('edit-email').value,
            delivery_address: document.getElementById('edit-address').value,
            delivery_date: formattedDate,
            delivery_interval: document.getElementById('edit-interval').value,
            comment: document.getElementById('edit-comment').value || ''
        };
        
        try {
            await api.updateOrder(id, data);
            notifications.showSuccess('Заказ обновлен');
            document.getElementById('edit-order-modal').classList.remove('active');
            loadOrders();
        } catch (error) {
            notifications.showError('Ошибка обновления');
        }
    });
    
    // Закрытие модальных окон
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.classList.remove('active');
            });
        });
    });
    
    // Подтверждение удаления
    document.getElementById('confirm-delete').addEventListener('click', deleteOrder);
    
    // Закрытие при клике вне окна
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('active');
        });
    });
});