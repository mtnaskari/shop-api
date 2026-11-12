import { HydratedDocument, model, Schema } from 'mongoose'

import { baseSchemaOptions } from '../schema-options'

export interface Category {
  name: string
  description?: string | null
  createdAt: Date
  updatedAt: Date
}

export type CategoryDocument = HydratedDocument<Category>

const CategorySchema = new Schema<Category>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: null, trim: true },
  },
  baseSchemaOptions,
)

export const CategoryModel = model<Category>('Category', CategorySchema)
