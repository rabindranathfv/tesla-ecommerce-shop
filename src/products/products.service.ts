import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { validate as IsUUID } from 'uuid';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

import { Product } from './entities/product.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ProductImage } from './entities/product-image.entity';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createProductDto: CreateProductDto, user: User) {
    try {
      const { images = [], ...productDetails } = createProductDto;

      const product = this.productRepository.create({
        ...productDetails,
        images: images.map((image) =>
          this.productImageRepository.create({ url: image }),
        ),
        user,
      });

      await this.productRepository.save(product);

      return { ...product, images };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    try {
      const { limit = 10, offset = 0 } = paginationDto;
      console.log(
        '🚀 ~ file: products.service.ts:54 ~ ProductsService ~ findAll ~ paginationDto:',
        paginationDto,
      );
      const products = await this.productRepository.find({
        take: limit,
        skip: offset,
        relations: {
          images: true,
        },
      });

      return products?.map((product) => ({
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
      console.log(
        '🚀 ~ file: products.service.ts:102 ~ ProductsService ~ findOne ~ productInfo:',
        productInfo,
      );

      return productInfo
        ? {
            ...productInfo,
            images: productInfo.images.map((img) => img.url),
          }
        : productInfo;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async update(pid: string, updateProductDto: UpdateProductDto, user: User) {
    const queryRunner = await this.dataSource.createQueryRunner();
    try {
      const { images, ...productUpd } = updateProductDto;

      const product = await this.productRepository.preload({
        id: pid,
        ...productUpd,
      });

      // TODO: Query runner
      await queryRunner.connect();
      await queryRunner.startTransaction();

      if (images) {
        await queryRunner.manager.delete(ProductImage, {
          product: { id: pid },
        });

        product.images = images.map((img) =>
          this.productImageRepository.create({ url: img }),
        );
      } else {
        product.images = await this.productImageRepository.findBy({
          product: { id: pid },
        });
      }

      product.user = user;
      await queryRunner.manager.save(product);
      await queryRunner.commitTransaction();
      await queryRunner.release();

      // TODO: el metodo save mantiene las operaciones en cascada onDelete, onUpdate mientras que el metodo update NO
      // const updProd = await this.productRepository.save(product);
      return product;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      this.handleDBExceptions(error);
    }
  }

  async remove(id: string) {
    // TODO: can be done using transaccion approach
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

  // TODO: this method delete all products and productImages
  async deleteAllProducts() {
    const queryBuilder = await this.productRepository.createQueryBuilder(
      'product',
    );
    try {
      return await queryBuilder.delete().where({}).execute();
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
