import { ConteoInventario } from '../conteo-inventario.entity';
import { RolValor } from '../../value-objects/rol.vo';
import { DomainError } from '../../errors/domain.error';

const props = {
  id: 'conteo-1',
  usuarioId: 'user-1',
  rolUsuario: RolValor.DUENO,
  diferenciasJson: { 'var-1': -3, 'var-2': 5 },
};

describe('ConteoInventario', () => {
  it('crea un conteo valido para el dueno', () => {
    const c = ConteoInventario.crear(props);
    expect(c.id).toBe('conteo-1');
    expect(c.diferenciasJson).toEqual({ 'var-1': -3, 'var-2': 5 });
  });
  it('rechaza si el rol es SUPERVISOR', () => {
    expect(() =>
      ConteoInventario.crear({ ...props, rolUsuario: RolValor.SUPERVISOR }),
    ).toThrow(DomainError);
  });
  it('rechaza si el rol es EMPLEADO', () => {
    expect(() =>
      ConteoInventario.crear({ ...props, rolUsuario: RolValor.EMPLEADO }),
    ).toThrow(DomainError);
  });
  it('rechaza usuarioId vacio', () => {
    expect(() => ConteoInventario.crear({ ...props, usuarioId: '' })).toThrow(
      DomainError,
    );
  });
  it('retorna copia de diferenciasJson (inmutabilidad)', () => {
    const c = ConteoInventario.crear(props);
    const diff = c.diferenciasJson;
    diff['var-1'] = 999;
    expect(c.diferenciasJson['var-1']).toBe(-3);
  });
});
