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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ValidRoles } from 'src/auth/interfaces/valid-roles';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/auth/entities/user.entity';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Auth()
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a product' })
  @ApiResponse({ status: 201, description: 'Product created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @Body() createProductDto: CreateProductDto,
    @GetUser() user: User,
  ) {
    return await this.productsService.create(createProductDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products (paginated)' })
  @ApiResponse({ status: 200, description: 'List of products' })
  async findAll(@Query() paginationDto: PaginationDto) {
    return await this.productsService.findAll(paginationDto);
  }

  @Auth(ValidRoles.user, ValidRoles.admin)
  @Get(':criteria')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Find a product by id, title or slug' })
  @ApiResponse({ status: 200, description: 'Product found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Product not found' })
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
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a product' })
  @ApiResponse({ status: 200, description: 'Product updated' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
    @GetUser() user: User,
  ) {
    return this.productsService.update(id, updateProductDto, user);
  }

  @Auth(ValidRoles.admin)
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a product by id' })
  @ApiResponse({ status: 200, description: 'Product deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const deletedProd = await this.productsService.remove(id);

    if (!deletedProd) {
      throw new NotFoundException(`product ${id} doesn't exist`);
    }

    return `product ${id} deleted`;
  }

  @Auth(ValidRoles.admin)
  @Delete()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete all products' })
  @ApiResponse({ status: 200, description: 'All products deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async removeAll() {
    const deletedProd = await this.productsService.deleteAllProducts();

    if (!deletedProd) {
      throw new NotFoundException(`can not delete all products`);
    }

    return `all products had been deleted`;
  }
}
