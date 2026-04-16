import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateCvApplicantJob1776320152868 implements MigrationInterface {
    name = 'UpdateCvApplicantJob1776320152868'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."jobs_seniority_enum" AS ENUM('Fresh', 'Junior', 'Mid-Level', 'Senior', 'Lead')`);
        await queryRunner.query(`ALTER TABLE "jobs" ADD "seniority" "public"."jobs_seniority_enum" NOT NULL`);
        await queryRunner.query(`ALTER TABLE "jobs" ADD "jobIdAi" character varying`);
        await queryRunner.query(`CREATE TYPE "public"."jobs_statusai_enum" AS ENUM('pending', 'active', 'completed', 'failed', 'retrying')`);
        await queryRunner.query(`ALTER TABLE "jobs" ADD "statusAi" "public"."jobs_statusai_enum" NOT NULL DEFAULT 'pending'`);
        await queryRunner.query(`CREATE TYPE "public"."CV_status_enum" AS ENUM('pending', 'active', 'completed', 'failed', 'retrying')`);
        await queryRunner.query(`ALTER TABLE "CV" ADD "status" "public"."CV_status_enum" NOT NULL DEFAULT 'pending'`);
        await queryRunner.query(`ALTER TABLE "CV" ADD "asset_id" character varying`);
        await queryRunner.query(`ALTER TABLE "industry" ADD "projectId" integer NOT NULL DEFAULT '20261'`);
        await queryRunner.query(`ALTER TABLE "applicant" ADD "candidateId" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "applicant" DROP COLUMN "candidateId"`);
        await queryRunner.query(`ALTER TABLE "industry" DROP COLUMN "projectId"`);
        await queryRunner.query(`ALTER TABLE "CV" DROP COLUMN "asset_id"`);
        await queryRunner.query(`ALTER TABLE "CV" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."CV_status_enum"`);
        await queryRunner.query(`ALTER TABLE "jobs" DROP COLUMN "statusAi"`);
        await queryRunner.query(`DROP TYPE "public"."jobs_statusai_enum"`);
        await queryRunner.query(`ALTER TABLE "jobs" DROP COLUMN "jobIdAi"`);
        await queryRunner.query(`ALTER TABLE "jobs" DROP COLUMN "seniority"`);
        await queryRunner.query(`DROP TYPE "public"."jobs_seniority_enum"`);
    }

}
