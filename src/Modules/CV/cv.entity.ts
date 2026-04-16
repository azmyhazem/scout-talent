import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { JobApplicant } from "../application/job_applicant.entity";
import { Applicant } from "../applicant/applicant.entity";
import { StatusAI } from "src/Shared/Enums/statusAI.enum";

@Entity({ name: "CV" })
export class CV {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column()
  url: string;

  @Column({
    type: "enum",
    enum: StatusAI,
    default: StatusAI.PENDING,
  })
  status: StatusAI;

  @Column({nullable:true})
  asset_id: string

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @ManyToOne(() => Applicant, (user) => user.cvs)
  applicant: Applicant;

  @OneToMany(() => JobApplicant, (app) => app.cv)
  applications: JobApplicant[];
}
