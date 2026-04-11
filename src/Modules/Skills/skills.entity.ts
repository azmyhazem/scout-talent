import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
} from "typeorm";
import { Applicant } from "../applicant/applicant.entity";

@Entity({ name: "skills" })
export class Skill {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @CreateDateColumn({ type: "timestamptz"})
  createdAt: Date;

  @ManyToOne(() => Applicant, (app) => app.skills )
  applicant: Applicant;
}
