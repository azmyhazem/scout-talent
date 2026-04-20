import { MigrationInterface, QueryRunner } from "typeorm";

export class Update1776665076518 implements MigrationInterface {
    name = 'Update1776665076518'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "recommend-candidates" DROP CONSTRAINT "FK_93ee9ccba8125b3bdd34f392ca9"`);
        await queryRunner.query(`CREATE TYPE "public"."recommendation-batch-job_status_enum" AS ENUM('pending', 'active', 'completed', 'failed', 'retrying')`);
        await queryRunner.query(`CREATE TABLE "recommendation-batch-job" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" "public"."recommendation-batch-job_status_enum" NOT NULL DEFAULT 'pending', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "jobId" uuid, CONSTRAINT "PK_de08112efe9a6cf13a9e1927a02" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "recommend-candidates" ADD CONSTRAINT "FK_93ee9ccba8125b3bdd34f392ca9" FOREIGN KEY ("batchId") REFERENCES "recommendation-batch-job"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "recommendation-batch-job" ADD CONSTRAINT "FK_ce132b60f7996b7b6f8d0084299" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "recommendation-batch-job" DROP CONSTRAINT "FK_ce132b60f7996b7b6f8d0084299"`);
        await queryRunner.query(`ALTER TABLE "recommend-candidates" DROP CONSTRAINT "FK_93ee9ccba8125b3bdd34f392ca9"`);
        await queryRunner.query(`DROP TABLE "recommendation-batch-job"`);
        await queryRunner.query(`DROP TYPE "public"."recommendation-batch-job_status_enum"`);
        await queryRunner.query(`ALTER TABLE "recommend-candidates" ADD CONSTRAINT "FK_93ee9ccba8125b3bdd34f392ca9" FOREIGN KEY ("batchId") REFERENCES "recommendation-batch-company"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
