import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCvAi1776265358212 implements MigrationInterface {
    name = 'AddCvAi1776265358212'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."cv-ai_status_enum" AS ENUM('pending', 'active', 'completed', 'failed', 'retrying')`);
        await queryRunner.query(`CREATE TABLE "cv-ai" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "ai_id" character varying, "status" "public"."cv-ai_status_enum" NOT NULL DEFAULT 'pending', "cvId" uuid, CONSTRAINT "REL_2aaa60a8771f8531075ede18af" UNIQUE ("cvId"), CONSTRAINT "PK_ddbdc4bcafd11969bd9189b616b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "cv-ai" ADD CONSTRAINT "FK_2aaa60a8771f8531075ede18af4" FOREIGN KEY ("cvId") REFERENCES "CV"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cv-ai" DROP CONSTRAINT "FK_2aaa60a8771f8531075ede18af4"`);
        await queryRunner.query(`DROP TABLE "cv-ai"`);
        await queryRunner.query(`DROP TYPE "public"."cv-ai_status_enum"`);
    }

}
