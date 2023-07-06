import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    try {
      const product = await this.productRepository.create(createProductDto);
      await this.productRepository.save(product);

      return product;
    } catch (error) {
      console.log(
        '🚀 ~ file: products.service.ts:19 ~ ProductsService ~ create ~ error:',
        error,
      );
      this.handleDBExceptions(error);
    }
  }

  async findAll() {
    try {
      const products = await this.productRepository.find();

      return products;
    } catch (error) {
      console.log(
        '🚀 ~ file: products.service.ts:38 ~ ProductsService ~ findAll ~ error:',
        error,
      );
      this.handleDBExceptions(error);
    }
  }

  async findOne(id: string) {
    try {
      const productInfo = await this.productRepository.findBy({ id });

      return productInfo;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    try {
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async remove(id: string) {
    try {
      const product = await this.findOne(id);
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
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }
    this.logger.error(error);
    throw new InternalServerErrorException(
      'something when wrong, server side error',
    );
  }
}
