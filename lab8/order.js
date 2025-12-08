﻿// order.js
document.addEventListener('DOMContentLoaded', function() {
    // Элементы DOM
    const orderItemsContainer = document.getElementById('order-items-container');
    const formOrderSummary = document.getElementById('form-order-summary');
    const totalPriceSection = document.getElementById('total-price-section');
    const totalPriceAmount = document.getElementById('total-price-amount');
    const orderForm = document.getElementById('order-form');
    const resetBtn = document.getElementById('reset-btn');
    const deliveryTypeNow = document.getElementById('delivery_type_now');
    const deliveryTypeByTime = document.getElementById('delivery_type_by_time');
    const specificTimeGroup = document.getElementById('specific-time-group');
    const deliveryTimeInput = document.getElementById('delivery_time');
    
    // API URL и ключ
    const API_URL = 'https://edu.std-900.ist.mospolytech.ru';
    // Получите ваш API ключ с сайта и вставьте здесь
    const API_KEY = '0619ea01-3d30-4d86-b384-f68d2e7f9029'; // ЗАМЕНИТЕ НА ВАШ КЛЮЧ
    
    // Объект для хранения загруженных блюд
    let allDishes = [];
    
    // Функция для загрузки блюд с сервера
    async function loadDishes() {
        try {
            const response = await fetch(`${API_URL}/labs/api/dishes?api_key=${API_KEY}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const apiDishes = await response.json();
            
            // Преобразуем данные API в нужный формат
            return apiDishes.map(item => {
                // Сопоставляем категории API с нашими категориями
                let category;
                switch(item.category) {
                    case 'soup':
                        category = 'soup';
                        break;
                    case 'main-course':
                        category = 'main';
                        break;
                    case 'salad':
                        category = 'starter';
                        break;
                    case 'drink':
                        category = 'drink';
                        break;
                    case 'dessert':
                        category = 'dessert';
                        break;
                    default:
                        category = item.category;
                }
                
                return {
                    id: item.id,
                    keyword: item.keyword,
                    name: item.name,
                    price: item.price,
                    category: category,
                    count: item.count,
                    image: item.image,
                    kind: item.kind
                };
            });
            
        } catch (error) {
            console.error('Ошибка при загрузке блюд:', error);
            showNotification('Ошибка при загрузке меню. Пожалуйста, обновите страницу.');
            return [];
        }
    }
    
    // Функция для получения выбранных блюд из localStorage
    function getSelectedDishesFromStorage() {
        const savedOrder = localStorage.getItem('currentOrder');
        if (savedOrder) {
            try {
                const orderData = JSON.parse(savedOrder);
                console.log('Загружен заказ из localStorage:', orderData);
                return orderData;
            } catch (e) {
                console.error('Ошибка при парсинге заказа:', e);
                return {};
            }
        }
        console.log('В localStorage нет сохраненного заказа');
        return {};
    }
    
    // Функция для загрузки и отображения выбранных блюд
    async function loadAndDisplaySelectedDishes() {
        const selectedKeywords = getSelectedDishesFromStorage();
        console.log('Ключевые слова выбранных блюд:', selectedKeywords);
        
        // Получаем полные данные о выбранных блюдах
        const selectedDishes = {};
        const selectedEntries = Object.entries(selectedKeywords);
        
        console.log('Все загруженные блюда:', allDishes);
        
        // Находим каждое блюдо по ключевому слову
        selectedEntries.forEach(([category, keyword]) => {
            console.log(`Ищем блюдо: категория=${category}, keyword=${keyword}`);
            
            // Ищем блюдо по ключевому слову и категории
            const dish = allDishes.find(d => {
                // Приводим категории к одному формату
                const dishCategory = d.category.toLowerCase();
                const searchCategory = category.toLowerCase();
                
                console.log(`Сравниваем: ${d.keyword} (${dishCategory}) с ${keyword} (${searchCategory})`);
                return d.keyword === keyword && dishCategory === searchCategory;
            });
            
            if (dish) {
                console.log(`Найдено блюдо: ${dish.name}`);
                selectedDishes[category] = dish;
            } else {
                console.log(`Блюдо не найдено: ${keyword} (${category})`);
            }
        });
        
        console.log('Найденные блюда для отображения:', selectedDishes);
        
        // Отображаем блюда в разделе "Состав заказа" (в виде карточек с картинками)
        displayOrderItemsAsCards(selectedDishes);
        
        // Отображаем блюда в форме (сводка)
        displayFormOrderSummary(selectedDishes);
        
        // Обновляем итоговую стоимость
        updateTotalPrice(selectedDishes);
    }
    
    // Функция для отображения блюд в разделе "Состав заказа" в виде карточек
    function displayOrderItemsAsCards(selectedDishes) {
        const selectedEntries = Object.entries(selectedDishes);
        
        if (selectedEntries.length === 0) {
            orderItemsContainer.innerHTML = `
                <div class="empty-order-message">
                    <p>Ничего не выбрано. Чтобы добавить блюда в заказ, перейдите на страницу <a href="index.html">Собрать ланч</a>.</p>
                </div>
            `;
            return;
        }
        
        // Создаем сетку для карточек
        let orderHTML = '<div class="order-dishes-grid">';
        
        selectedEntries.forEach(([category, dish]) => {
            orderHTML += `
                <div class="order-dish-card" data-category="${category}" data-keyword="${dish.keyword}">
                    <img src="${dish.image}" alt="${dish.name}" class="order-dish-image" onerror="this.src='images/placeholder.jpg'">
                    <div class="order-dish-content">
                        <div class="order-dish-price">${dish.price}Р</div>
                        <div class="order-dish-name">${dish.name}</div>
                        <div class="order-dish-weight">${dish.count}</div>
                        <div class="order-dish-actions">
                            <button class="remove-order-btn" onclick="removeDish('${category}', '${dish.keyword}')">Удалить</button>
                        </div>
                    </div>
                </div>
            `;
        });
        
        orderHTML += '</div>';
        orderItemsContainer.innerHTML = orderHTML;
    }
    
    // Функция для отображения сводки заказа в форме
    function displayFormOrderSummary(selectedDishes) {
        const categories = [
            { key: 'soup', label: 'Суп', emptyText: 'Не выбран' },
            { key: 'main', label: 'Главное блюдо', emptyText: 'Не выбрано' },
            { key: 'starter', label: 'Салат/стартер', emptyText: 'Не выбран' },
            { key: 'drink', label: 'Напиток', emptyText: 'Не выбран' },
            { key: 'dessert', label: 'Десерт', emptyText: 'Не выбран' }
        ];
        
        let summaryHTML = '';
        
        categories.forEach(cat => {
            const dish = selectedDishes[cat.key];
            summaryHTML += `
                <div class="order-category">
                    <strong>${cat.label}</strong>
                    <span class="selected-dish">${dish ? `${dish.name} ${dish.price}Р` : cat.emptyText}</span>
                </div>
            `;
        });
        
        formOrderSummary.innerHTML = summaryHTML;
    }
    
    // Функция для обновления итоговой стоимости
    function updateTotalPrice(selectedDishes) {
        const total = Object.values(selectedDishes).reduce((sum, dish) => sum + (dish ? dish.price : 0), 0);
        
        if (total > 0) {
            totalPriceAmount.textContent = total;
            totalPriceSection.style.display = 'block';
        } else {
            totalPriceSection.style.display = 'none';
        }
    }
    
    // Функция для удаления блюда из заказа
    window.removeDish = function(category, keyword) {
        const selectedKeywords = getSelectedDishesFromStorage();
        delete selectedKeywords[category];
        
        // Сохраняем обновленный заказ в localStorage
        localStorage.setItem('currentOrder', JSON.stringify(selectedKeywords));
        
        // Обновляем отображение
        loadAndDisplaySelectedDishes();
    };
    
    // Функция для проверки валидности комбо
    function validateCombo(selectedDishes) {
        const hasSoup = selectedDishes.soup !== undefined;
        const hasMain = selectedDishes.main !== undefined;
        const hasStarter = selectedDishes.starter !== undefined;
        const hasDrink = selectedDishes.drink !== undefined;
        
        const validCombinations = [
            { soup: true, main: true, starter: true, drink: true },
            { soup: true, main: true, drink: true },
            { soup: true, starter: true, drink: true },
            { main: true, starter: true, drink: true },
            { main: true, drink: true }
        ];
        
        return validCombinations.some(combo => {
            return combo.soup === hasSoup &&
                   combo.main === hasMain &&
                   combo.starter === hasStarter &&
                   combo.drink === hasDrink;
        });
    }
    
    // Функция для отправки заказа на сервер
    async function submitOrder(formData) {
        try {
            const selectedKeywords = getSelectedDishesFromStorage();
            const selectedDishes = {};
            
            // Получаем ID блюд
            for (const [category, keyword] of Object.entries(selectedKeywords)) {
                const dish = allDishes.find(d => d.keyword === keyword);
                if (dish) {
                    selectedDishes[category] = dish;
                }
            }
            
            console.log('Проверяем комбо для блюд:', selectedDishes);
            
            // Проверяем валидность комбо
            if (!validateCombo(selectedDishes)) {
                showNotification('Выбранные блюда не соответствуют ни одному из доступных комбо. Пожалуйста, выберите блюда согласно одному из вариантов ланча.');
                return false;
            }
            
            // Подготавливаем данные для отправки
            const orderData = {
                full_name: formData.full_name,
                email: formData.email,
                subscribe: formData.subscribe === '1' ? 1 : 0,
                phone: formData.phone,
                delivery_address: formData.delivery_address,
                delivery_type: formData.delivery_type,
                comment: formData.comment || ''
            };
            
            // Добавляем ID блюд в правильном формате для API
            if (selectedDishes.soup) {
                orderData.soup_id = selectedDishes.soup.id;
            }
            if (selectedDishes.main) {
                orderData.main_course_id = selectedDishes.main.id;
            }
            if (selectedDishes.starter) {
                orderData.salad_id = selectedDishes.starter.id;
            }
            if (selectedDishes.drink) {
                orderData.drink_id = selectedDishes.drink.id;
            }
            if (selectedDishes.dessert) {
                orderData.dessert_id = selectedDishes.dessert.id;
            }
            
            // Добавляем время доставки если нужно
            if (formData.delivery_type === 'by_time' && formData.delivery_time) {
                orderData.delivery_time = formData.delivery_time;
            }
            
            console.log('Отправляем данные заказа:', orderData);
            
            // Отправляем запрос на сервер
            const response = await fetch(`${API_URL}/labs/api/orders?api_key=${API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('Заказ успешно создан:', result);
            
            // Очищаем localStorage после успешного оформления
            localStorage.removeItem('currentOrder');
            
            showNotification('Заказ успешно оформлен! Спасибо за ваш заказ.', true);
            return true;
            
        } catch (error) {
            console.error('Ошибка при оформлении заказа:', error);
            showNotification(`Ошибка при оформлении заказа: ${error.message}`);
            return false;
        }
    }
    
    // Функция для показа уведомлений
    function showNotification(message, isSuccess = false) {
        const overlay = document.getElementById('notification-overlay');
        const notification = document.getElementById('notification');
        const title = document.getElementById('notification-title');
        const messageElement = document.getElementById('notification-message');
        const okButton = document.getElementById('notification-ok');
        
        title.textContent = isSuccess ? 'Успех!' : 'Ошибка';
        messageElement.textContent = message;
        
        overlay.style.display = 'block';
        notification.style.display = 'block';
        
        okButton.onclick = function() {
            overlay.style.display = 'none';
            notification.style.display = 'none';
            
            if (isSuccess) {
                // Перенаправляем на главную страницу после успешного оформления
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 500);
            }
        };
    }
    
    // Функция для валидации формы
    function validateForm(formData) {
        // Проверка обязательных полей
        if (!formData.full_name.trim()) {
            showNotification('Пожалуйста, введите ваше имя.');
            return false;
        }
        
        if (!formData.email.trim()) {
            showNotification('Пожалуйста, введите ваш email.');
            return false;
        }
        
        if (!formData.phone.trim()) {
            showNotification('Пожалуйста, введите ваш номер телефона.');
            return false;
        }
        
        if (!formData.delivery_address.trim()) {
            showNotification('Пожалуйста, введите адрес доставки.');
            return false;
        }
        
        // Проверка времени доставки
        if (formData.delivery_type === 'by_time') {
            if (!formData.delivery_time) {
                showNotification('Пожалуйста, укажите время доставки.');
                return false;
            }
            
            // Проверка что время в допустимом диапазоне
            const deliveryTime = formData.delivery_time;
            const [hours, minutes] = deliveryTime.split(':').map(Number);
            
            if (hours < 7 || hours > 23 || (hours === 23 && minutes > 0)) {
                showNotification('Доставка возможна только с 7:00 до 23:00.');
                return false;
            }
        }
        
        return true;
    }
    
    // Обработчик изменения типа доставки
    if (deliveryTypeNow && deliveryTypeByTime) {
        deliveryTypeNow.addEventListener('change', function() {
            specificTimeGroup.style.display = 'none';
            deliveryTimeInput.required = false;
        });
        
        deliveryTypeByTime.addEventListener('change', function() {
            specificTimeGroup.style.display = 'block';
            deliveryTimeInput.required = true;
        });
    }
    
    // Обработчик сброса формы
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            // Очищаем localStorage и обновляем страницу
            localStorage.removeItem('currentOrder');
            location.reload();
        });
    }
    
    // Обработчик отправки формы
    if (orderForm) {
        orderForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            
            // Собираем данные формы
            const formData = {
                full_name: document.getElementById('full_name').value,
                email: document.getElementById('email').value,
                subscribe: document.getElementById('subscribe').checked ? '1' : '0',
                phone: document.getElementById('phone').value,
                delivery_address: document.getElementById('delivery_address').value,
                delivery_type: document.querySelector('input[name="delivery_type"]:checked').value,
                comment: document.getElementById('comment').value,
                delivery_time: document.getElementById('delivery_time').value
            };
            
            // Валидация формы
            if (!validateForm(formData)) {
                return;
            }
            
            // Проверяем что есть выбранные блюда
            const selectedKeywords = getSelectedDishesFromStorage();
            if (Object.keys(selectedKeywords).length === 0) {
                showNotification('Пожалуйста, выберите блюда для заказа.');
                return;
            }
            
            // Отправляем заказ
            const success = await submitOrder(formData);
            
            if (success) {
                // Форма будет сброшена после успешной отправки
                orderForm.reset();
            }
        });
    }
    
    // Инициализация приложения
    async function initializeApp() {
        try {
            console.log('Начинаем загрузку данных...');
            // Загружаем блюда
            allDishes = await loadDishes();
            console.log('Загружено блюд:', allDishes.length);
            
            // Загружаем и отображаем выбранные блюда
            await loadAndDisplaySelectedDishes();
            
        } catch (error) {
            console.error('Ошибка при инициализации:', error);
            showNotification('Произошла ошибка при загрузке данных. Пожалуйста, обновите страницу.');
        }
    }
    
    // Запускаем инициализацию
    initializeApp();
});