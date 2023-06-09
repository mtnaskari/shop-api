import { Document, ObjectId } from 'mongoose'

export interface ICategory extends Document {
  _id: ObjectId
  name: string
  details: string
}
