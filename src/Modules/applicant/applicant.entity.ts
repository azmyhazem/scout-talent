import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "../Users/user.entity";
import { CV } from "../CV/cv.entity";
import { JobApplicant } from "../application/job_applicant.entity";
import { Skill } from "../Skills/skills.entity";
import { Experience } from "../Experience/experience.entity";
import { Industry } from "../industry/industry.entity";

@Entity("applicant")
export class Applicant {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ nullable: true })
  phone!: string;

  @Column({ nullable: true })
  job_title!: string;

  @OneToOne(() => User)
  @JoinColumn()
  user!: User;

  @ManyToOne(() => Industry, (ind) => ind.applicant)
  industry!: Industry;

  @OneToMany(() => CV, (cv) => cv.applicant)
  cvs!: CV[];

  @OneToMany(() => JobApplicant, (app) => app.applicant)
  Applicantion!: JobApplicant[];

  @OneToMany(() => Skill, (s) => s.applicant)
  skills!: Skill[];

  @OneToMany(() => Experience, (ex) => ex.applicant)
  experiences!: Experience[];
}
