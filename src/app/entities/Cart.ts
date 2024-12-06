import { BaseEntity, Column, Entity, PrimaryColumn } from "typeorm";
import { CartItem } from "../types/entityTypes";

@Entity()
export class Cart extends BaseEntity {
  @PrimaryColumn({ name: "id" })
  id: string; // generate at the time of user registration using IdGenerate fn
  @Column({ name: "cartItems", type: "jsonb", default: [] })
  cartItems: CartItem[];
}
