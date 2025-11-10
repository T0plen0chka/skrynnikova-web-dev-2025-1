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

    // Функция для сортировки блюд по алфавиту
    function sortDishesAlphabetically(dishesArray) {
        return dishesArray.sort((a, b) => a.name.localeCompare(b.name));
    }

    // Функция для отображения блюд на странице
    function displayDishes() {
        const categories = {
            soup: document.querySelector('section:nth-child(1) .dishes-grid'),
            main: document.querySelector('section:nth-child(2) .dishes-grid'),
            starter: document.querySelector('section:nth-child(3) .dishes-grid'),
            drink: document.querySelector('section:nth-child(4) .dishes-grid'),
            dessert: document.querySelector('section:nth-child(5) .dishes-grid')
        };

        // Очищаем контейнеры
        Object.values(categories).forEach(container => {
            container.innerHTML = '';
        });

        // Сортируем блюда по алфавиту
        const sortedDishes = sortDishesAlphabetically([...dishes]);

        // Создаем карточки блюд
        sortedDishes.forEach(dish => {
            const dishElement = createDishElement(dish);
            categories[dish.category].appendChild(dishElement);
        });

        // Применяем активные фильтры
        Object.keys(activeFilters).forEach(category => {
            if (activeFilters[category]) {
                applyFilter(category, activeFilters[category]);
            }
        });
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
            updateDishSelection();
        });

        return dishDiv;
    }

    // Функция для выбора блюда
    function selectDish(dish) {
        selectedDishes[dish.category] = dish;
        updateButtonStates();
    }

    // Функция для обновления состояния кнопок
    function updateButtonStates() {
        document.querySelectorAll('.dish-item').forEach(item => {
            const dishKeyword = item.getAttribute('data-dish');
            const dish = dishes.find(d => d.keyword === dishKeyword);
            const button = item.querySelector('.add-btn');
            
            if (dish && selectedDishes[dish.category]?.keyword === dishKeyword) {
                item.style.border = '2px solid tomato';
                button.textContent = 'Выбрано';
                button.style.background = 'tomato';
                button.style.color = 'white';
            } else {
                item.style.border = '';
                button.textContent = 'Добавить';
                button.style.background = '#f1eee9';
                button.style.color = '#000';
            }
        });
    }

    // Функция для обновления раздела "Ваш заказ"
    function updateDishSelection() {
        const orderDetails = document.querySelector('.order-details');
        let orderHTML = '<h3>Ваш заказ</h3>';

        const hasSelectedDishes = Object.values(selectedDishes).some(dish => dish !== null);

        if (!hasSelectedDishes) {
            orderHTML += '<p class="no-selection">Ничего не выбрано</p>';
        } else {
            const categories = {
                soup: { title: 'Суп', notSelected: 'Блюдо не выбрано' },
                main: { title: 'Главное блюдо', notSelected: 'Блюдо не выбрано' },
                starter: { title: 'Салат или стартер', notSelected: 'Блюдо не выбрано' },
                drink: { title: 'Напиток', notSelected: 'Напиток не выбран' },
                dessert: { title: 'Десерт', notSelected: 'Десерт не выбран' }
            };

            Object.keys(categories).forEach(category => {
                const dish = selectedDishes[category];
                orderHTML += `
                    <div class="form-group">
                        <label>${categories[category].title}</label>
                        <p class="selected-dish">${dish ? `${dish.name} ${dish.price}Р` : categories[category].notSelected}</p>
                        ${dish ? `<input type="hidden" name="${category}" value="${dish.keyword}">` : ''}
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
        }

        orderDetails.innerHTML = orderHTML;
    }

    // Функция для расчета общей стоимости
    function calculateTotalPrice() {
        return Object.values(selectedDishes).reduce((total, dish) => {
            return total + (dish ? dish.price : 0);
        }, 0);
    }

    // Функция для применения фильтра
    function applyFilter(category, kind) {
        const dishesGrid = document.querySelector(`section:nth-child(${getSectionIndex(category)}) .dishes-grid`);
        const dishItems = dishesGrid.querySelectorAll('.dish-item');
        
        dishItems.forEach(item => {
            if (kind === null || item.getAttribute('data-kind') === kind) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }

    // Функция для получения индекса секции по категории
    function getSectionIndex(category) {
        const categoryOrder = ['soup', 'main', 'starter', 'drink', 'dessert'];
        return categoryOrder.indexOf(category) + 1;
    }

    // Функция для обработки кликов по фильтрам
    function setupFilterButtons() {
        document.querySelectorAll('.filter-btn').forEach(button => {
            button.addEventListener('click', function() {
                const category = this.getAttribute('data-category');
                const kind = this.getAttribute('data-kind');
                
                // Если кликнули по уже активному фильтру - снимаем фильтр
                if (activeFilters[category] === kind) {
                    activeFilters[category] = null;
                    this.classList.remove('active');
                } else {
                    // Снимаем активный класс со всех кнопок этой категории
                    document.querySelectorAll(`.filter-btn[data-category="${category}"]`).forEach(btn => {
                        btn.classList.remove('active');
                    });
                    
                    // Устанавливаем новый активный фильтр
                    activeFilters[category] = kind;
                    this.classList.add('active');
                }
                
                // Применяем фильтр
                applyFilter(category, activeFilters[category]);
            });
        });
    }

    // Инициализация
    displayDishes();
    updateDishSelection();
    setupFilterButtons();
});