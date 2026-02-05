export const MOCK_CHEFS = [
    {
        id: '1',
        name: "Enrico's Caribbean Cuisine",
        rating: 3,
        minOrder: 10.00,
        deliveryFee: 2.50,
        time: '23 mins',
        distance: '5 km',
        discount: '40% OFF up to 10€',
        isSchedule: true,
        closingTime: '21:00',
        coverImage: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1000&auto=format&fit=crop',
        logoImage: 'https://thumbs.dreamstime.com/b/mom-s-kitchen-logo-design-vector-illustration-cooking-element-190623351.jpg',
        tags: ['Caribbean', 'Spicy', 'Platters']
    },
    {
        id: '2',
        name: "Sushi Master Ken",
        rating: 4.9,
        minOrder: 15.00,
        deliveryFee: 0.00,
        time: '45 mins',
        distance: '8 km',
        discount: null,
        isSchedule: false,
        closingTime: '22:30',
        coverImage: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=1000&auto=format&fit=crop',
        logoImage: 'https://cdn.dribbble.com/users/3534891/screenshots/16362598/media/64b52b36873b88934983df56926317bc.jpg',
        tags: ['Sushi', 'Japanese', 'Healthy']
    },
    {
        id: '3',
        name: "Luigi's Italian",
        rating: 4.5,
        minOrder: 12.00,
        deliveryFee: 1.50,
        time: '30 mins',
        distance: '3 km',
        discount: 'Free Delivery',
        isSchedule: true,
        closingTime: '22:00',
        coverImage: 'https://images.unsplash.com/photo-1595295333158-4742f28fbd85?q=80&w=1000',
        logoImage: 'https://img.freepik.com/premium-vector/italian-chef-logo-design_9845-313.jpg',
        tags: ['Italian', 'Pasta', 'Pizza']
    },
];

export const MOCK_MENU = {
    '1': {
        featured: [
            { id: 'f1', type: 'food', name: 'Jerk Drums', price: 10.00, dietary: 'non-veg', image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?q=80&w=1000' },
            { id: 'f2', type: 'food', name: 'Veggie Bowl', price: 8.50, dietary: 'veg', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1000' },
            { id: 'f3', type: 'food', name: 'Spicy Wrap', price: 9.00, dietary: 'non-veg', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=1000' }
        ],
        main: [
            { id: '1', name: 'Jerk Chicken with Rice', description: 'Tender chicken marinated in authentic jerk spices, served with rice and peas.', price: 10.00, dietary: 'non-veg', meta: '23 mins • 5 km', cardStyle: 'horizontal', image: 'https://images.unsplash.com/photo-1594221708779-91b404d7c07c?q=80&w=1000' },
            { id: '2', name: 'Smoked BBQ Ribs', description: 'Slow cooked pork ribs with a sticky honey glaze.', price: 14.50, dietary: 'non-veg', meta: '35 mins • 5 km', cardStyle: 'vertical', image: 'https://images.unsplash.com/photo-1544025162-d76690b67f11?q=80&w=1000' },
            { id: '3', name: 'Caribbean Curry Goat', description: 'Traditional goat curry with potatoes and spices.', price: 12.00, dietary: 'non-veg', meta: '30 mins • 5 km', cardStyle: 'horizontal', image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=1000' },
            { id: '4', name: 'Vegan Rasta Pasta', description: 'Creamy coconut pasta with colorful bell peppers.', price: 9.50, dietary: 'vegan', meta: '15 mins • 5 km', cardStyle: 'horizontal', image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?q=80&w=1000' }
        ]
    }
};

export const CATEGORY_IMAGES = {
    'All': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=200',
    'Burger': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=200',
    'Sushi': 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=200',
    'Italian': 'https://images.unsplash.com/photo-1595295333158-4742f28fbd85?q=80&w=200',
    'Vegan': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=200',
    'Dessert': 'https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=200',
};
