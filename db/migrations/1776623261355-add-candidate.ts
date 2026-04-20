import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCandidate1776623261355 implements MigrationInterface {
    name = 'AddCandidate1776623261355'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "recommend-jobs" DROP CONSTRAINT "FK_406b6232d41c2503df1de5f2575"`);
        await queryRunner.query(`CREATE TABLE "recommend-candidates" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "batchId" uuid, "applicantId" uuid, CONSTRAINT "PK_8fcbaf8f9024cf53d1d366629ca" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."recommendation-batch-company_status_enum" AS ENUM('pending', 'active', 'completed', 'failed', 'retrying')`);
        await queryRunner.query(`CREATE TABLE "recommendation-batch-company" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" "public"."recommendation-batch-company_status_enum" NOT NULL DEFAULT 'pending', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "companyId" uuid, CONSTRAINT "PK_d0bdcbf09946422c2901853512e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."recommendation-batch-cv_status_enum" AS ENUM('pending', 'active', 'completed', 'failed', 'retrying')`);
        await queryRunner.query(`CREATE TABLE "recommendation-batch-cv" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" "public"."recommendation-batch-cv_status_enum" NOT NULL DEFAULT 'pending', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "cvId" uuid, CONSTRAINT "PK_2635f5d438f0723e89e04cb4a5f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "recommend-candidates" ADD CONSTRAINT "FK_93ee9ccba8125b3bdd34f392ca9" FOREIGN KEY ("batchId") REFERENCES "recommendation-batch-company"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "recommend-candidates" ADD CONSTRAINT "FK_c3f3d8bfd1753dbae27f72b2bcf" FOREIGN KEY ("applicantId") REFERENCES "applicant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "recommendation-batch-company" ADD CONSTRAINT "FK_b16222515df6013aa791d607da6" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "recommendation-batch-cv" ADD CONSTRAINT "FK_7b494f3ce9f1bd42da9639a48d8" FOREIGN KEY ("cvId") REFERENCES "CV"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "recommend-jobs" ADD CONSTRAINT "FK_406b6232d41c2503df1de5f2575" FOREIGN KEY ("batchId") REFERENCES "recommendation-batch-cv"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "recommend-jobs" DROP CONSTRAINT "FK_406b6232d41c2503df1de5f2575"`);
        await queryRunner.query(`ALTER TABLE "recommendation-batch-cv" DROP CONSTRAINT "FK_7b494f3ce9f1bd42da9639a48d8"`);
        await queryRunner.query(`ALTER TABLE "recommendation-batch-company" DROP CONSTRAINT "FK_b16222515df6013aa791d607da6"`);
        await queryRunner.query(`ALTER TABLE "recommend-candidates" DROP CONSTRAINT "FK_c3f3d8bfd1753dbae27f72b2bcf"`);
        await queryRunner.query(`ALTER TABLE "recommend-candidates" DROP CONSTRAINT "FK_93ee9ccba8125b3bdd34f392ca9"`);
        await queryRunner.query(`DROP TABLE "recommendation-batch-cv"`);
        await queryRunner.query(`DROP TYPE "public"."recommendation-batch-cv_status_enum"`);
        await queryRunner.query(`DROP TABLE "recommendation-batch-company"`);
        await queryRunner.query(`DROP TYPE "public"."recommendation-batch-company_status_enum"`);
        await queryRunner.query(`DROP TABLE "recommend-candidates"`);
        await queryRunner.query(`ALTER TABLE "recommend-jobs" ADD CONSTRAINT "FK_406b6232d41c2503df1de5f2575" FOREIGN KEY ("batchId") REFERENCES "recommendation-batch"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
