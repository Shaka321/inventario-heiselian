export interface ICategoria {
  id: string;
  nombre: string;
  activo: boolean;
  creadoEn: Date;
}

export interface ICategoriaRepository {
  findById(id: string): Promise<ICategoria | null>;
  findByNombre(nombre: string): Promise<ICategoria | null>;
  save(categoria: ICategoria): Promise<void>;
  update(id: string, data: { nombre?: string; activo?: boolean }): Promise<void>;
  findAll(soloActivas?: boolean): Promise<ICategoria[]>;
}

export const I_CATEGORIA_REPOSITORY = Symbol('ICategoriaRepository');
