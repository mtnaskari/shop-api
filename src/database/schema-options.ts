import { SchemaOptions } from 'mongoose'

/**
 * Options shared by every schema: timestamps, and a JSON shape that exposes `id` instead of
 * `_id` and hides the `__v` version key.
 */
export const baseSchemaOptions = {
  timestamps: true,
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform: (_doc: unknown, ret: Record<string, unknown>) => {
      delete ret._id
      return ret
    },
  },
} satisfies SchemaOptions
