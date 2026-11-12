import { Request, Response } from 'express'
import { injectable } from 'tsyringe'

import { UserRole } from '../database/models/user.model'
import { CreateCategoryDto } from '../dto/category/create-category.dto'
import { UpdateCategoryDto } from '../dto/category/update-category.dto'
import { IdParamDto } from '../dto/common/id-param.dto'
import { AuthMiddleware } from '../middlewares/auth.middleware'
import { validateRequest } from '../middlewares/validate.middleware'
import { CategoryService } from '../services/category.service'
import { HttpResponse } from '../utils/http-response'
import { Controller } from './controller'

@injectable()
export class CategoryController extends Controller {
  readonly path = '/categories'

  constructor(
    private readonly categoryService: CategoryService,
    private readonly auth: AuthMiddleware,
  ) {
    super()
    this.initializeRoutes()
  }

  protected initializeRoutes(): void {
    const adminOnly = [this.auth.authenticate, this.auth.authorize(UserRole.Admin)]
    const byId = `${this.path}/:id`

    this.router.get(this.path, this.list)
    this.router.get(byId, validateRequest(IdParamDto, 'params'), this.get)
    this.router.post(this.path, ...adminOnly, validateRequest(CreateCategoryDto), this.create)
    this.router.patch(
      byId,
      ...adminOnly,
      validateRequest(IdParamDto, 'params'),
      validateRequest(UpdateCategoryDto),
      this.update,
    )
    this.router.delete(byId, ...adminOnly, validateRequest(IdParamDto, 'params'), this.remove)
  }

  private list = async (_req: Request, res: Response) => {
    return HttpResponse.ok(res, await this.categoryService.list())
  }

  private get = async (req: Request, res: Response) => {
    return HttpResponse.ok(res, await this.categoryService.getById(req.params.id))
  }

  private create = async (req: Request, res: Response) => {
    return HttpResponse.created(res, await this.categoryService.create(req.body as CreateCategoryDto))
  }

  private update = async (req: Request, res: Response) => {
    return HttpResponse.ok(res, await this.categoryService.update(req.params.id, req.body as UpdateCategoryDto))
  }

  private remove = async (req: Request, res: Response) => {
    await this.categoryService.delete(req.params.id)
    return HttpResponse.noContent(res)
  }
}
