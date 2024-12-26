import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from "typeorm";
import { Categories } from "./Categories";
import { Products } from "./Products";

@Entity()
export class Brands extends BaseEntity {
  @Column()
  id: string;

  @PrimaryColumn({ type: "text" })
  name: string;

  @PrimaryColumn({ type: "text" })
  categoryName: string;

  @ManyToOne(() => Categories, (categories) => categories.brands)
  @JoinColumn({ name: "categoryName" })
  category: Categories;

  @OneToMany(() => Products, (prod) => prod.brandObj)
  products: Products[];
}
