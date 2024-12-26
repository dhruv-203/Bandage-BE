import { BaseEntity, Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { Brands } from "./Brands";
import { Products } from "./Products";

@Entity()
export class Categories extends BaseEntity {
  @Column()
  id: string;

  @PrimaryColumn({ type: "text" })
  name: string;

  @Column({ type: "text" })
  img: string;

  @OneToMany(() => Brands, (brands) => brands.category)
  brands: Brands[];

  @OneToMany(()=>Products, (prod)=>prod.categoryObj)
  products: Products[]
}
