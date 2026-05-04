import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Res,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { LoginUseCase } from './use-cases/login.use-case';
import { LogoutUseCase } from './use-cases/logout.use-case';
import { RefreshTokenUseCase } from './use-cases/refresh-token.use-case';
import { RevokeAllSessionsUseCase } from './use-cases/revoke-all-sessions.use-case';
import { LoginDto } from './dtos';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import type { CurrentUserData } from '../../shared/decorators/current-user.decorator';

const COOKIE_NAME = process.env['REFRESH_TOKEN_COOKIE_NAME'] ?? 'refresh_token';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly revokeAllSessionsUseCase: RevokeAllSessionsUseCase,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { tokens, rawRefreshToken } = await this.loginUseCase.execute(dto);

    res.cookie(COOKIE_NAME, rawRefreshToken, {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'strict',
      maxAge: COOKIE_MAX_AGE,
      path: '/auth',
    });

    return tokens;
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.[COOKIE_NAME] as string | undefined;
    if (refreshToken) {
      await this.logoutUseCase.execute(refreshToken);
    }
    res.clearCookie(COOKIE_NAME, { path: '/auth' });
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const rawRefreshToken = req.cookies?.[COOKIE_NAME] as string | undefined;
    if (!rawRefreshToken) {
      throw new UnauthorizedException('Refresh token no encontrado');
    }

    const { tokens, rawRefreshToken: newRawToken } =
      await this.refreshTokenUseCase.execute(rawRefreshToken);

    res.cookie(COOKIE_NAME, newRawToken, {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'strict',
      maxAge: COOKIE_MAX_AGE,
      path: '/auth',
    });

    return tokens;
  }

  @Post('revoke-all')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async revokeAll(
    @CurrentUser() user: CurrentUserData,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.revokeAllSessionsUseCase.execute(user.id);
    res.clearCookie(COOKIE_NAME, { path: '/auth' });
  }
}