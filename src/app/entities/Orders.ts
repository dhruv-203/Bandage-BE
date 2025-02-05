// Order
//id
//orderItems
//orderDate
//orderTotal
//shippingAddress
//userid manyOne

import { CartItem } from "app/types/entityTypes";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from "typeorm";
import { User } from "./User";

@Entity()
export class Orders extends BaseEntity {
  @PrimaryColumn({ type: "text" })
  id: string;

  @Column({ type: "jsonb" })
  orderItems: CartItem[];

  @CreateDateColumn()
  orderDate: Date;

  @Column({ type: "decimal" })
  orderTotal: number;

  @Column({ type: "text" })
  shippingAddress: string;

  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn({ name: "userId" })
  user: User;
}
