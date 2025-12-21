﻿// script.js
document.addEventListener('DOMContentLoaded', function() {
    // Объект для хранения выбранных блюд
    const selectedDishes = {
        soup: null,
        main: null,
        starter: null,
        drink: null,
        dessert: null
    };

    // Объект для хранения активных фильтров
    const activeFilters = {
        soup: null,
        main: null,
        starter: null,
        drink: null,
        dessert: null
    };

    // Допустимые комбинации блюд для ланча
    const validCombinations = [
        { soup: true, main: true, starter: true, drink: true },
        { soup: true, main: true, drink: true },
        { soup: true, starter: true, drink: true },
        { main: true, starter: true, drink: true },
        { main: true, drink: true }
    ];

    // DOM элементы
    const orderPanel = document.getElementById('order-panel');
    const currentTotalElement = document.getElementById('current-total');
    const goToOrderBtn = document.getElementById('go-to-order-btn');

    // Функция для сохранения выбранных блюд в localStorage
    function saveOrderToLocalStorage() {
        const orderData = {};
        Object.keys(selectedDishes).forEach(key => {
            if (selectedDishes[key]) {
                orderData[key] = selectedDishes[key].keyword;
            }
        });
        console.log('Сохраняем в localStorage:', orderData);
        localStorage.setItem('currentOrder', JSON.stringify(orderData));
    }

    // Функция для загрузки выбранных блюд из localStorage
    function loadOrderFromLocalStorage() {
        const savedOrder = localStorage.getItem('currentOrder');
        if (savedOrder) {
            try {
                const orderData = JSON.parse(savedOrder);
                Object.keys(orderData).forEach(key => {
                    if (orderData[key]) {
                        const dish = dishes.find(d => d.keyword === orderData[key] && d.category === key);
                        if (dish) {
                            selectedDishes[key] = dish;
                        }
                    }
                });
            } catch (e) {
                console.error('Ошибка при загрузке заказа из localStorage:', e);
            }
        }
    }

    // Функция для проверки валидности заказа
    function validateOrder() {
        const currentSelection = {
            soup: selectedDishes.soup !== null,
            main: selectedDishes.main !== null,
            starter: selectedDishes.starter !== null,
            drink: selectedDishes.drink !== null
        };

        const isValid = validCombinations.some(combo => {
            return Object.keys(combo).every(key => combo[key] === currentSelection[key]);
        });

        return { isValid, currentSelection };
    }

    // Функция для обновления панели заказа
    function updateOrderPanel() {
        const totalPrice = calculateTotalPrice();
        const hasAnyDish = totalPrice > 0;
        const validation = validateOrder();

        // Показываем/скрываем панель
        if (hasAnyDish) {
            orderPanel.style.display = 'block';
            currentTotalElement.textContent = totalPrice;
            
            // Проверяем возможность оформления заказа
            if (validation.isValid) {
                goToOrderBtn.classList.remove('disabled');
                goToOrderBtn.style.pointerEvents = 'auto';
                goToOrderBtn.style.opacity = '1';
            } else {
                goToOrderBtn.classList.add('disabled');
                goToOrderBtn.style.pointerEvents = 'none';
                goToOrderBtn.style.opacity = '0.6';
            }
        } else {
            orderPanel.style.display = 'none';
        }
    }

    // Функция для сортировки блюд по алфавиту
    function sortDishesAlphabetically(dishesArray) {
        return dishesArray.sort((a, b) => a.name.localeCompare(b.name));
    }

    // Функция для получения DOM-элемента сетки по категории блюда
    function getCategoryGrid(category) {
        switch(category) {
            case 'soup': return document.getElementById('soup-grid');
            case 'main': return document.getElementById('main-grid');
            case 'starter': return document.getElementById('starter-grid');
            case 'drink': return document.getElementById('drink-grid');
            case 'dessert': return document.getElementById('dessert-grid');
            default: return null;
        }
    }

    // Функция для получения блока фильтров по категории
    function getCategoryFilters(category) {
        const sections = document.querySelectorAll('main > .container > section');
        for (let section of sections) {
            const h2 = section.querySelector('h2');
            if (h2) {
                const categoryMap = {
                    'Выберите суп': 'soup',
                    'Выберите главное блюдо': 'main',
                    'Выберите салат или стартер': 'starter',
                    'Выберите напиток': 'drink',
                    'Выберите десерт': 'dessert'
                };
                if (categoryMap[h2.textContent] === category) {
                    return section.querySelector('.filters');
                }
            }
        }
        return null;
    }

    // Функция для отображения блюд на странице
    function displayDishes() {
        // Очищаем все сетки блюд перед обновлением
        document.querySelectorAll('.dishes-grid').forEach(grid => {
            grid.innerHTML = '';
        });

        // Сортируем блюда по алфавиту
        const sortedDishes = sortDishesAlphabetically([...dishes]);

        // Создаем карточки блюд для каждой категории
        sortedDishes.forEach(dish => {
            const dishElement = createDishElement(dish);
            const targetGrid = getCategoryGrid(dish.category);
            if (targetGrid) {
                targetGrid.appendChild(dishElement);
            }
        });

        // Применяем активные фильтры после отображения всех блюд
        applyAllFilters();
        
        // Обновляем выделение выбранных блюд
        updateDishSelection();
    }

    // Функция для создания HTML элемента блюда
    function createDishElement(dish) {
        const dishDiv = document.createElement('div');
        dishDiv.className = 'dish-item';
        dishDiv.setAttribute('data-dish', dish.keyword);
        dishDiv.setAttribute('data-kind', dish.kind);

        dishDiv.innerHTML = `
            <img src="${dish.image}" alt="${dish.name}" onerror="this.src='images/placeholder.jpg'">
            <p class="price">${dish.price}Р</p>
            <p class="name">${dish.name}</p>
            <p class="weight">${dish.count}</p>
            <button class="add-btn">Добавить</button>
        `;

        // Добавляем обработчик клика на кнопку
        const addButton = dishDiv.querySelector('.add-btn');
        addButton.addEventListener('click', function() {
            selectDish(dish);
        });

        return dishDiv;
    }

    // Функция для выбора блюда
    function selectDish(dish) {
        // Если блюдо уже выбрано, снимаем выбор
        if (selectedDishes[dish.category] && selectedDishes[dish.category].keyword === dish.keyword) {
            selectedDishes[dish.category] = null;
        } else {
            selectedDishes[dish.category] = dish;
        }
        
        updateDishSelection();
        saveOrderToLocalStorage();
        updateOrderPanel();
    }

    // Функция для обновления состояния кнопок и выделения
    function updateDishSelection() {
        // Снимаем выделение со всех карточек
        document.querySelectorAll('.dish-item').forEach(item => {
            item.style.border = '';
            const button = item.querySelector('.add-btn');
            button.textContent = 'Добавить';
            button.style.background = '#f1eee9';
            button.style.color = '#000';
        });

        // Выделяем выбранные карточки
        Object.values(selectedDishes).forEach(dish => {
            if (dish) {
                const selectedItem = document.querySelector(`[data-dish="${dish.keyword}"]`);
                if (selectedItem) {
                    selectedItem.style.border = '2px solid tomato';
                    const button = selectedItem.querySelector('.add-btn');
                    button.textContent = 'Выбрано';
                    button.style.background = 'tomato';
                    button.style.color = 'white';
                }
            }
        });
    }

    // Функция для расчета общей стоимости
    function calculateTotalPrice() {
        return Object.values(selectedDishes).reduce((total, dish) => {
            return total + (dish ? dish.price : 0);
        }, 0);
    }

    // Функция для фильтрации блюд в определенной категории
    function filterDishes(category, kind) {
        const grid = getCategoryGrid(category);
        if (!grid) return;
        
        const dishesInCategory = grid.querySelectorAll('.dish-item');
        
        dishesInCategory.forEach(dish => {
            if (kind === null || dish.getAttribute('data-kind') === kind) {
                dish.style.display = 'flex';
            } else {
                dish.style.display = 'none';
            }
        });
    }

    // Функция для применения всех активных фильтров
    function applyAllFilters() {
        Object.keys(activeFilters).forEach(category => {
            filterDishes(category, activeFilters[category]);
        });
    }

    // Функция для сброса фильтра в категории
    function resetCategoryFilter(category) {
        activeFilters[category] = null;
        const filtersContainer = getCategoryFilters(category);
        if (!filtersContainer) return;
        
        const filterButtons = filtersContainer.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => btn.classList.remove('active'));
        filterDishes(category, null);
    }

    // Функция для установки фильтра в категории
    function setCategoryFilter(category, kind, button) {
        const filtersContainer = getCategoryFilters(category);
        if (!filtersContainer) return;
        
        const filterButtons = filtersContainer.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => btn.classList.remove('active'));
        
        if (activeFilters[category] === kind) {
            resetCategoryFilter(category);
        } else {
            activeFilters[category] = kind;
            button.classList.add('active');
            filterDishes(category, kind);
        }
    }

    // Функция для показа уведомления
    function showNotification(message) {
        const overlay = document.createElement('div');
        overlay.className = 'notification-overlay';
        
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <h3>Внимание</h3>
            <p>${message}</p>
            <button class="notification-btn">Окей</button>
        `;
        
        document.body.appendChild(overlay);
        document.body.appendChild(notification);
        
        const button = notification.querySelector('.notification-btn');
        button.addEventListener('click', function() {
            document.body.removeChild(overlay);
            document.body.removeChild(notification);
        });
    }

    // Инициализация фильтров
    function initializeFilters() {
        document.querySelectorAll('.filters').forEach(filtersContainer => {
            const filterButtons = filtersContainer.querySelectorAll('.filter-btn');
            
            filterButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const kind = this.getAttribute('data-kind');
                    const category = this.getAttribute('data-category');
                    
                    setCategoryFilter(category, kind, this);
                });
            });
        });
    }

    // Обработчик сброса
    function setupResetButton() {
        const resetBtn = document.querySelector('.reset-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', function() {
                Object.keys(selectedDishes).forEach(key => {
                    selectedDishes[key] = null;
                });
                
                Object.keys(activeFilters).forEach(key => {
                    activeFilters[key] = null;
                });
                
                document.querySelectorAll('.filter-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                
                updateDishSelection();
                saveOrderToLocalStorage();
                updateOrderPanel();
                applyAllFilters();
            });
        }
    }

    // Функция для инициализации приложения
    async function initializeApp() {
        try {
            // Загружаем блюда с API
            await loadDishes();
            
            // Загружаем сохраненный заказ из localStorage
            loadOrderFromLocalStorage();
            
            // Инициализируем приложение
            displayDishes();
            initializeFilters();
            setupResetButton();
            updateOrderPanel();
            
        } catch (error) {
            console.error('Ошибка при инициализации приложения:', error);
            
            // Показываем сообщение об ошибке
            const errorMessage = document.createElement('div');
            errorMessage.style.textAlign = 'center';
            errorMessage.style.padding = '20px';
            errorMessage.style.color = 'red';
            errorMessage.innerHTML = `
                <h3>Ошибка загрузки меню</h3>
                <p>Не удалось загрузить данные с сервера. Пожалуйста, обновите страницу.</p>
                <button onclick="location.reload()">Обновить страницу</button>
            `;
            
            // Заменяем основное содержимое сообщением об ошибке
            const main = document.querySelector('main');
            main.innerHTML = '';
            main.appendChild(errorMessage);
        }
    }

    // Запускаем инициализацию приложения
    initializeApp();
});