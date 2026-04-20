import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { IndustryName } from "../../Shared/Enums/industry.enum";
import { Applicant } from "../applicant/applicant.entity";
import { Job } from "../Job/job.entity";

@Entity({ name: "industry" })
export class Industry {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true, type: "enum", enum: IndustryName })
  name: IndustryName;

  @Column({ default: 20261 })
  projectId: number;

  @OneToMany(() => Applicant, (app) => app.industry)
  applicant: Applicant[];

  @OneToMany(() => Job, (job) => job.industry)
  job: Job[];
}
