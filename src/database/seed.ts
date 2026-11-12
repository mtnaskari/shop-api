import 'dotenv/config'

import { hash } from 'bcryptjs'

import { connectToDatabase, disconnectFromDatabase } from './connection'
import { CategoryModel } from './models/category.model'
import { ProductModel } from './models/product.model'
import { UserModel, UserRole } from './models/user.model'
import { createLogger } from '../utils/logger'

const logger = createLogger('seed')

const menu: Record<string, { description: string; products: [name: string, price: number, description: string][] }> = {
  Coffee: {
    description: 'Espresso based drinks, made with a seasonal single-origin roast',
    products: [
      ['Espresso', 2.5, 'A short, intense double shot'],
      ['Americano', 3.0, 'Espresso lengthened with hot water'],
      ['Cappuccino', 3.8, 'Espresso, steamed milk and a thick layer of foam'],
      ['Flat White', 4.2, 'Double ristretto with velvety micro-foam'],
      ['Caffe Latte', 4.0, 'Espresso with plenty of steamed milk'],
      ['Mocha', 4.5, 'Espresso, chocolate and steamed milk'],
    ],
  },
  Tea: {
    description: 'Loose-leaf teas and infusions',
    products: [
      ['English Breakfast', 2.8, 'Full-bodied black tea'],
      ['Jasmine Green', 3.0, 'Green tea scented with jasmine flowers'],
      ['Chai Latte', 4.0, 'Spiced black tea with steamed milk'],
      ['Peppermint', 2.6, 'Caffeine-free mint infusion'],
    ],
  },
  'Cold Drinks': {
    description: 'Iced coffee, smoothies and soft drinks',
    products: [
      ['Iced Latte', 4.3, 'Espresso and cold milk over ice'],
      ['Cold Brew', 4.0, 'Coffee steeped for 18 hours'],
      ['Berry Smoothie', 5.0, 'Mixed berries, banana and yoghurt'],
      ['Sparkling Lemonade', 3.2, 'House-made, lightly sweetened'],
    ],
  },
  Pastries: {
    description: 'Baked fresh every morning',
    products: [
      ['Butter Croissant', 2.9, 'Flaky all-butter croissant'],
      ['Pain au Chocolat', 3.2, 'Croissant dough with dark chocolate'],
      ['Cinnamon Roll', 3.5, 'Soft roll with cinnamon sugar and icing'],
      ['Blueberry Muffin', 3.0, 'Packed with blueberries'],
    ],
  },
  Sandwiches: {
    description: 'Toasted to order',
    products: [
      ['Ham & Cheese Toastie', 6.5, 'Smoked ham and mature cheddar on sourdough'],
      ['Caprese Panini', 6.8, 'Mozzarella, tomato and basil pesto'],
      ['Avocado Toast', 7.2, 'Smashed avocado, chilli and lime on rye'],
    ],
  },
}

/**
 * Reset the menu and make sure an admin account exists. Safe to run repeatedly; users and
 * orders other than the admin account are left untouched.
 */
async function seed(): Promise<void> {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI is not set')

  const adminEmail = (process.env.ADMIN_EMAIL ?? 'admin@shop.local').toLowerCase()
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'admin12345'

  await connectToDatabase(uri)

  await ProductModel.deleteMany({})
  await CategoryModel.deleteMany({})

  for (const [name, { description, products }] of Object.entries(menu)) {
    const category = await CategoryModel.create({ name, description })
    await ProductModel.insertMany(
      products.map(([productName, price, productDescription]) => ({
        name: productName,
        price,
        description: productDescription,
        category: category._id,
      })),
    )
  }

  await UserModel.updateOne(
    { email: adminEmail },
    {
      $set: { role: UserRole.Admin, password: await hash(adminPassword, 10) },
      $setOnInsert: { fullName: 'Shop Admin', email: adminEmail },
    },
    { upsert: true },
  )

  const productCount = Object.values(menu).reduce((sum, { products }) => sum + products.length, 0)
  logger.info(`Seeded ${Object.keys(menu).length} categories and ${productCount} products`)
  logger.info(`Admin account: ${adminEmail}`)
}

seed()
  .catch((error: unknown) => {
    logger.error('Seeding failed', error)
    process.exitCode = 1
  })
  .finally(() => disconnectFromDatabase())
