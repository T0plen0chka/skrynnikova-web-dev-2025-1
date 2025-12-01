﻿// Этот файл теперь будет использоваться только для хранения данных, загруженных с API
// Изначально пустой массив, который будет заполнен данными с сервера
let dishes = [];

// Функция для загрузки блюд с API
async function loadDishes() {
    try {
        const response = await fetch('https://edu.std-900.ist.mospolytech.ru/labs/api/dishes');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const apiDishes = await response.json();
        
        // Преобразуем данные API в нужный формат
        dishes = apiDishes.map(item => {
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
            
            // Сопоставляем категории для напитков
            let kind = item.kind;
            if (category === 'drink') {
                if (item.kind === 'hot') kind = 'hot';
                else if (item.kind === 'cold') kind = 'cold';
            }
            
            return {
                keyword: item.keyword,
                name: item.name,
                price: item.price,
                category: category,
                count: item.count,
                image: item.image,
                kind: kind
            };
        });
        
        return dishes;
    } catch (error) {
        console.error('Ошибка при загрузке блюд с API:', error);
        
        // Возвращаем пустой массив в случае ошибки
        return [];
    }
}