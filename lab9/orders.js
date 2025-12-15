﻿// orders.js
document.addEventListener('DOMContentLoaded', function() {
    // Конфигурация API
    const API_URL = 'https://edu.std-900.ist.mospolytech.ru';
    const API_KEY = '0619ea01-3d30-4d86-b384-f68d2e7f9029';
    
    // Элементы DOM
    const ordersList = document.getElementById('orders-list');
    const loadingRow = document.getElementById('loading-row');
    const noOrdersMessage = document.getElementById('no-orders-message');
    const ordersTable = document.getElementById('orders-table');
    
    // Модальные окна
    const viewOrderModal = document.getElementById('view-order-modal');
    const editOrderModal = document.getElementById('edit-order-modal');
    const deleteOrderModal = document.getElementById('delete-order-modal');
    const notificationOverlay = document.getElementById('notification-overlay');
    const notification = document.getElementById('notification');
    
    // Текущий редактируемый/удаляемый заказ
    let currentOrderId = null;
    let allOrders = [];
    let allDishes = [];
    
    // Инициализация приложения
    async function initializeApp() {
        try {
            // Загружаем блюда для отображения названий
            await loadDishes();
            
            // Загружаем заказы пользователя
            await loadOrders();
            
            // Инициализируем модальные окна
            initializeModals();
            
        } catch (error) {
            console.error('Ошибка при инициализации:', error);
            showError('Произошла ошибка при загрузке данных. Пожалуйста, обновите страницу.');
        }
    }
    
    // Загрузка блюд с сервера
    async function loadDishes() {
        try {
            const response = await fetch(`${API_URL}/labs/api/dishes?api_key=${API_KEY}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const apiDishes = await response.json();
            allDishes = apiDishes;
            
        } catch (error) {
            console.error('Ошибка при загрузке блюд:', error);
        }
    }
    
    // Загрузка заказов пользователя
    async function loadOrders() {
        try {
            const response = await fetch(`${API_URL}/labs/api/orders?api_key=${API_KEY}`);
            
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Необходима авторизация. Проверьте ваш API ключ.');
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const orders = await response.json();
            allOrders = orders;
            
            // Сортируем по дате создания (новые сначала)
            allOrders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            
            displayOrders();
            
        } catch (error) {
            console.error('Ошибка при загрузке заказов:', error);
            showError(`Ошибка при загрузке заказов: ${error.message}`);
        }
    }
    
    // Отображение заказов в таблице
    function displayOrders() {
        loadingRow.style.display = 'none';
        
        if (allOrders.length === 0) {
            ordersTable.style.display = 'none';
            noOrdersMessage.style.display = 'block';
            return;
        }
        
        ordersTable.style.display = 'table';
        noOrdersMessage.style.display = 'none';
        
        // Очищаем таблицу (кроме строки загрузки)
        while (ordersList.children.length > 1) {
            ordersList.removeChild(ordersList.lastChild);
        }
        
        // Добавляем заказы в таблицу
        allOrders.forEach((order, index) => {
            const row = createOrderRow(order, index + 1);
            ordersList.appendChild(row);
        });
    }
    
    // Создание строки таблицы для заказа
    function createOrderRow(order, index) {
        const row = document.createElement('tr');
        row.dataset.orderId = order.id;
        
        // Форматируем дату
        const orderDate = new Date(order.created_at);
        const formattedDate = orderDate.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).replace(',', '');
        
        // Получаем состав заказа
        const orderComposition = getOrderComposition(order);
        
        // Получаем стоимость заказа
        const orderTotal = calculateOrderTotal(order);
        
        // Получаем время доставки
        const deliveryTime = getDeliveryTimeText(order);
        
        row.innerHTML = `
            <td>${index}</td>
            <td>${formattedDate}</td>
            <td>${orderComposition}</td>
            <td>${orderTotal}Р</td>
            <td>${deliveryTime}</td>
            <td class="actions-cell">
                <button class="action-btn view-btn" title="Подробнее">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="action-btn edit-btn" title="Редактировать">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="action-btn delete-btn" title="Удалить">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        
        // Добавляем обработчики событий для кнопок
        const viewBtn = row.querySelector('.view-btn');
        const editBtn = row.querySelector('.edit-btn');
        const deleteBtn = row.querySelector('.delete-btn');
        
        viewBtn.addEventListener('click', () => openViewModal(order));
        editBtn.addEventListener('click', () => openEditModal(order));
        deleteBtn.addEventListener('click', () => openDeleteModal(order, index));
        
        return row;
    }
    
    // Получение состава заказа в виде строки
    function getOrderComposition(order) {
        const dishes = [];
        
        // Получаем названия блюд по их ID
        if (order.soup_id) {
            const dish = allDishes.find(d => d.id === order.soup_id);
            if (dish) dishes.push(dish.name);
        }
        
        if (order.main_course_id) {
            const dish = allDishes.find(d => d.id === order.main_course_id);
            if (dish) dishes.push(dish.name);
        }
        
        if (order.salad_id) {
            const dish = allDishes.find(d => d.id === order.salad_id);
            if (dish) dishes.push(dish.name);
        }
        
        if (order.drink_id) {
            const dish = allDishes.find(d => d.id === order.drink_id);
            if (dish) dishes.push(dish.name);
        }
        
        if (order.dessert_id) {
            const dish = allDishes.find(d => d.id === order.dessert_id);
            if (dish) dishes.push(dish.name);
        }
        
        return dishes.join(', ');
    }
    
    // Расчет стоимости заказа
    function calculateOrderTotal(order) {
        let total = 0;
        
        // Суммируем цены блюд
        if (order.soup_id) {
            const dish = allDishes.find(d => d.id === order.soup_id);
            if (dish) total += dish.price;
        }
        
        if (order.main_course_id) {
            const dish = allDishes.find(d => d.id === order.main_course_id);
            if (dish) total += dish.price;
        }
        
        if (order.salad_id) {
            const dish = allDishes.find(d => d.id === order.salad_id);
            if (dish) total += dish.price;
        }
        
        if (order.drink_id) {
            const dish = allDishes.find(d => d.id === order.drink_id);
            if (dish) total += dish.price;
        }
        
        if (order.dessert_id) {
            const dish = allDishes.find(d => d.id === order.dessert_id);
            if (dish) total += dish.price;
        }
        
        return total;
    }
    
    // Получение текста времени доставки
    function getDeliveryTimeText(order) {
        if (order.delivery_type === 'now') {
            return 'Как можно скорее (с 7:00 до 23:00)';
        } else if (order.delivery_type === 'by_time' && order.delivery_time) {
            // Форматируем время
            const [hours, minutes] = order.delivery_time.split(':');
            return `${hours}:${minutes}`;
        }
        return 'Не указано';
    }
    
    // Открытие модального окна просмотра
    function openViewModal(order) {
        currentOrderId = order.id;
        
        // Заполняем данные
        const orderDate = new Date(order.created_at);
        document.getElementById('view-order-date').textContent = 
            orderDate.toLocaleDateString('ru-RU') + ' ' + 
            orderDate.toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'});
        
        document.getElementById('view-order-name').textContent = order.full_name;
        document.getElementById('view-order-address').textContent = order.delivery_address;
        document.getElementById('view-order-type').textContent = 
            order.delivery_type === 'now' ? 'Как можно скорее' : 'К указанному времени';
        document.getElementById('view-order-phone').textContent = order.phone;
        document.getElementById('view-order-email').textContent = order.email;
        document.getElementById('view-order-comment').textContent = order.comment || 'Нет комментария';
        document.getElementById('view-order-total').textContent = calculateOrderTotal(order);
        
        // Отображаем состав заказа
        const dishesContainer = document.getElementById('view-order-dishes');
        dishesContainer.innerHTML = '';
        
        const dishCategories = [
            { id: order.soup_id, label: 'Суп' },
            { id: order.main_course_id, label: 'Главное блюдо' },
            { id: order.salad_id, label: 'Салат/стартер' },
            { id: order.drink_id, label: 'Напиток' },
            { id: order.dessert_id, label: 'Десерт' }
        ];
        
        dishCategories.forEach(category => {
            if (category.id) {
                const dish = allDishes.find(d => d.id === category.id);
                if (dish) {
                    const dishElement = document.createElement('div');
                    dishElement.className = 'order-dish-item';
                    dishElement.innerHTML = `
                        <strong>${category.label}:</strong>
                        <span>${dish.name} - ${dish.price}Р (${dish.count})</span>
                    `;
                    dishesContainer.appendChild(dishElement);
                }
            }
        });
        
        // Показываем модальное окно
        viewOrderModal.style.display = 'block';
    }
    
    // Открытие модального окна редактирования
    function openEditModal(order) {
        currentOrderId = order.id;
        
        // Заполняем данные
        const orderDate = new Date(order.created_at);
        document.getElementById('edit-order-date').textContent = 
            orderDate.toLocaleDateString('ru-RU') + ' ' + 
            orderDate.toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'});
        
        document.getElementById('edit-order-id').value = order.id;
        document.getElementById('edit-full-name').value = order.full_name;
        document.getElementById('edit-delivery-address').value = order.delivery_address;
        document.getElementById('edit-phone').value = order.phone;
        document.getElementById('edit-email').value = order.email;
        document.getElementById('edit-comment').value = order.comment || '';
        
        // Устанавливаем тип доставки
        if (order.delivery_type === 'now') {
            document.getElementById('edit-delivery-type-now').checked = true;
            document.getElementById('edit-specific-time-group').style.display = 'none';
        } else {
            document.getElementById('edit-delivery-type-by-time').checked = true;
            document.getElementById('edit-specific-time-group').style.display = 'block';
            if (order.delivery_time) {
                document.getElementById('edit-delivery-time').value = order.delivery_time;
            }
        }
        
        document.getElementById('edit-order-total').textContent = calculateOrderTotal(order);
        
        // Отображаем состав заказа (только для просмотра)
        const dishesContainer = document.getElementById('edit-order-dishes');
        dishesContainer.innerHTML = '';
        
        const dishCategories = [
            { id: order.soup_id, label: 'Суп' },
            { id: order.main_course_id, label: 'Главное блюдо' },
            { id: order.salad_id, label: 'Салат/стартер' },
            { id: order.drink_id, label: 'Напиток' },
            { id: order.dessert_id, label: 'Десерт' }
        ];
        
        dishCategories.forEach(category => {
            if (category.id) {
                const dish = allDishes.find(d => d.id === category.id);
                if (dish) {
                    const dishElement = document.createElement('div');
                    dishElement.className = 'order-dish-item';
                    dishElement.innerHTML = `
                        <strong>${category.label}:</strong>
                        <span>${dish.name} - ${dish.price}Р</span>
                    `;
                    dishesContainer.appendChild(dishElement);
                }
            }
        });
        
        // Показываем модальное окно
        editOrderModal.style.display = 'block';
    }
    
    // Открытие модального окна удаления
    function openDeleteModal(order, index) {
        currentOrderId = order.id;
        document.getElementById('delete-order-number').textContent = `#${index}`;
        deleteOrderModal.style.display = 'block';
    }
    
    // Инициализация модальных окон
    function initializeModals() {
        // Закрытие по клику на крестик
        document.querySelectorAll('.modal-close').forEach(closeBtn => {
            closeBtn.addEventListener('click', function() {
                this.closest('.modal').style.display = 'none';
            });
        });
        
        // Закрытие по клику вне модального окна
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', function(e) {
                if (e.target === this) {
                    this.style.display = 'none';
                }
            });
        });
        
        // Обработчики для кнопок модальных окон
        document.getElementById('view-modal-ok').addEventListener('click', () => {
            viewOrderModal.style.display = 'none';
        });
        
        document.getElementById('edit-modal-cancel').addEventListener('click', () => {
            editOrderModal.style.display = 'none';
        });
        
        document.getElementById('delete-modal-cancel').addEventListener('click', () => {
            deleteOrderModal.style.display = 'none';
        });
        
        // Сохранение изменений
        document.getElementById('edit-modal-save').addEventListener('click', saveOrderChanges);
        
        // Удаление заказа
        document.getElementById('delete-modal-confirm').addEventListener('click', deleteOrder);
        
        // Обработка изменения типа доставки
        document.getElementById('edit-delivery-type-now').addEventListener('change', function() {
            document.getElementById('edit-specific-time-group').style.display = 'none';
        });
        
        document.getElementById('edit-delivery-type-by-time').addEventListener('change', function() {
            document.getElementById('edit-specific-time-group').style.display = 'block';
        });
    }
    
    // Сохранение изменений заказа
    async function saveOrderChanges() {
        try {
            const orderData = {
                full_name: document.getElementById('edit-full-name').value,
                delivery_address: document.getElementById('edit-delivery-address').value,
                phone: document.getElementById('edit-phone').value,
                email: document.getElementById('edit-email').value,
                comment: document.getElementById('edit-comment').value,
                delivery_type: document.querySelector('input[name="edit-delivery-type"]:checked').value
            };
            
            // Добавляем время доставки если нужно
            if (orderData.delivery_type === 'by_time') {
                const deliveryTime = document.getElementById('edit-delivery-time').value;
                if (deliveryTime) {
                    orderData.delivery_time = deliveryTime;
                }
            }
            
            // Валидация
            if (!validateOrderData(orderData)) {
                return;
            }
            
            // Отправка запроса на обновление
            const response = await fetch(
                `${API_URL}/labs/api/orders/${currentOrderId}?api_key=${API_KEY}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(orderData)
                }
            );
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }
            
            // Обновляем данные на странице
            await loadOrders();
            
            // Закрываем модальное окно
            editOrderModal.style.display = 'none';
            
            // Показываем уведомление об успехе
            showNotification('Заказ успешно изменён!', true);
            
        } catch (error) {
            console.error('Ошибка при сохранении заказа:', error);
            showError(`Ошибка при сохранении: ${error.message}`);
        }
    }
    
    // Удаление заказа
    async function deleteOrder() {
        try {
            const response = await fetch(
                `${API_URL}/labs/api/orders/${currentOrderId}?api_key=${API_KEY}`,
                {
                    method: 'DELETE'
                }
            );
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }
            
            // Обновляем список заказов
            await loadOrders();
            
            // Закрываем модальное окно
            deleteOrderModal.style.display = 'none';
            
            // Показываем уведомление об успехе
            showNotification('Заказ успешно удалён!', true);
            
        } catch (error) {
            console.error('Ошибка при удалении заказа:', error);
            showError(`Ошибка при удалении: ${error.message}`);
        }
    }
    
    // Валидация данных заказа
    function validateOrderData(data) {
        if (!data.full_name.trim()) {
            showError('Пожалуйста, введите имя получателя.');
            return false;
        }
        
        if (!data.delivery_address.trim()) {
            showError('Пожалуйста, введите адрес доставки.');
            return false;
        }
        
        if (!data.phone.trim()) {
            showError('Пожалуйста, введите номер телефона.');
            return false;
        }
        
        if (!data.email.trim()) {
            showError('Пожалуйста, введите email.');
            return false;
        }
        
        // Валидация времени доставки
        if (data.delivery_type === 'by_time' && data.delivery_time) {
            const [hours, minutes] = data.delivery_time.split(':').map(Number);
            
            if (hours < 7 || hours > 23 || (hours === 23 && minutes > 0)) {
                showError('Доставка возможна только с 7:00 до 23:00.');
                return false;
            }
        }
        
        return true;
    }
    
    // Функция для показа уведомлений
    function showNotification(message, isSuccess = false) {
        const title = document.getElementById('notification-title');
        const messageElement = document.getElementById('notification-message');
        const okButton = document.getElementById('notification-ok');
        
        title.textContent = isSuccess ? 'Успех!' : 'Ошибка';
        messageElement.textContent = message;
        
        notificationOverlay.style.display = 'block';
        notification.style.display = 'block';
        
        okButton.onclick = function() {
            notificationOverlay.style.display = 'none';
            notification.style.display = 'none';
        };
    }
    
    // Функция для показа ошибок
    function showError(message) {
        showNotification(message, false);
    }
    
    // Запуск приложения
    initializeApp();
});