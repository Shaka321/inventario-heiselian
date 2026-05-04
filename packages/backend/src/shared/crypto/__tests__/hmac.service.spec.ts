import { HmacService } from '../hmac.service';

describe('HmacService', () => {
  let service: HmacService;

  beforeEach(() => {
    process.env['AUDIT_HMAC_SECRET'] = 'test-secret-for-unit-tests';
    service = new HmacService();
  });

  afterEach(() => {
    delete process.env['AUDIT_HMAC_SECRET'];
  });

  it('genera un checksum HMAC-SHA256 de 64 caracteres hex', () => {
    const checksum = service.generate({ id: '1', evento: 'VENTA_CREADA' });
    expect(checksum).toHaveLength(64);
    expect(checksum).toMatch(/^[0-9a-f]{64}$/);
  });

  it('verifica correctamente un checksum valido', () => {
    const payload = { id: '1', evento: 'VENTA_CREADA', monto: 100 };
    const checksum = service.generate(payload);
    expect(service.verify(payload, checksum)).toBe(true);
  });

  it('rechaza checksum modificado (tamper detection)', () => {
    const payload = { id: '1', evento: 'VENTA_CREADA' };
    const checksum = service.generate(payload);
    const tampered = checksum.slice(0, -1) + (checksum.endsWith('a') ? 'b' : 'a');
    expect(service.verify(payload, tampered)).toBe(false);
  });

  it('rechaza si el payload fue modificado', () => {
    const original = { id: '1', evento: 'VENTA_CREADA', monto: 100 };
    const checksum = service.generate(original);
    const modified = { id: '1', evento: 'VENTA_CREADA', monto: 999 };
    expect(service.verify(modified, checksum)).toBe(false);
  });

  it('genera checksums diferentes para payloads diferentes', () => {
    const c1 = service.generate({ evento: 'LOGIN' });
    const c2 = service.generate({ evento: 'LOGOUT' });
    expect(c1).not.toBe(c2);
  });

  it('el orden de las claves del payload no afecta el checksum', () => {
    const c1 = service.generate({ id: '1', evento: 'LOGIN' });
    const c2 = service.generate({ evento: 'LOGIN', id: '1' });
    expect(c1).toBe(c2);
  });

  it('rechaza checksum con longitud incorrecta', () => {
    const payload = { id: '1' };
    expect(service.verify(payload, 'checksum-corto')).toBe(false);
  });
});