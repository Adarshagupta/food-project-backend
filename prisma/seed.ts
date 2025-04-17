import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'All' },
      update: {},
      create: {
        name: 'All',
        description: 'All restaurants',
        emoji: '🍽️',
        image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=100&h=100&fit=crop',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Pizza' },
      update: {},
      create: {
        name: 'Pizza',
        description: 'Pizza restaurants',
        emoji: '🍕',
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=100&h=100&fit=crop',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Burger' },
      update: {},
      create: {
        name: 'Burger',
        description: 'Burger restaurants',
        emoji: '🍔',
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=100&h=100&fit=crop',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Breakfast' },
      update: {},
      create: {
        name: 'Breakfast',
        description: 'Breakfast restaurants',
        emoji: '🍳',
        image: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=100&h=100&fit=crop',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Street Food' },
      update: {},
      create: {
        name: 'Street Food',
        description: 'Street food vendors',
        emoji: '🌮',
        image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=100&h=100&fit=crop',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Healthy' },
      update: {},
      create: {
        name: 'Healthy',
        description: 'Healthy food options',
        emoji: '🥗',
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=100&h=100&fit=crop',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Desserts' },
      update: {},
      create: {
        name: 'Desserts',
        description: 'Dessert places',
        emoji: '🍰',
        image: 'https://images.unsplash.com/photo-1495147466023-ac5c588e2e94?w=100&h=100&fit=crop',
      },
    }),
  ]);

  console.log('Categories created:', categories.length);

  // Create restaurants
  const pizzaPlace = await prisma.restaurant.upsert({
    where: { id: '1' },
    update: {},
    create: {
      id: '1',
      name: 'Pizza Palace',
      description: 'The best pizza in town',
      address: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      phone: '+1234567890',
      email: 'contact@pizzapalace.com',
      website: 'https://pizzapalace.com',
      logoImage: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&h=300&fit=crop',
      coverImage: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1000&h=400&fit=crop',
      latitude: 40.7128,
      longitude: -74.006,
      rating: 4.5,
      priceLevel: 2,
      isActive: true,
      openingHours: {
        monday: { open: '09:00', close: '22:00' },
        tuesday: { open: '09:00', close: '22:00' },
        wednesday: { open: '09:00', close: '22:00' },
        thursday: { open: '09:00', close: '22:00' },
        friday: { open: '09:00', close: '23:00' },
        saturday: { open: '10:00', close: '23:00' },
        sunday: { open: '10:00', close: '22:00' },
      },
      categories: {
        create: [
          {
            category: {
              connect: { name: 'Pizza' },
            },
          },
        ],
      },
    },
  });

  const burgerJoint = await prisma.restaurant.upsert({
    where: { id: '2' },
    update: {},
    create: {
      id: '2',
      name: 'Burger Joint',
      description: 'Juicy burgers and crispy fries',
      address: '456 Elm St',
      city: 'New York',
      state: 'NY',
      zipCode: '10002',
      phone: '+1234567891',
      email: 'contact@burgerjoint.com',
      website: 'https://burgerjoint.com',
      logoImage: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=300&fit=crop',
      coverImage: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1000&h=400&fit=crop',
      latitude: 40.7129,
      longitude: -74.007,
      rating: 4.3,
      priceLevel: 2,
      isActive: true,
      openingHours: {
        monday: { open: '10:00', close: '22:00' },
        tuesday: { open: '10:00', close: '22:00' },
        wednesday: { open: '10:00', close: '22:00' },
        thursday: { open: '10:00', close: '22:00' },
        friday: { open: '10:00', close: '23:00' },
        saturday: { open: '11:00', close: '23:00' },
        sunday: { open: '11:00', close: '22:00' },
      },
      categories: {
        create: [
          {
            category: {
              connect: { name: 'Burger' },
            },
          },
        ],
      },
    },
  });

  console.log('Restaurants created:', 2);

  // Create menu items for Pizza Palace
  const pizzaMenuItems = await Promise.all([
    prisma.menuItem.upsert({
      where: { id: '1' },
      update: {},
      create: {
        id: '1',
        restaurantId: pizzaPlace.id,
        categoryId: categories.find(c => c.name === 'Pizza').id,
        name: 'Margherita Pizza',
        description: 'Fresh tomatoes, mozzarella, basil',
        price: '14.99',
        image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=300&h=300&fit=crop',
        isAvailable: true,
        isPopular: true,
        isVegetarian: true,
        calories: 800,
        prepTime: 20,
      },
    }),
    prisma.menuItem.upsert({
      where: { id: '2' },
      update: {},
      create: {
        id: '2',
        restaurantId: pizzaPlace.id,
        categoryId: categories.find(c => c.name === 'Pizza').id,
        name: 'Pepperoni Pizza',
        description: 'Spicy pepperoni, mozzarella, tomato sauce',
        price: '15.99',
        image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=300&h=300&fit=crop',
        isAvailable: true,
        isPopular: true,
        calories: 950,
        prepTime: 20,
      },
    }),
    prisma.menuItem.upsert({
      where: { id: '3' },
      update: {},
      create: {
        id: '3',
        restaurantId: pizzaPlace.id,
        categoryId: categories.find(c => c.name === 'Pizza').id,
        name: 'Vegetarian Pizza',
        description: 'Bell peppers, mushrooms, onions, olives',
        price: '13.99',
        image: 'https://images.unsplash.com/photo-1571066811602-716837d681de?w=300&h=300&fit=crop',
        isAvailable: true,
        isVegetarian: true,
        calories: 750,
        prepTime: 20,
      },
    }),
  ]);

  // Create menu items for Burger Joint
  const burgerMenuItems = await Promise.all([
    prisma.menuItem.upsert({
      where: { id: '4' },
      update: {},
      create: {
        id: '4',
        restaurantId: burgerJoint.id,
        categoryId: categories.find(c => c.name === 'Burger').id,
        name: 'Classic Cheeseburger',
        description: 'Beef patty, cheddar, lettuce, tomato',
        price: '12.99',
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=300&fit=crop',
        isAvailable: true,
        isPopular: true,
        calories: 850,
        prepTime: 15,
      },
    }),
    prisma.menuItem.upsert({
      where: { id: '5' },
      update: {},
      create: {
        id: '5',
        restaurantId: burgerJoint.id,
        categoryId: categories.find(c => c.name === 'Burger').id,
        name: 'Double Bacon Burger',
        description: 'Double patty, bacon, cheese, special sauce',
        price: '16.99',
        image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=300&h=300&fit=crop',
        isAvailable: true,
        isPopular: true,
        calories: 1200,
        prepTime: 18,
      },
    }),
    prisma.menuItem.upsert({
      where: { id: '6' },
      update: {},
      create: {
        id: '6',
        restaurantId: burgerJoint.id,
        categoryId: categories.find(c => c.name === 'Burger').id,
        name: 'Veggie Burger',
        description: 'Plant-based patty, lettuce, tomato, vegan mayo',
        price: '13.99',
        image: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=300&h=300&fit=crop',
        isAvailable: true,
        isVegetarian: true,
        isVegan: true,
        calories: 650,
        prepTime: 15,
      },
    }),
  ]);

  console.log('Menu items created:', pizzaMenuItems.length + burgerMenuItems.length);

  // Create promotions
  const promotions = await Promise.all([
    prisma.promotion.upsert({
      where: { id: '1' },
      update: {},
      create: {
        id: '1',
        title: '50% OFF',
        subtitle: 'First Order',
        description: 'Get 50% off on your first order with Foodo',
        code: 'WELCOME50',
        discountType: 'percentage',
        discountValue: '50.00',
        minOrderValue: '20.00',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&h=300&fit=crop',
        color: '#FF4B3A',
        isActive: true,
      },
    }),
    prisma.promotion.upsert({
      where: { id: '2' },
      update: {},
      create: {
        id: '2',
        title: 'Free Delivery',
        subtitle: 'Orders $30+',
        description: 'Free delivery on all orders over $30',
        discountType: 'free_delivery',
        minOrderValue: '30.00',
        startDate: new Date(),
        endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&h=300&fit=crop',
        color: '#4CAF50',
        isActive: true,
      },
    }),
    prisma.promotion.upsert({
      where: { id: '3' },
      update: {},
      create: {
        id: '3',
        title: 'Daily Deals',
        subtitle: 'Lunch Special',
        description: '20% off all orders between 12PM - 3PM',
        code: 'LUNCH20',
        discountType: 'percentage',
        discountValue: '20.00',
        startDate: new Date(),
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
        image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=300&h=300&fit=crop',
        color: '#2196F3',
        isActive: true,
      },
    }),
  ]);

  console.log('Promotions created:', promotions.length);

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
