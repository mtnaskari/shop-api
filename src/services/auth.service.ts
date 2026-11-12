import { compare, hashSync } from 'bcryptjs'
import { JwtPayload, sign, SignOptions, verify } from 'jsonwebtoken'
import { inject, injectable } from 'tsyringe'

import { APP_CONFIG, AppConfig } from '../config/env'
import { UserDocument, UserRole } from '../database/models/user.model'
import { LoginDto } from '../dto/auth/login.dto'
import { RegisterDto } from '../dto/auth/register.dto'
import { HttpException } from '../utils/http-exception'
import { UserService } from './user.service'

export interface AuthResult {
  user: UserDocument
  token: string
  expiresIn: string
}

export interface TokenPayload extends JwtPayload {
  sub: string
  role: UserRole
}

// Compared against when the email is unknown, so both failure paths take about the same time.
const DUMMY_HASH = hashSync('timing-safe-placeholder', 10)

@injectable()
export class AuthService {
  constructor(
    @inject(APP_CONFIG) private readonly config: AppConfig,
    private readonly userService: UserService,
  ) {}

  public register = async (dto: RegisterDto): Promise<AuthResult> => {
    if (await this.userService.existsByEmail(dto.email)) {
      throw HttpException.conflict('An account with this email already exists')
    }

    const user = await this.userService.create(dto)
    return this.issue(user)
  }

  public login = async ({ email, password }: LoginDto): Promise<AuthResult> => {
    const user = await this.userService.findByEmailWithPassword(email)
    const isValid = await compare(password, user?.password ?? DUMMY_HASH)

    if (!user || !isValid) throw HttpException.unauthorized('Invalid email or password')

    return this.issue(user)
  }

  public signToken = (user: UserDocument): string => {
    return sign({ role: user.role }, this.config.jwt.secret, {
      subject: user.id,
      expiresIn: this.config.jwt.expiresIn as SignOptions['expiresIn'],
    })
  }

  /** @throws HttpException 401 when the token is missing a subject, malformed or expired */
  public verifyToken = (token: string): TokenPayload => {
    let payload: string | JwtPayload
    try {
      payload = verify(token, this.config.jwt.secret)
    } catch {
      throw HttpException.unauthorized('Invalid or expired token')
    }

    if (typeof payload === 'string' || typeof payload.sub !== 'string') {
      throw HttpException.unauthorized('Invalid or expired token')
    }
    return payload as TokenPayload
  }

  private issue = (user: UserDocument): AuthResult => ({
    user,
    token: this.signToken(user),
    expiresIn: this.config.jwt.expiresIn,
  })
}
