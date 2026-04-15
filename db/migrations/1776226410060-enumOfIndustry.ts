import { MigrationInterface, QueryRunner } from "typeorm";

export class EnumOfIndustry1776226410060 implements MigrationInterface {
    name = 'EnumOfIndustry1776226410060'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "industry" DROP CONSTRAINT "UQ_e756cbed5e9f27221c238f11fcc"`);
        await queryRunner.query(`ALTER TABLE "industry" DROP COLUMN "name"`);
        await queryRunner.query(`CREATE TYPE "public"."industry_name_enum" AS ENUM('Software Development', 'Artificial Intelligence & Machine Learning', 'Data Science & Big Data', 'Cybersecurity', 'Cloud Computing', 'Networking & Infrastructure', 'Embedded Systems & IoT', 'Game Development', 'UI/UX Design', 'Blockchain & FinTech', 'AR / VR (Augmented & Virtual Reality)', 'Hardware & Electronics')`);
        await queryRunner.query(`ALTER TABLE "industry" ADD "name" "public"."industry_name_enum" NOT NULL`);
        await queryRunner.query(`ALTER TABLE "industry" ADD CONSTRAINT "UQ_e756cbed5e9f27221c238f11fcc" UNIQUE ("name")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "industry" DROP CONSTRAINT "UQ_e756cbed5e9f27221c238f11fcc"`);
        await queryRunner.query(`ALTER TABLE "industry" DROP COLUMN "name"`);
        await queryRunner.query(`DROP TYPE "public"."industry_name_enum"`);
        await queryRunner.query(`ALTER TABLE "industry" ADD "name" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "industry" ADD CONSTRAINT "UQ_e756cbed5e9f27221c238f11fcc" UNIQUE ("name")`);
    }

}
