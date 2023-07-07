import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { validate as IsUUID } from 'uuid';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

import { Product } from './entities/product.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ProductImage } from './entities/product-image.entity';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    try {
      const { images = [] } = createProductDto;
      const product = await this.productRepository.create({
        ...createProductDto,
        images: images.map((img) =>
          this.productImageRepository.create({ url: img }),
        ),
      });
      await this.productRepository.save(product);

      return { ...product, images };
    } catch (error) {
      console.log(
        '🚀 ~ file: products.service.ts:19 ~ ProductsService ~ create ~ error:',
        error,
      );
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    try {
      const { limit = 10, offset = 0 } = paginationDto;
      const products = await this.productRepository.find({
        take: limit,
        skip: offset,
        relations: {
          images: true,
        },
      });

      return products.map((product) => ({
        ...product,
        images: product.images.map((img) => img.url),
      }));
    } catch (error) {
      console.log(
        '🚀 ~ file: products.service.ts:38 ~ ProductsService ~ findAll ~ error:',
        error,
      );
      this.handleDBExceptions(error);
    }
  }

  async findOne(criteria: string) {
    try {
      let productInfo: Product;

      if (IsUUID(criteria)) {
        // using relations in findOneMethod
        // productInfo = await this.productRepository.findOne({
        //   where: { id: criteria },
        //   relations: { images: true },
        // });
        productInfo = await this.productRepository.findOneBy({ id: criteria }); // con el eager true trae las relaciones
      } else {
        const queryBuilder = await this.productRepository.createQueryBuilder(
          'product',
        );
        //TODO: Busqueda por titulo transformado a minusculas, buscar usando el operador LIKE para el titulo y el slug conteniendo el string buscado
        productInfo = await queryBuilder
          .where(
            'LOWER(title) =:title or LOWER(title) LIKE :titleReg or slug =:slug or slug LIKE :slugReg',
            {
              title: criteria.toLowerCase(),
              titleReg: `%${criteria.toLowerCase()}%`,
              slug: criteria,
              slugReg: `%${criteria}%`,
            },
          )
          .leftJoinAndSelect('product.images', 'productImages')
          .getOne();
      }

      return {
        ...productInfo,
        images: productInfo.images.map((img) => img.url),
      };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    try {
      const product = await this.productRepository.preload({
        id: id,
        ...updateProductDto,
        images: [],
      });

      // TODO: el metodo save mantiene las operaciones en cascada onDelete, onUpdate mientras que el metodo update NO
      const updProd = await this.productRepository.save(product);

      return updProd;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async remove(id: string) {
    try {
      const product = await this.productRepository.findOneBy({ id });
      const deleteProd = await this.productRepository.remove(product);
      console.log(
        '🚀 ~ file: products.service.ts:71 ~ ProductsService ~ remove ~ deleteProd:',
        deleteProd,
      );

      return deleteProd;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  private handleDBExceptions(error: any) {
    console.log(
      '🚀 ~ file: products.service.ts:103 ~ ProductsService ~ handleDBExceptions ~ error:',
      error,
    );
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }
    this.logger.error(error);
    throw new InternalServerErrorException(
      'something when wrong, server side error',
    );
  }
}
