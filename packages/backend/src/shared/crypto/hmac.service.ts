import { Injectable, Logger } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'crypto';

@Injectable()
export class HmacService {
  private readonly logger = new Logger(HmacService.name);
  private readonly secret: string;

  constructor() {
    this.secret = process.env['AUDIT_HMAC_SECRET'] ?? 'dev-hmac-secret';
    if (this.secret === 'dev-hmac-secret') {
      this.logger.warn('AUDIT_HMAC_SECRET no configurado — usando secreto de desarrollo');
    }
  }

  generate(payload: Record<string, unknown>): string {
    const data = JSON.stringify(payload, Object.keys(payload).sort());
    return createHmac('sha256', this.secret).update(data).digest('hex');
  }

  verify(payload: Record<string, unknown>, checksum: string): boolean {
    const expected = this.generate(payload);
    try {
      return timingSafeEqual(
        Buffer.from(expected, 'hex'),
        Buffer.from(checksum, 'hex'),
      );
    } catch {
      return false;
    }
  }
}