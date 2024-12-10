import bcrypt from "bcrypt";
import { IsEmail, IsNotEmpty, MinLength } from "class-validator";
import jwt, { JwtPayload } from "jsonwebtoken";
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
} from "typeorm";
import { Cart } from "./Cart";

@Entity()
export class User extends BaseEntity {
  @PrimaryColumn()
  id: string; // use IdGenerate function from utils at the register route

  @IsNotEmpty({ message: "Name is Required" })
  @MinLength(3, { message: "Name is too short" })
  @Column({ name: "name", type: "text" })
  name: string; //from the fronttend

  @IsNotEmpty({ message: "Email is Required" })
  @IsEmail()
  @Column({ name: "email", type: "text" })
  email: string; //from the frontend

  @IsNotEmpty({ message: "Password is Required" })
  @Column({ name: "password", type: "text" })
  password: string; // store the hash value at the time of registration

  @OneToOne(() => Cart, { cascade: true })
  @JoinColumn({ name: "cartID" })
  cart: Cart; // use a one-to-one relation with Cart entity

  @Column({ name: "profilePhoto" })
  profilePhoto: string; // from the frontend

  @Column({ name: "refreshToken", nullable: true })
  refreshToken: string | null;

  async checkPassword(password: string) {
    return await bcrypt.compare(password, this.password);
  }

  async generateAccessToken() {
    return jwt.sign(
      {
        id: this.id,
      } as JwtPayload,
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
      }
    );
  }

  async generateRefreshToken() {
    return jwt.sign(
      {
        id: this.id,
      } as JwtPayload,
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
      }
    );
  }
}
