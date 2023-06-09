import mongoose, { isValidObjectId } from 'mongoose'
import { injectable } from 'tsyringe'

import { ProductModel } from '../database/models/product.model'

@injectable()
export class ProductService {
  public findProduct = async (
    productId: string,
    name: string,
    category: string,
    price: string,
    sortBy: string,
    sortOrder: string,
  ) => {
    const match = {
      name: name ? { $regex: name.toString(), $options: 'i' } : { $exists: true },
      _id: isValidObjectId(productId) ? new mongoose.Types.ObjectId(productId) : { $exists: true },
      category:
        category && isValidObjectId(category.toString())
          ? new mongoose.Types.ObjectId(category.toString())
          : { $exists: true },
      price: price ? parseFloat(price.toString()) : { $exists: true },
    }

    let sort = {} as Record<string, 1 | -1 | mongoose.Expression.Meta>
    sort = sortBy ? { [sortBy.toString()]: sortOrder === 'asc' ? 1 : -1 } : { _id: 1 }

    const lookup = {
      from: 'categories',
      localField: 'category',
      foreignField: '_id',
      as: 'category',
    }

    const project = {
      'category.__v': 0,
      'category.createdAt': 0,
      'category.updatedAt': 0,
      __v: 0,
      createdAt: 0,
      updatedAt: 0,
    }

    return await ProductModel.aggregate([
      { $match: match },
      { $sort: sort },
      {
        $lookup: lookup,
      },
      {
        $unwind: '$category',
      },
      {
        $project: project,
      },
    ])
  }
}
