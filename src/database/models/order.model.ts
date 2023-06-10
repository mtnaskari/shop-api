import { model, Schema } from 'mongoose'

import { IOrder, OrderStatus } from '../../interfaces/order.interface'

const OrderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    products: [
      {
        product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        amount: { type: Number, required: true },
      },
    ],
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: [OrderStatus.paid, OrderStatus.notPaid, OrderStatus.failed],
      default: OrderStatus.notPaid,
    },
  },
  { timestamps: true },
)

export const OrderModel = model<IOrder>('Order', OrderSchema)
