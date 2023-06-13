import { isValidObjectId, ObjectId } from 'mongoose'
import { injectable } from 'tsyringe'

import { OrderModel } from '../database/models/order.model'
import { ProductModel } from '../database/models/product.model'
import { ProductItem } from '../dto/order/create-order.dto'
import { HttpException } from '../utils/http-exception'

@injectable()
export class OrderService {
  public createOrder = async (orders: ProductItem[], user: ObjectId) => {
    const orderTotalPromises = orders.map(async (item: ProductItem) => {
      const { product, amount } = item

      if (!isValidObjectId(product)) throw new HttpException(`Invalid product ID: ${product}`, 400)

      const productDetails = await ProductModel.findById(product)
      if (!productDetails) throw new HttpException(`Product not found for ID: ${product}`, 404)

      return productDetails.price * amount
    })

    const itemTotals = await Promise.all(orderTotalPromises)
    const orderTotalPrice = itemTotals.reduce((sum, value) => sum + value, 0)

    return (await OrderModel.create({ user, products: orders, totalPrice: orderTotalPrice }))._id
  }

  public readOrder = async (user: ObjectId) => {
    return await OrderModel.find({ user })
      .populate({
        path: 'products.product',
        select: '-createdAt -updatedAt -__v',
      })
      .select('-createdAt -updatedAt -__v -products._id')
  }
}
