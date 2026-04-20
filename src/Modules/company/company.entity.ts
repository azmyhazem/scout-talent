import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Job } from "../Job/job.entity";
import { Specialization } from "../specialization/specialization.entity";
import { User } from "../Users/user.entity";

@Entity("company")
export class Company {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ nullable: true })
  About: string;

  @OneToMany(() => Job, (job) => job.company)
  jobs: Job[];

  @OneToMany(() => Specialization, (sp) => sp.company)
  specialization: Specialization[];

  @OneToOne(() => User)
  @JoinColumn()
  user!: User;
}
