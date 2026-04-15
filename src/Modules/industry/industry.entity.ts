import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { IndustryName } from "../../Shared/Enums/industry.enum";
import { Applicant } from "../applicant/applicant.entity";

@Entity({ name: "industry" })
export class Industry {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true, type: "enum", enum: IndustryName })
  name: IndustryName;

  @OneToMany(() => Applicant, (app) => app.industry)
  applicant: Applicant[];
}
