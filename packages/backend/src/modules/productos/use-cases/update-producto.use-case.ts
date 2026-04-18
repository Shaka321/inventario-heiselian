import {
  Inject,
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import type { IProductoRepository } from '../repositories/producto.repository.interface';
import { I_PRODUCTO_REPOSITORY } from '../repositories/producto.repository.interface';
import type { ICategoriaRepository } from '../../categorias/repositories/categoria.repository.interface';
import { I_CATEGORIA_REPOSITORY } from '../../categorias/repositories/categoria.repository.interface';
import { UpdateProductoDto } from '../dtos';

@Injectable()
export class UpdateProductoUseCase {
  constructor(
    @Inject(I_PRODUCTO_REPOSITORY)
    private readonly productoRepo: IProductoRepository,
    @Inject(I_CATEGORIA_REPOSITORY)
    private readonly categoriaRepo: ICategoriaRepository,
  ) {}

  async execute(id: string, dto: UpdateProductoDto): Promise<void> {
    const producto = await this.productoRepo.findById(id);
    if (!producto || !producto.activo) {
      throw new NotFoundException('Producto no encontrado');
    }

    if (dto.categoriaId) {
      const categoria = await this.categoriaRepo.findById(dto.categoriaId);
      if (!categoria || !categoria.activo) {
        throw new NotFoundException('Categoria no encontrada o inactiva');
      }
    }

    if (dto.nombre) {
      const categoriaId = dto.categoriaId ?? producto.categoriaId;
      const existente = await this.productoRepo.findByNombre(
        dto.nombre,
        categoriaId,
      );
      if (existente && existente.id !== id) {
        throw new ConflictException(
          'Ya existe un producto con ese nombre en esta categoria',
        );
      }
    }

    await this.productoRepo.update(id, dto);
  }
}
