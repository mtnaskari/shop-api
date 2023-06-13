import mongoose, { isValidObjectId } from 'mongoose'
import { injectable } from 'tsyringe'

import { ProductModel } from '../database/models/product.model'

@injectable()
export class ProductService {
  /**
   * Find a product by id
   * @param productId Id of the product
   * @param name Name of the product
   * @param category Id of the category
   * @param price Price of the product
   * @param sortBy The field to sort by that can be name or price
   * @param sortOrder The order of the sort that can be asc or desc
   * @returns The product or products found
   */
  public readProduct = async (
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

    const sort: Record<string, 1 | -1 | mongoose.Expression.Meta> = sortBy
      ? { [sortBy.toString()]: sortOrder === 'asc' ? 1 : -1 }
      : { _id: 1 }

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
