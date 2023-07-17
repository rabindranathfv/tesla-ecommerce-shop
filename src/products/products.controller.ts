import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  NotFoundException,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ValidRoles } from 'src/auth/interfaces/valid-roles';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Auth(ValidRoles.admin)
  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    return await this.productsService.create(createProductDto);
  }

  @Get()
  async findAll(@Query() paginationDto: PaginationDto) {
    return await this.productsService.findAll(paginationDto);
  }

  @Auth(ValidRoles.user)
  @Get(':criteria')
  async findOne(@Param('criteria') criteria: string) {
    const product = await this.productsService.findOne(criteria);
    if (!product) {
      throw new NotFoundException(
        `finding product with ${criteria} doesn't exist`,
      );
    }

    return product;
  }

  @Auth(ValidRoles.admin)
  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  @Auth(ValidRoles.admin)
  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const deletedProd = await this.productsService.remove(id);

    if (!deletedProd) {
      throw new NotFoundException(`product ${id} doesn't exist`);
    }

    return `product ${id} deleted`;
  }

  @Auth(ValidRoles.admin)
  @Delete()
  async removeAll() {
    const deletedProd = await this.productsService.deleteAllProducts();

    if (!deletedProd) {
      throw new NotFoundException(`can not delete all products`);
    }

    return `all products had been deleted`;
  }
}
