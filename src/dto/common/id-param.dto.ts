import { IsMongoId } from 'class-validator'

export class IdParamDto {
  @IsMongoId({ message: 'id must be a valid id' })
  id: string
}
