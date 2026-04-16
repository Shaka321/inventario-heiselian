import { Rol, RolValor } from '../rol.vo';
import { DomainError } from '../../errors/domain.error';

describe('Rol', () => {
  it('crea DUENO', () => {
    expect(Rol.crear('DUENO').valor).toBe(RolValor.DUENO);
  });
  it('acepta valores en minusculas', () => {
    expect(Rol.crear('empleado').valor).toBe(RolValor.EMPLEADO);
  });
  it('rechaza rol invalido', () => {
    expect(() => Rol.crear('ADMIN')).toThrow(DomainError);
  });
  it('rechaza rol vacio', () => {
    expect(() => Rol.crear('')).toThrow(DomainError);
  });
  it('esDueno retorna true solo para DUENO', () => {
    expect(Rol.crear('DUENO').esDueno()).toBe(true);
    expect(Rol.crear('SUPERVISOR').esDueno()).toBe(false);
  });
  it('esSupervisorOSuperior incluye DUENO y SUPERVISOR', () => {
    expect(Rol.crear('DUENO').esSupervisorOSuperior()).toBe(true);
    expect(Rol.crear('SUPERVISOR').esSupervisorOSuperior()).toBe(true);
    expect(Rol.crear('EMPLEADO').esSupervisorOSuperior()).toBe(false);
  });
});
