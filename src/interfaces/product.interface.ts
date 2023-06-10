import { Document, ObjectId } from 'mongoose'

import { ICategory } from './category.interface'

/**
 * Product interface for the product model
 */
export interface IProduct extends Document {
  _id: ObjectId
  name: string
  image: string
  details: string
  price: number
  category: ICategory['_id']
}
