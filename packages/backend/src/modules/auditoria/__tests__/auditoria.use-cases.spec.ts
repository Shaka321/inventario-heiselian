/* eslint-disable @typescript-eslint/unbound-method */
import { GetAuditLogUseCase } from '../use-cases/get-audit-log.use-case';
import { ExportAuditLogUseCase } from '../use-cases/export-audit-log.use-case';
import { VerifyChecksumsUseCase } from '../use-cases/verify-checksums.use-case';
import {
  IAuditoriaRepository,
  AuditLogEntry,
} from '../repositories/auditoria.repository.interface';
import * as crypto from 'crypto';

const HMAC_SECRET =
  process.env.AUDIT_HMAC_SECRET ?? 'default-secret-change-in-production';

const generarChecksum = (r: AuditLogEntry): string => {
  const data = `${r.entidad}:${r.entidadId}:${r.accion}:${r.usuarioId}:${JSON.stringify(r.payload)}:${r.creadoEn.toISOString()}`;
  return crypto.createHmac('sha256', HMAC_SECRET).update(data).digest('hex');
};

const fechaFija = new Date('2025-01-15T10:00:00.000Z');

const mockEntry: AuditLogEntry = {
  id: 'audit-1',
  entidad: 'Venta',
  entidadId: 'venta-1',
  accion: 'CREAR_VENTA',
  usuarioId: 'usr-1',
  payload: { total: 150 },
  checksum: '',
  creadoEn: fechaFija,
};

mockEntry.checksum = generarChecksum(mockEntry);

const mockRepo: jest.Mocked<IAuditoriaRepository> = {
  listar: jest.fn(),
  findById: jest.fn(),
  exportarCSV: jest.fn(),
  findAll: jest.fn(),
};

// -- GetAuditLogUseCase ----------------------------------------------------
describe('GetAuditLogUseCase', () => {
  let useCase: GetAuditLogUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new GetAuditLogUseCase(mockRepo);
  });

  it('retorna listado paginado de audit logs', async () => {
    mockRepo.listar.mockResolvedValue({ data: [mockEntry], total: 1 });

    const result = await useCase.execute({ page: 1, limit: 50 });

    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.totalPages).toBe(1);
  });

  it('calcula totalPages correctamente para multiples paginas', async () => {
    mockRepo.listar.mockResolvedValue({ data: [], total: 110 });

    const result = await useCase.execute({ page: 1, limit: 50 });

    expect(result.totalPages).toBe(3);
  });

  it('filtra por entidad cuando se provee', async () => {
    mockRepo.listar.mockResolvedValue({ data: [], total: 0 });

    await useCase.execute({ entidad: 'Venta', page: 1, limit: 50 });

    expect(mockRepo.listar).toHaveBeenCalledWith(
      expect.objectContaining({ entidad: 'Venta' }),
    );
  });

  it('filtra por accion cuando se provee', async () => {
    mockRepo.listar.mockResolvedValue({ data: [], total: 0 });

    await useCase.execute({ accion: 'CREAR_VENTA', page: 1, limit: 50 });

    expect(mockRepo.listar).toHaveBeenCalledWith(
      expect.objectContaining({ accion: 'CREAR_VENTA' }),
    );
  });

  it('convierte fechas string a Date al filtrar', async () => {
    mockRepo.listar.mockResolvedValue({ data: [], total: 0 });

    await useCase.execute({
      desde: '2025-01-01',
      hasta: '2025-01-31',
      page: 1,
      limit: 50,
    });

    expect(mockRepo.listar).toHaveBeenCalledWith(
      expect.objectContaining({
        desde: new Date('2025-01-01'),
        hasta: new Date('2025-01-31'),
      }),
    );
  });
});

// -- ExportAuditLogUseCase -------------------------------------------------
describe('ExportAuditLogUseCase', () => {
  let useCase: ExportAuditLogUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new ExportAuditLogUseCase(mockRepo);
  });

  it('genera CSV con cabecera correcta', async () => {
    mockRepo.exportarCSV.mockResolvedValue([mockEntry]);

    const csv = await useCase.execute({});

    const lineas = csv.split('\n');
    expect(lineas[0]).toBe(
      'id,entidad,entidadId,accion,usuarioId,checksum,creadoEn',
    );
  });

  it('genera CSV con datos correctos en la segunda linea', async () => {
    mockRepo.exportarCSV.mockResolvedValue([mockEntry]);

    const csv = await useCase.execute({});

    const lineas = csv.split('\n');
    expect(lineas[1]).toContain('audit-1');
    expect(lineas[1]).toContain('Venta');
    expect(lineas[1]).toContain('CREAR_VENTA');
  });

  it('genera CSV vacio con solo cabecera si no hay registros', async () => {
    mockRepo.exportarCSV.mockResolvedValue([]);

    const csv = await useCase.execute({});

    const lineas = csv.split('\n');
    expect(lineas).toHaveLength(1);
    expect(lineas[0]).toContain('id,entidad');
  });

  it('escapa correctamente valores con comas', async () => {
    const entryConComa: AuditLogEntry = {
      ...mockEntry,
      accion: 'ACCION,CON,COMAS',
    };
    mockRepo.exportarCSV.mockResolvedValue([entryConComa]);

    const csv = await useCase.execute({});

    expect(csv).toContain('"ACCION,CON,COMAS"');
  });
});

// -- VerifyChecksumsUseCase ------------------------------------------------
describe('VerifyChecksumsUseCase', () => {
  let useCase: VerifyChecksumsUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new VerifyChecksumsUseCase(mockRepo);
  });

  it('reporta integridad ok cuando todos los checksums son validos', async () => {
    mockRepo.findAll.mockResolvedValue([mockEntry]);

    const result = await useCase.execute();

    expect(result.integridadOk).toBe(true);
    expect(result.invalidos).toBe(0);
    expect(result.validos).toBe(1);
    expect(result.registrosCorruptos).toHaveLength(0);
  });

  it('detecta registro corrupto cuando el checksum no coincide', async () => {
    const entryCorrupta: AuditLogEntry = {
      ...mockEntry,
      checksum: 'checksum-falso-manipulado',
    };
    mockRepo.findAll.mockResolvedValue([entryCorrupta]);

    const result = await useCase.execute();

    expect(result.integridadOk).toBe(false);
    expect(result.invalidos).toBe(1);
    expect(result.registrosCorruptos[0].id).toBe('audit-1');
  });

  it('reporta correctamente cuando hay mix de validos e invalidos', async () => {
    const entryCorrupta: AuditLogEntry = {
      ...mockEntry,
      id: 'audit-2',
      checksum: 'corrupto',
    };
    mockRepo.findAll.mockResolvedValue([mockEntry, entryCorrupta]);

    const result = await useCase.execute();

    expect(result.total).toBe(2);
    expect(result.validos).toBe(1);
    expect(result.invalidos).toBe(1);
    expect(result.integridadOk).toBe(false);
  });

  it('retorna integridad ok con lista vacia', async () => {
    mockRepo.findAll.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(result.integridadOk).toBe(true);
    expect(result.total).toBe(0);
  });
});

