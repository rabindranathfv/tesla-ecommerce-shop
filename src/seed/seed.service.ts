import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed-data';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from 'src/auth/entities/user.entity';
import { genSaltSync, hashSync } from 'bcrypt';

@Injectable()
export class SeedService {
  constructor(
    private readonly productService: ProductsService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async runSeed() {
    await this.deleteTables();
    const adminUser = await this.insertUsers();

    await this.generateSeedProducts(adminUser);

    return `Seed execute succesfully`;
  }

  private async deleteTables() {
    await this.productService.deleteAllProducts();

    const queryBuilder = this.userRepository.createQueryBuilder();
    await queryBuilder.delete().where({}).execute();
  }

  private async insertUsers() {
    const seedUsers = initialData.users;

    const users: User[] = [];

    seedUsers.forEach((user) => {
      const hasPswd = hashSync(user.password, genSaltSync());
      user.password = hasPswd;
      users.push(this.userRepository.create(user));
    });

    const dbUsers = await this.userRepository.save(seedUsers);

    return dbUsers[0];
  }

  private async generateSeedProducts(user: User) {
    try {
      await this.productService.deleteAllProducts();

      const products = initialData.products;

      const insertDataPromises = [];

      products.map(async (product) => {
        insertDataPromises.push(
          await this.productService.create(product, user),
        );
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
