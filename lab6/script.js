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

    // Допустимые комбинации блюд для ланча (как в примере)
    const validCombinations = [
        { soup: true, main: true, starter: true, drink: true },
        { soup: true, main: true, drink: true },
        { soup: true, starter: true, drink: true },
        { main: true, starter: true, drink: true },
        { main: true, drink: true }
    ];

    // Функция для сортировки блюд по алфавиту
    function sortDishesAlphabetically(dishesArray) {
        return dishesArray.sort((a, b) => a.name.localeCompare(b.name));
    }

    // Функция для получения DOM-элемента сетки по категории блюда
    function getCategoryGrid(category) {
        const sections = document.querySelectorAll('main section');
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
                    return section.querySelector('.dishes-grid');
                }
            }
        }
        return null;
    }

    // Функция для получения блока фильтров по категории
    function getCategoryFilters(category) {
        const sections = document.querySelectorAll('main section');
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
        selectedDishes[dish.category] = dish;
        updateDishSelection();
        updateOrderForm();
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

    // Функция для обновления раздела "Ваш заказ"
    function updateOrderForm() {
        const orderContainer = document.querySelector('.order-details');
        
        // Проверяем, есть ли хотя бы одно выбранное блюдо
        const hasSelectedDishes = Object.values(selectedDishes).some(dish => dish !== null);

        if (!hasSelectedDishes) {
            orderContainer.innerHTML = '<h3>Ваш заказ</h3><p class="no-selection">Ничего не выбрано</p>';
        } else {
            let orderHTML = '<h3>Ваш заказ</h3>';
            
            const categories = [
                { key: 'soup', label: 'Суп', emptyText: 'Блюдо не выбрано' },
                { key: 'main', label: 'Главное блюдо', emptyText: 'Блюдо не выбрано' },
                { key: 'starter', label: 'Салат', emptyText: 'Блюдо не выбрано' },
                { key: 'drink', label: 'Напиток', emptyText: 'Напиток не выбран' },
                { key: 'dessert', label: 'Десерт', emptyText: 'Десерт не выбран' }
            ];

            // Добавляем выбранные блюда
            categories.forEach(cat => {
                const dish = selectedDishes[cat.key];
                orderHTML += `
                    <div class="form-group">
                        <label>${cat.label}</label>
                        <p class="selected-dish">${dish ? `${dish.name} ${dish.price}Р` : cat.emptyText}</p>
                        ${dish ? `<input type="hidden" name="${cat.key}" value="${dish.keyword}">` : ''}
                    </div>
                `;
            });

            // Добавляем стоимость заказа
            const totalPrice = calculateTotalPrice();
            if (totalPrice > 0) {
                orderHTML += `
                    <div class="form-group total-price">
                        <label>Стоимость заказа</label>
                        <p class="total-amount">${totalPrice}Р</p>
                    </div>
                `;
            }

            orderContainer.innerHTML = orderHTML;
        }
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

    // Функция для показа уведомления (как в примере)
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

    // Функция для определения типа ошибки
    function getErrorMessage(currentSelection) {
        const hasSoup = currentSelection.soup;
        const hasMain = currentSelection.main;
        const hasStarter = currentSelection.starter;
        const hasDrink = currentSelection.drink;
        const hasAny = hasSoup || hasMain || hasStarter || hasDrink || selectedDishes.dessert !== null;

        if (!hasAny) {
            return "Ничего не выбрано. Выберите блюда для заказа";
        }
        
        if (!hasDrink && (hasSoup || hasMain || hasStarter)) {
            return "Выберите напиток";
        }
        
        if (hasSoup && !hasMain && !hasStarter) {
            return "Выберите главное блюдо или салат";
        }
        
        if (hasStarter && !hasSoup && !hasMain) {
            return "Выберите суп или главное блюдо";
        }
        
        if (hasDrink && !hasSoup && !hasMain && !hasStarter) {
            return "Выберите главное блюдо или салат";
        }
        
        return "Выбранные блюда не соответствуют ни одному из вариантов ланча";
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

    // Обработчик сброса формы
    document.querySelector('.reset-btn').addEventListener('click', function() {
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
        updateOrderForm();
        applyAllFilters();
    });

    // Обработчик отправки формы заказа
    document.getElementById('order-form').addEventListener('submit', function(event) {
        const validation = validateOrder();
        
        if (!validation.isValid) {
            event.preventDefault();
            const errorMessage = getErrorMessage(validation.currentSelection);
            showNotification(errorMessage);
        } else {
            console.log('Форма отправляется с валидным заказом');
        }
    });

    // Инициализация приложения
    displayDishes();
    updateOrderForm();
    initializeFilters();
});