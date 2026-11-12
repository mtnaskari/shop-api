import { injectable } from 'tsyringe'

import { CategoryDocument, CategoryModel } from '../database/models/category.model'
import { ProductModel } from '../database/models/product.model'
import { CreateCategoryDto } from '../dto/category/create-category.dto'
import { UpdateCategoryDto } from '../dto/category/update-category.dto'
import { HttpException } from '../utils/http-exception'
import { compact } from '../utils/strings'

@injectable()
export class CategoryService {
  public list = async (): Promise<CategoryDocument[]> => {
    return CategoryModel.find().sort({ name: 1 })
  }

  public getById = async (id: string): Promise<CategoryDocument> => {
    const category = await CategoryModel.findById(id)
    if (!category) throw HttpException.notFound('Category not found')
    return category
  }

  public exists = async (id: string): Promise<boolean> => {
    return (await CategoryModel.exists({ _id: id })) !== null
  }

  public create = async (dto: CreateCategoryDto): Promise<CategoryDocument> => {
    return CategoryModel.create(dto)
  }

  public update = async (id: string, dto: UpdateCategoryDto): Promise<CategoryDocument> => {
    const changes = compact(dto)
    if (Object.keys(changes).length === 0) throw HttpException.badRequest('Provide at least one field to update')

    const category = await CategoryModel.findByIdAndUpdate(id, changes, { new: true, runValidators: true })
    if (!category) throw HttpException.notFound('Category not found')
    return category
  }

  /** Delete an empty category. Categories that still have products cannot be deleted. */
  public delete = async (id: string): Promise<void> => {
    await this.getById(id)
    if (await ProductModel.exists({ category: id })) {
      throw HttpException.conflict('Category still has products; move or delete them first')
    }
    await CategoryModel.deleteOne({ _id: id })
  }
}
