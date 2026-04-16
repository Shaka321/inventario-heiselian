import { CierreCaja } from '../cierre-caja.entity';
import { DomainError } from '../../errors/domain.error';

const props = {
  id: 'cc-1',
  usuarioId: 'user-1',
  montoEsperado: 1000,
  montoReal: 950,
};

describe('CierreCaja', () => {
  it('crea un cierre valido', () => {
    const cc = CierreCaja.crear(props);
    expect(cc.montoEsperado).toBe(1000);
    expect(cc.montoReal).toBe(950);
  });
  it('calcula diferencia correctamente (montoReal - montoEsperado)', () => {
    expect(CierreCaja.crear(props).diferencia).toBe(-50);
  });
  it('detecta faltante', () => {
    expect(CierreCaja.crear(props).tieneFaltante).toBe(true);
  });
  it('detecta sobrante', () => {
    const cc = CierreCaja.crear({ ...props, montoReal: 1100 });
    expect(cc.tieneSobrante).toBe(true);
  });
  it('detecta balance correcto', () => {
    const cc = CierreCaja.crear({ ...props, montoReal: 1000 });
    expect(cc.estaBalanceado).toBe(true);
  });
  it('rechaza montoEsperado negativo', () => {
    expect(() => CierreCaja.crear({ ...props, montoEsperado: -1 })).toThrow(
      DomainError,
    );
  });
  it('rechaza montoReal negativo', () => {
    expect(() => CierreCaja.crear({ ...props, montoReal: -1 })).toThrow(
      DomainError,
    );
  });
  it('rechaza usuarioId vacio', () => {
    expect(() => CierreCaja.crear({ ...props, usuarioId: '' })).toThrow(
      DomainError,
    );
  });
});
