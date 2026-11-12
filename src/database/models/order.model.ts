import { HydratedDocument, model, Schema, Types } from 'mongoose'

import { baseSchemaOptions } from '../schema-options'

export enum OrderStatus {
  Pending = 'pending',
  Paid = 'paid',
  Cancelled = 'cancelled',
}

/**
 * A line of an order. Name and unit price are copied from the product when the order is placed,
 * so later price changes or a deleted product never rewrite order history.
 */
export interface OrderItem {
  product: Types.ObjectId
  name: string
  unitPrice: number
  quantity: number
  subtotal: number
}

export interface Order {
  user: Types.ObjectId
  items: OrderItem[]
  totalPrice: number
  status: OrderStatus
  createdAt: Date
  updatedAt: Date
}

export type OrderDocument = HydratedDocument<Order>

const OrderItemSchema = new Schema<OrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    unitPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    subtotal: { type: Number, required: true, min: 0 },
  },
  { _id: false },
)

const OrderSchema = new Schema<Order>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: { type: [OrderItemSchema], required: true },
    totalPrice: { type: Number, required: true, min: 0 },
    status: { type: String, enum: Object.values(OrderStatus), default: OrderStatus.Pending },
  },
  baseSchemaOptions,
)

export const OrderModel = model<Order>('Order', OrderSchema)
