import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Company } from "../company/company.entity";

@Entity({ name: "specialization" })
export class Specialization {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @ManyToOne(()=>Company , (com)=>com.specialization)
  company!:Company
}
