import { Document, Schema } from 'mongoose'

import { ICategory } from './category.interface'

export interface IProduct extends Document {
  _id: Schema.Types.ObjectId
  name: string
  image: string
  details: string
  price: number
  category: ICategory['_id']
}
