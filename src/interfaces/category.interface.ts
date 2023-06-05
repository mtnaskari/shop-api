import { Document } from 'mongoose'

export interface ICategory extends Document {
  _id: string
  categoryName: string
  details: string
}
