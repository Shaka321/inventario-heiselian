import { CryptoService } from '../crypto.service';

describe('CryptoService', () => {
  let service: CryptoService;

  beforeEach(() => {
    process.env['ENCRYPTION_KEY'] = 'a'.repeat(64);
    service = new CryptoService();
  });

  afterEach(() => {
    delete process.env['ENCRYPTION_KEY'];
  });

  it('encripta y desencripta texto correctamente', () => {
    const plaintext = 'texto secreto 123';
    const encrypted = service.encrypt(plaintext);
    expect(encrypted).not.toBe(plaintext);
    expect(service.decrypt(encrypted)).toBe(plaintext);
  });

  it('cada cifrado produce un resultado diferente (IV aleatorio)', () => {
    const plaintext = 'mismo texto';
    const enc1 = service.encrypt(plaintext);
    const enc2 = service.encrypt(plaintext);
    expect(enc1).not.toBe(enc2);
    expect(service.decrypt(enc1)).toBe(plaintext);
    expect(service.decrypt(enc2)).toBe(plaintext);
  });

  it('encripta y desencripta valores decimales', () => {
    const value = 1234.56;
    const encrypted = service.encryptDecimal(value);
    expect(service.decryptDecimal(encrypted)).toBeCloseTo(value);
  });

  it('falla al descifrar con datos corruptos', () => {
    expect(() => service.decrypt('datos-corruptos-base64')).toThrow();
  });

  it('falla al descifrar si el authTag fue modificado', () => {
    const encrypted = service.encrypt('dato original');
    const buf = Buffer.from(encrypted, 'base64');
    buf[12] ^= 0xff;
    expect(() => service.decrypt(buf.toString('base64'))).toThrow();
  });

  it('encripta precios con decimales largos correctamente', () => {
    const precio = 99999.99;
    const enc = service.encryptDecimal(precio);
    expect(service.decryptDecimal(enc)).toBeCloseTo(precio);
  });
});