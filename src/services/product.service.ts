import { FilterQuery, SortOrder } from 'mongoose'
import { injectable } from 'tsyringe'

import { Product, ProductDocument, ProductModel } from '../database/models/product.model'
import { CreateProductDto } from '../dto/product/create-product.dto'
import { ProductQueryDto } from '../dto/product/product-query.dto'
import { UpdateProductDto } from '../dto/product/update-product.dto'
import { HttpException } from '../utils/http-exception'
import { buildMeta, Paginated, toSkip } from '../utils/pagination'
import { compact, escapeRegex } from '../utils/strings'
import { CategoryService } from './category.service'

const CATEGORY_FIELDS = 'name description'

@injectable()
export class ProductService {
  constructor(private readonly categoryService: CategoryService) {}

  /** List products with search, filters, sorting and pagination. */
  public list = async (query: ProductQueryDto): Promise<Paginated<ProductDocument>> => {
    const { page, limit, search, category, minPrice, maxPrice, available, sort } = query

    if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
      throw HttpException.badRequest('minPrice must not be greater than maxPrice')
    }

    const filter: FilterQuery<Product> = {}
    if (search) {
      const pattern = new RegExp(escapeRegex(search), 'i')
      filter.$or = [{ name: pattern }, { description: pattern }]
    }
    if (category) filter.category = category
    if (available !== undefined) filter.isAvailable = available
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {
        ...(minPrice !== undefined && { $gte: minPrice }),
        ...(maxPrice !== undefined && { $lte: maxPrice }),
      }
    }

    const field = sort.replace(/^-/, '')
    const direction: SortOrder = sort.startsWith('-') ? -1 : 1

    const [items, total] = await Promise.all([
      ProductModel.find(filter)
        // Tie-break on _id so pages stay stable when the sort field has duplicates.
        .sort({ [field]: direction, _id: direction })
        .skip(toSkip(page, limit))
        .limit(limit)
        .populate('category', CATEGORY_FIELDS),
      ProductModel.countDocuments(filter),
    ])

    return { items, meta: buildMeta(page, limit, total) }
  }

  public getById = async (id: string): Promise<ProductDocument> => {
    const product = await ProductModel.findById(id).populate('category', CATEGORY_FIELDS)
    if (!product) throw HttpException.notFound('Product not found')
    return product
  }

  public create = async (dto: CreateProductDto): Promise<ProductDocument> => {
    await this.assertCategoryExists(dto.category)
    const product = await ProductModel.create(dto)
    return product.populate('category', CATEGORY_FIELDS)
  }

  public update = async (id: string, dto: UpdateProductDto): Promise<ProductDocument> => {
    const changes = compact(dto)
    if (Object.keys(changes).length === 0) throw HttpException.badRequest('Provide at least one field to update')
    if (changes.category) await this.assertCategoryExists(changes.category)

    const product = await ProductModel.findByIdAndUpdate(id, changes, { new: true, runValidators: true }).populate(
      'category',
      CATEGORY_FIELDS,
    )
    if (!product) throw HttpException.notFound('Product not found')
    return product
  }

  public delete = async (id: string): Promise<void> => {
    const { deletedCount } = await ProductModel.deleteOne({ _id: id })
    if (deletedCount === 0) throw HttpException.notFound('Product not found')
  }

  private assertCategoryExists = async (categoryId: string): Promise<void> => {
    if (!(await this.categoryService.exists(categoryId))) {
      throw HttpException.badRequest('Validation failed', ['category does not exist'])
    }
  }
}
