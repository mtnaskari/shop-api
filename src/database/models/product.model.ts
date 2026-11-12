import { HydratedDocument, model, Schema, Types } from 'mongoose'

import { baseSchemaOptions } from '../schema-options'

export interface Product {
  name: string
  description?: string | null
  price: number
  category: Types.ObjectId
  image?: string | null
  isAvailable: boolean
  createdAt: Date
  updatedAt: Date
}

export type ProductDocument = HydratedDocument<Product>

const ProductSchema = new Schema<Product>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: null, trim: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    image: { type: String, default: null },
    isAvailable: { type: Boolean, default: true },
  },
  baseSchemaOptions,
)

ProductSchema.index({ price: 1 })
ProductSchema.index({ name: 1 })

export const ProductModel = model<Product>('Product', ProductSchema)
