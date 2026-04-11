import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { JobApplicant } from "./job_applicant.entity";
import { OfferStatus } from "src/Shared/Enums/offerStatus.enum";

@Entity("jobOffer")
export class JobOffer {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  offeredSalary: string;

  @Column({ type: "timestamptz" })
  startDate: Date;

  @Column({ nullable: true })
  notes: string;

  @Column({ type: "timestamptz" })
  expiresAt: Date;

  @Column({ type: "timestamptz", nullable: true })
  respondedAt: Date;

  @Column({
    type: "enum",
    enum: OfferStatus,
    default: OfferStatus.PENDING,
  })
  status: OfferStatus;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @OneToOne(() => JobApplicant)
  @JoinColumn()
  application: JobApplicant;
}
