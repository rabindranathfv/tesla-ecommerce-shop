import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  BeforeUpdate,
  OneToMany,
} from 'typeorm';
import { ProductImage } from './product-image.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { unique: true })
  title: string;

  @Column('float', { default: 0 })
  price: number;

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string;

  @Column({ type: 'text', unique: true })
  slug: string;

  @Column({
    type: 'int',
    default: 0,
  })
  stock: number;

  @Column('text', { array: true })
  sizes: string[];

  @Column('text')
  gender: string;

  @Column('text', {
    array: true,
    default: [],
  })
  tags: string[];

  @OneToMany(() => ProductImage, (productImage) => productImage.product, {
    cascade: true,
    eager: true,
  })
  images?: ProductImage[];

  @BeforeInsert()
  checkSlug() {
    if (!this.slug) {
      this.slug = this.title.toLowerCase().trim();
    }
    this.slug = this.slug.replaceAll(' ', '_').replaceAll("'", '');
  }

  @BeforeUpdate()
  checkUpdSlug() {
    this.slug = this.slug
      .toLowerCase()
      .trim()
      .replaceAll(' ', '_')
      .replaceAll("'", '');
  }
}
