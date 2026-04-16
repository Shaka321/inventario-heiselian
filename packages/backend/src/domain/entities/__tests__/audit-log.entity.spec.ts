import { AuditLog, TipoEvento } from '../audit-log.entity';
import { DomainError } from '../../errors/domain.error';

const SECRET = 'mi-secret-hmac-super-seguro';
const props = {
  id: 'log-1',
  tipoEvento: 'VENTA_CREADA',
  usuarioId: 'usr-1',
  payload: { ventaId: 'venta-1', total: 100 },
};

describe('AuditLog', () => {
  it('crea un audit log valido con checksum', () => {
    const log = AuditLog.crear(props, SECRET);
    expect(log.tipoEvento).toBe(TipoEvento.VENTA_CREADA);
    expect(log.checksum).toBeTruthy();
    expect(log.checksum.length).toBe(64);
  });
  it('verifica integridad correctamente', () => {
    const log = AuditLog.crear(props, SECRET);
    expect(log.verificarIntegridad(SECRET)).toBe(true);
  });
  it('falla verificacion con secret incorrecto', () => {
    const log = AuditLog.crear(props, SECRET);
    expect(log.verificarIntegridad('secret-incorrecto')).toBe(false);
  });
  it('acepta tipoEvento en minusculas', () => {
    const log = AuditLog.crear({ ...props, tipoEvento: 'venta_creada' }, SECRET);
    expect(log.tipoEvento).toBe(TipoEvento.VENTA_CREADA);
  });
  it('rechaza tipoEvento invalido', () => {
    expect(() => AuditLog.crear({ ...props, tipoEvento: 'EVENTO_FALSO' }, SECRET)).toThrow(DomainError);
  });
  it('rechaza secret vacio', () => {
    expect(() => AuditLog.crear(props, '')).toThrow(DomainError);
  });
  it('rechaza usuarioId vacio', () => {
    expect(() => AuditLog.crear({ ...props, usuarioId: '' }, SECRET)).toThrow(DomainError);
  });
  it('payload es inmutable (retorna copia)', () => {
    const log = AuditLog.crear(props, SECRET);
    const p = log.payload;
    p['ventaId'] = 'modificado';
    expect(log.payload['ventaId']).toBe('venta-1');
  });
  it('dos logs del mismo evento tienen checksums distintos (timestamps diferentes)', async () => {
    const log1 = AuditLog.crear(props, SECRET);
    await new Promise(r => setTimeout(r, 10));
    const log2 = AuditLog.crear({ ...props, id: 'log-2' }, SECRET);
    expect(log1.checksum).not.toBe(log2.checksum);
  });
});
