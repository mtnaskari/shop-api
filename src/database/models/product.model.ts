import { model, Schema } from 'mongoose'

import { IProduct } from '../../interfaces/product.interface'

const CategorySchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    details: { type: String, default: null },
    image: { type: String, required: true },
  },
  {
    timestamps: true,
  },
)

export const ProductModel = model<IProduct>('Product', CategorySchema)
