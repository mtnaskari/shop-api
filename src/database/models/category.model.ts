import { model, Schema } from 'mongoose'

import { ICategory } from '../../interfaces/category.interface'

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true },
    details: { type: String, default: null },
  },
  {
    timestamps: true,
  },
)

export const CategoryModel = model<ICategory>('Category', CategorySchema)
