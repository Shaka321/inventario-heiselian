import { RefreshToken } from '../refresh-token.entity';
import { DomainError } from '../../errors/domain.error';

const props = {
  id: 'rt-1',
  usuarioId: 'usr-1',
  tokenHash: 'hash-token-abc123',
};

describe('RefreshToken', () => {
  it('crea un token valido', () => {
    const rt = RefreshToken.crear(props);
    expect(rt.revocado).toBe(false);
    expect(rt.estaVigente).toBe(true);
  });
  it('expira en 7 dias', () => {
    const rt = RefreshToken.crear(props);
    const diff = rt.expiraEn.getTime() - rt.creadoEn.getTime();
    const dias = diff / (1000 * 60 * 60 * 24);
    expect(dias).toBeCloseTo(7, 0);
  });
  it('se puede revocar', () => {
    const rt = RefreshToken.crear(props);
    rt.revocar();
    expect(rt.revocado).toBe(true);
    expect(rt.estaVigente).toBe(false);
  });
  it('lanza error al revocar dos veces', () => {
    const rt = RefreshToken.crear(props);
    rt.revocar();
    expect(() => rt.revocar()).toThrow(DomainError);
  });
  it('rechaza tokenHash vacio', () => {
    expect(() => RefreshToken.crear({ ...props, tokenHash: '' })).toThrow(
      DomainError,
    );
  });
  it('rechaza usuarioId vacio', () => {
    expect(() => RefreshToken.crear({ ...props, usuarioId: '' })).toThrow(
      DomainError,
    );
  });
});
