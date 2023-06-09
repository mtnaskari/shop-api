import mongoose from 'mongoose'

import { connectToDatabase } from '../db.connection'
import { CategoryModel } from '../models/category.model'

const categories = [
  {
    name: 'Category 1',
    details: 'Details for Category 1',
  },
  {
    name: 'Category 2',
    details: 'Details for Category 2',
  },
  {
    name: 'Category 3',
    details: 'Details for Category 3',
  },
  {
    name: 'Category 4',
    details: 'Details for Category 4',
  },
  {
    name: 'Category 5',
    details: 'Details for Category 5',
  },
]

export const categorySeed = (async () => {
  try {
    await connectToDatabase()

    await CategoryModel.deleteMany({})

    await CategoryModel.insertMany(categories)

    console.log('[Database]: Category seed completed successfully💾')
  } catch (error) {
    console.error('Error seeding categories:', error)
  } finally {
    mongoose.disconnect()
  }
})()
