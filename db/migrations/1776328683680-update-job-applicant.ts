import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateJobApplicant1776328683680 implements MigrationInterface {
    name = 'UpdateJobApplicant1776328683680'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."job_applicant_statusai_enum" AS ENUM('pending', 'active', 'completed', 'failed', 'retrying')`);
        await queryRunner.query(`ALTER TABLE "job_applicant" ADD "statusAi" "public"."job_applicant_statusai_enum" NOT NULL DEFAULT 'pending'`);
        await queryRunner.query(`ALTER TABLE "job_applicant" ADD "result" json`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "job_applicant" DROP COLUMN "result"`);
        await queryRunner.query(`ALTER TABLE "job_applicant" DROP COLUMN "statusAi"`);
        await queryRunner.query(`DROP TYPE "public"."job_applicant_statusai_enum"`);
    }

}
