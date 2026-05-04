import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { readFileSync } from 'fs';
import { join } from 'path';
import type { JwtModuleOptions } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { LoginUseCase } from './use-cases/login.use-case';
import { LogoutUseCase } from './use-cases/logout.use-case';
import { RefreshTokenUseCase } from './use-cases/refresh-token.use-case';
import { RevokeAllSessionsUseCase } from './use-cases/revoke-all-sessions.use-case';
import { PrismaAuthRepository } from './infrastructure/prisma-auth.repository';
import { JwtStrategy } from './infrastructure/jwt.strategy';
import { RedisAuthService } from './infrastructure/redis-auth.service';
import { AccountLockoutService } from './infrastructure/account-lockout.service';
import { RedisCacheService } from '../../shared/cache/redis-cache.service';
import { I_AUTH_REPOSITORY } from './repositories/auth.repository.interface';
import { PrismaService } from '../../prisma.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): JwtModuleOptions => {
        const privateKeyPath = config.get<string>('JWT_PRIVATE_KEY_PATH') ?? 'keys/private.pem';
        const publicKeyPath  = config.get<string>('JWT_PUBLIC_KEY_PATH')  ?? 'keys/public.pem';
        const privateKey = readFileSync(join(process.cwd(), privateKeyPath), 'utf8');
        const publicKey  = readFileSync(join(process.cwd(), publicKeyPath),  'utf8');
        const options: JwtModuleOptions = {
          privateKey,
          publicKey,
          signOptions: { algorithm: 'RS256', expiresIn: '15m' },
          verifyOptions: { algorithms: ['RS256'] },
        };
        return options;
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    PrismaService,
    RedisCacheService,
    RedisAuthService,
    AccountLockoutService,
    JwtStrategy,
    LoginUseCase,
    LogoutUseCase,
    RefreshTokenUseCase,
    RevokeAllSessionsUseCase,
    {
      provide: I_AUTH_REPOSITORY,
      useClass: PrismaAuthRepository,
    },
  ],
  exports: [JwtModule, PassportModule, RedisAuthService, AccountLockoutService],
})
export class AuthModule {}