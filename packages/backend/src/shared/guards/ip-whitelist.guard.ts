import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';

export const IP_WHITELIST_KEY = 'ip_whitelist';
export const IpWhitelist = () =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('@nestjs/common').SetMetadata(IP_WHITELIST_KEY, true);

@Injectable()
export class IpWhitelistGuard implements CanActivate {
  private readonly logger = new Logger(IpWhitelistGuard.name);

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiresWhitelist = this.reflector.getAllAndOverride<boolean>(
      IP_WHITELIST_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiresWhitelist) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const clientIp = this.extractIp(request);

    const allowedIps = this.getAllowedIps();

    if (allowedIps.length === 0) {
      this.logger.warn('IP_WHITELIST no configurada — acceso denegado por defecto');
      throw new ForbiddenException('Acceso restringido a la red de la tienda');
    }

    if (!allowedIps.includes(clientIp)) {
      this.logger.warn(`IP bloqueada: ${clientIp}`);
      throw new ForbiddenException('Acceso restringido a la red de la tienda');
    }

    return true;
  }

  private extractIp(request: Request): string {
    const forwarded = request.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0].trim();
    }
    return request.ip ?? request.socket?.remoteAddress ?? '';
  }

  private getAllowedIps(): string[] {
    const raw = process.env['IP_WHITELIST'] ?? '';
    return raw
      .split(',')
      .map((ip) => ip.trim())
      .filter((ip) => ip.length > 0);
  }
}