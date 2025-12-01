const dishes = [
    // Супы (6 блюд: 2 рыбных, 2 мясных, 2 вегетарианских)
    {
        keyword: 'gaspacho',
        name: 'Гаспачо',
        price: 195,
        category: 'soup',
        count: '350 г',
        image: 'images/gaspacho.png',
        kind: 'veg'
    },
    {
        keyword: 'mushroom_soup',
        name: 'Грибной суп-пюре',
        price: 185,
        category: 'soup',
        count: '330 г',
        image: 'images/soup_pure.png',
        kind: 'veg'
    },
    {
        keyword: 'norwegian_soup',
        name: 'Норвежский суп',
        price: 270,
        category: 'soup',
        count: '330 г',
        image: 'images/norwegian_soup.png',
        kind: 'fish'
    },
    {
        keyword: 'salmon_soup',
        name: 'Суп с лососем',
        price: 320,
        category: 'soup',
        count: '350 г',
        image: 'images/salmon_soup.png',
        kind: 'fish'
    },
    {
        keyword: 'chicken_soup',
        name: 'Куриный суп',
        price: 180,
        category: 'soup',
        count: '330 г',
        image: 'images/chicken_soup.png',
        kind: 'meat'
    },
    {
        keyword: 'beef_soup',
        name: 'Говяжий суп',
        price: 240,
        category: 'soup',
        count: '350 г',
        image: 'images/beef_soup.png',
        kind: 'meat'
    },

    // Главные блюда (6 блюд: 2 рыбных, 2 мясных, 2 вегетарианских)
    {
        keyword: 'fried_potatoes',
        name: 'Жареная картошка с грибами',
        price: 150,
        category: 'main',
        count: '250 г',
        image: 'images/fried_potatoes_with_mushrooms.png',
        kind: 'veg'
    },
    {
        keyword: 'lasagna',
        name: 'Лазанья',
        price: 385,
        category: 'main',
        count: '310 г',
        image: 'images/lasagna.png',
        kind: 'meat'
    },
    {
        keyword: 'chicken_cutlets',
        name: 'Котлеты из курицы с картофельным пюре',
        price: 225,
        category: 'main',
        count: '280 г',
        image: 'images/chicken_cutlets_with_mashed_potatoes.png',
        kind: 'meat'
    },
    {
        keyword: 'fish_cutlets',
        name: 'Рыбные котлеты с рисом',
        price: 320,
        category: 'main',
        count: '300 г',
        image: 'images/fish_cutlets.png',
        kind: 'fish'
    },
    {
        keyword: 'pasta_shrimp',
        name: 'Паста с креветками',
        price: 340,
        category: 'main',
        count: '280 г',
        image: 'images/pasta_shrimp.png',
        kind: 'fish'
    },
    {
        keyword: 'vegetable_stew',
        name: 'Овощное рагу',
        price: 190,
        category: 'main',
        count: '270 г',
        image: 'images/vegetable_stew.png',
        kind: 'veg'
    },

    // Салаты (6 блюд: 1 рыбный, 1 мясной, 4 вегетарианских)
    {
        keyword: 'caesar_salad',
        name: 'Салат Цезарь',
        price: 280,
        category: 'starter',
        count: '220 г',
        image: 'images/caesar_salad.png',
        kind: 'meat'
    },
    {
        keyword: 'shrimp_salad',
        name: 'Салат с креветками',
        price: 320,
        category: 'starter',
        count: '200 г',
        image: 'images/shrimp_salad.png',
        kind: 'fish'
    },
    {
        keyword: 'greek_salad',
        name: 'Греческий салат',
        price: 240,
        category: 'starter',
        count: '250 г',
        image: 'images/greek_salad.png',
        kind: 'veg'
    },
    {
        keyword: 'vegetable_salad',
        name: 'Овощной салат',
        price: 180,
        category: 'starter',
        count: '230 г',
        image: 'images/vegetable_salad.png',
        kind: 'veg'
    },
    {
        keyword: 'bruschetta',
        name: 'Брускетта',
        price: 160,
        category: 'starter',
        count: '180 г',
        image: 'images/bruschetta.png',
        kind: 'veg'
    },
    {
        keyword: 'caprese',
        name: 'Капрезе',
        price: 290,
        category: 'starter',
        count: '200 г',
        image: 'images/caprese.png',
        kind: 'veg'
    },

    // Напитки (6 блюд: 3 холодных, 3 горячих)
    {
        keyword: 'orange_juice',
        name: 'Апельсиновый сок',
        price: 120,
        category: 'drink',
        count: '300 мл',
        image: 'images/orange_juice.png',
        kind: 'cold'
    },
    {
        keyword: 'apple_juice',
        name: 'Яблочный сок',
        price: 90,
        category: 'drink',
        count: '300 мл',
        image: 'images/apple_juice.png',
        kind: 'cold'
    },
    {
        keyword: 'carrot_juice',
        name: 'Морковный сок',
        price: 110,
        category: 'drink',
        count: '300 мл',
        image: 'images/carrot_juice.png',
        kind: 'cold'
    },
    {
        keyword: 'tea_black',
        name: 'Черный чай',
        price: 80,
        category: 'drink',
        count: '250 мл',
        image: 'images/black_tea.png',
        kind: 'hot'
    },
    {
        keyword: 'tea_green',
        name: 'Зеленый чай',
        price: 80,
        category: 'drink',
        count: '250 мл',
        image: 'images/green_tea.png',
        kind: 'hot'
    },
    {
        keyword: 'coffee',
        name: 'Кофе',
        price: 120,
        category: 'drink',
        count: '200 мл',
        image: 'images/coffee.png',
        kind: 'hot'
    },

    // Десерты (6 блюд: 3 маленьких, 2 средних, 1 большой)
    {
        keyword: 'tiramisu',
        name: 'Тирамису',
        price: 220,
        category: 'dessert',
        count: '120 г',
        image: 'images/tiramisu.png',
        kind: 'small'
    },
    {
        keyword: 'cheesecake',
        name: 'Чизкейк',
        price: 190,
        category: 'dessert',
        count: '110 г',
        image: 'images/cheesecake.png',
        kind: 'small'
    },
    {
        keyword: 'chocolate_cake',
        name: 'Шоколадный торт',
        price: 210,
        category: 'dessert',
        count: '130 г',
        image: 'images/chocolate_cake.png',
        kind: 'small'
    },
    {
        keyword: 'apple_pie',
        name: 'Яблочный пирог',
        price: 180,
        category: 'dessert',
        count: '150 г',
        image: 'images/apple_pie.png',
        kind: 'medium'
    },
    {
        keyword: 'pancakes',
        name: 'Блины с вареньем',
        price: 160,
        category: 'dessert',
        count: '180 г',
        image: 'images/pancakes.png',
        kind: 'medium'
    },
    {
        keyword: 'ice_cream_mix',
        name: 'Мороженое ассорти',
        price: 250,
        category: 'dessert',
        count: '250 г',
        image: 'images/ice_cream_mix.png',
        kind: 'large'
    }
];