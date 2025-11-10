document.addEventListener('DOMContentLoaded', function() {
    // Объект для хранения выбранных блюд
    const selectedDishes = {
        soup: null,
        main: null,
        drink: null
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
            drink: document.querySelector('section:nth-child(3) .dishes-grid')
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
    }

    // Функция для создания HTML элемента блюда
    function createDishElement(dish) {
        const dishDiv = document.createElement('div');
        dishDiv.className = 'dish-item';
        dishDiv.setAttribute('data-dish', dish.keyword);

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
                drink: { title: 'Напиток', notSelected: 'Напиток не выбран' }
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

    // Инициализация
    displayDishes();
    updateDishSelection();
})