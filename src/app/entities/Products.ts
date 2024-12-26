import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from "typeorm";
import { Brands } from "./Brands";
import { Categories } from "./Categories";

@Entity()
export class Products extends BaseEntity {
  @PrimaryColumn()
  id: string;

  @Column({ type: "text" })
  title: string;

  @Column({ type: "text" })
  shortDescription: string;

  @Column({ type: "int" })
  discountedPrice: number;

  @Column({ type: "int" })
  originalPrice: number;

  @Column({ type: "simple-array" })
  colors: string[];

  @Column({ type: "text", name: "category" })
  category: string;

  @Column({ type: "text" })
  brand: string;

  @Column({ type: "text" })
  displayImage: string;

  @Column({ type: "decimal" })
  ratings: number;

  @Column({ type: "simple-array" })
  reviews: string[];

  @Column({ type: "text" })
  longDescription: string;

  @Column({ type: "simple-array" })
  overview: string[];

  @Column({ type: "jsonb" })
  keyFeatures: Array<{ [key: string]: string }>;

  @Column({ type: "boolean" })
  isBestseller: boolean;

  @Column({ type: "simple-array" })
  additionalImages: string[];

  @Column({ type: "text" })
  descriptionImage: string;

  @ManyToOne(() => Categories, (categoryObj) => categoryObj.products)
  @JoinColumn({
    name: "category",
    referencedColumnName: "name",
  })
  categoryObj: Categories;

  @ManyToOne(() => Brands, (brandObj) => brandObj.products)
  @JoinColumn([
    { name: "brand", referencedColumnName: "name" },
    { name: "category", referencedColumnName: "categoryName" },
  ])
  brandObj: Brands;
}
