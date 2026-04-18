import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { LoginUseCase } from './use-cases/login.use-case';
import { LogoutUseCase } from './use-cases/logout.use-case';
import { RefreshTokenUseCase } from './use-cases/refresh-token.use-case';
import { RevokeAllSessionsUseCase } from './use-cases/revoke-all-sessions.use-case';
import { PrismaAuthRepository } from './infrastructure/prisma-auth.repository';
import { JwtStrategy } from './infrastructure/jwt.strategy';
import { I_AUTH_REPOSITORY } from './repositories/auth.repository.interface';
import { PrismaService } from '../../prisma.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') ?? 'dev-secret',
        signOptions: { expiresIn: '15m' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    PrismaService,
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
  exports: [JwtModule, PassportModule],
})
export class AuthModule {}
