import mongoose, { Schema } from 'mongoose'

import { ICategory } from '../../interfaces/category.interface'
import { connectToDatabase } from '../db.connection'
import { CategoryModel } from '../models/category.model'
import { ProductModel } from '../models/product.model'

export const seedProducts = (async () => {
  try {
    await connectToDatabase()

    const categories: ICategory[] = await CategoryModel.find()

    const categoryIds: Schema.Types.ObjectId[] = categories.map((category) => category._id)

    await ProductModel.deleteMany({})

    const products = []
    for (let i = 0; i < 5; i++) {
      const randomCategoryId = categoryIds[Math.floor(Math.random() * categoryIds.length)]
      const product = {
        name: `Product ${i + 1}`,
        price: Math.floor(Math.random() * 100),
        category: randomCategoryId,
        details: `Details for Product ${i + 1}`,
        image: 'https://www.caffesociety.co.uk/assets/recipe-images/latte-small.jpg',
      }
      products.push(product)
    }

    await ProductModel.insertMany(products)

    console.log('[Database]: Product seed completed successfully💾')
  } catch (error) {
    console.error('Error seeding products:', error)
  } finally {
    mongoose.disconnect()
  }
})()
