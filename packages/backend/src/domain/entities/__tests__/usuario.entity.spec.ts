import { Usuario } from '../usuario.entity';
import { RolValor } from '../../value-objects/rol.vo';
import { DomainError } from '../../errors/domain.error';

const props = {
  id: 'usr-1',
  email: 'dueno@tienda.com',
  rol: 'DUENO',
  passwordHash: 'hash-seguro-abc',
};

describe('Usuario', () => {
  it('crea un usuario valido', () => {
    const u = Usuario.crear(props);
    expect(u.email.valor).toBe('dueno@tienda.com');
    expect(u.rol.valor).toBe(RolValor.DUENO);
    expect(u.activo).toBe(true);
  });
  it('esDueno retorna true para DUENO', () => {
    expect(Usuario.crear(props).esDueno).toBe(true);
  });
  it('esDueno retorna false para EMPLEADO', () => {
    expect(Usuario.crear({ ...props, rol: 'EMPLEADO' }).esDueno).toBe(false);
  });
  it('rechaza email invalido', () => {
    expect(() => Usuario.crear({ ...props, email: 'no-es-email' })).toThrow(
      DomainError,
    );
  });
  it('rechaza rol invalido', () => {
    expect(() => Usuario.crear({ ...props, rol: 'ADMIN' })).toThrow(
      DomainError,
    );
  });
  it('rechaza passwordHash vacio', () => {
    expect(() => Usuario.crear({ ...props, passwordHash: '' })).toThrow(
      DomainError,
    );
  });
  it('desactiva un usuario activo', () => {
    const u = Usuario.crear(props);
    u.desactivar();
    expect(u.activo).toBe(false);
  });
  it('lanza error al desactivar dos veces', () => {
    const u = Usuario.crear(props);
    u.desactivar();
    expect(() => u.desactivar()).toThrow(DomainError);
  });
});
