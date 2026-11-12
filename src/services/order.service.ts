import { FilterQuery, Types } from 'mongoose'
import { injectable } from 'tsyringe'

import { Order, OrderDocument, OrderItem, OrderModel, OrderStatus } from '../database/models/order.model'
import { ProductModel } from '../database/models/product.model'
import { UserDocument, UserRole } from '../database/models/user.model'
import { CreateOrderDto } from '../dto/order/create-order.dto'
import { OrderQueryDto } from '../dto/order/order-query.dto'
import { HttpException } from '../utils/http-exception'
import { buildMeta, Paginated, toSkip } from '../utils/pagination'

/** Allowed status changes. Paid and cancelled orders are final. */
const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.Pending]: [OrderStatus.Paid, OrderStatus.Cancelled],
  [OrderStatus.Paid]: [],
  [OrderStatus.Cancelled]: [],
}

const roundMoney = (value: number) => Math.round(value * 100) / 100

@injectable()
export class OrderService {
  /**
   * Place an order. Quantities of repeated products are merged, every product must exist and be
   * available, and prices are taken from the database rather than from the client.
   */
  public create = async (user: UserDocument, dto: CreateOrderDto): Promise<OrderDocument> => {
    const quantities = new Map<string, number>()
    for (const { product, quantity } of dto.items) {
      quantities.set(product, (quantities.get(product) ?? 0) + quantity)
    }

    const ids = [...quantities.keys()]
    const products = await ProductModel.find({ _id: { $in: ids } })
    const byId = new Map(products.map((product) => [product.id as string, product]))

    const missing = ids.filter((id) => !byId.has(id))
    if (missing.length > 0) throw HttpException.badRequest('Some products do not exist', missing)

    const unavailable = products.filter((product) => !product.isAvailable).map((product) => product.name)
    if (unavailable.length > 0) throw HttpException.badRequest('Some products are not available', unavailable)

    const items: OrderItem[] = ids.map((id) => {
      const product = byId.get(id)!
      const quantity = quantities.get(id)!
      return {
        product: product._id,
        name: product.name,
        unitPrice: product.price,
        quantity,
        subtotal: roundMoney(product.price * quantity),
      }
    })
    const totalPrice = roundMoney(items.reduce((sum, item) => sum + item.subtotal, 0))

    return OrderModel.create({ user: user._id, items, totalPrice })
  }

  /** Customers see their own orders; admins see every order. */
  public list = async (user: UserDocument, query: OrderQueryDto): Promise<Paginated<OrderDocument>> => {
    const { page, limit, status } = query
    const filter: FilterQuery<Order> = {
      ...(user.role !== UserRole.Admin && { user: user._id }),
      ...(status && { status }),
    }

    const [items, total] = await Promise.all([
      OrderModel.find(filter).sort({ createdAt: -1, _id: -1 }).skip(toSkip(page, limit)).limit(limit),
      OrderModel.countDocuments(filter),
    ])
    return { items, meta: buildMeta(page, limit, total) }
  }

  /** Fetch an order the user may see. Other users' orders are reported as not found. */
  public getById = async (user: UserDocument, id: string): Promise<OrderDocument> => {
    const order = await OrderModel.findById(id)
    if (!order || !this.canAccess(user, order)) throw HttpException.notFound('Order not found')
    return order
  }

  /** Let the owner cancel an order that has not been paid yet. */
  public cancel = async (user: UserDocument, id: string): Promise<OrderDocument> => {
    const order = await this.getById(user, id)
    return this.transition(order, OrderStatus.Cancelled)
  }

  /** Admin only: move an order to a new status. */
  public updateStatus = async (id: string, status: OrderStatus): Promise<OrderDocument> => {
    const order = await OrderModel.findById(id)
    if (!order) throw HttpException.notFound('Order not found')
    return this.transition(order, status)
  }

  private transition = async (order: OrderDocument, next: OrderStatus): Promise<OrderDocument> => {
    if (!TRANSITIONS[order.status].includes(next)) {
      throw HttpException.conflict(`Cannot change order status from ${order.status} to ${next}`)
    }
    order.status = next
    return order.save()
  }

  private canAccess = (user: UserDocument, order: OrderDocument): boolean => {
    return user.role === UserRole.Admin || (order.user as Types.ObjectId).equals(user._id)
  }
}
