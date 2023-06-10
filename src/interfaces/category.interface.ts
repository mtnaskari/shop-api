import { Document, ObjectId } from 'mongoose'

/**
 * Category interface for the category model
 */
export interface ICategory extends Document {
  _id: ObjectId
  name: string
  details: string
}
