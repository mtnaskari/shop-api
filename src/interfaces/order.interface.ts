import { ObjectId } from 'mongoose'

import { IProduct } from './product.interface'
import { IUser } from './user.interface'

export interface IOrder extends Document {
  _id: ObjectId
  user: IUser['_id']
  products: Array<{
    product: IProduct['_id']
    amount: number
  }>
  totalPrice: number
  status: OrderStatus
}

/**
 * Order status enum
 */
export enum OrderStatus {
  notPaid = 'notPaid',
  paid = 'paid',
  failed = 'failed',
}
