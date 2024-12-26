import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./User";

@Entity()
export class Address extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  address: string;

  @ManyToOne(() => User, (user) => user.addresses)
  @JoinColumn()
  user: User;
}
