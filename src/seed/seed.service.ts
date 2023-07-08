import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed-data';

@Injectable()
export class SeedService {
  constructor(private readonly productService: ProductsService) {}

  async runSeed() {
    await this.generateSeedProducts();
    return `Seed execute succesfully`;
  }

  private async generateSeedProducts() {
    try {
      await this.productService.deleteAllProducts();

      const products = initialData.products;

      const insertDataPromises = [];

      products.map(async (product) => {
        insertDataPromises.push(await this.productService.create(product));
      });

      await Promise.all(insertDataPromises);
    } catch (error) {
      console.log(
        '🚀 ~ file: seed.service.ts:17 ~ SeedService ~ generateSeedProducts ~ error:',
        error,
      );
    }
  }
}
