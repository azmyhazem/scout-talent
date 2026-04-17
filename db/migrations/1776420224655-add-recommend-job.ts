import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRecommendJob1776420224655 implements MigrationInterface {
    name = 'AddRecommendJob1776420224655'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "recommend-jobs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "recommends" jsonb NOT NULL, "generatedAt" TIMESTAMP WITH TIME ZONE NOT NULL, "candidateId" uuid, "assetId" uuid, CONSTRAINT "UQ_2ef8d6c8b32db625924b654a218" UNIQUE ("assetId", "candidateId"), CONSTRAINT "REL_6e97073744e658f96a6b1d3f86" UNIQUE ("candidateId"), CONSTRAINT "REL_49e86ef7a51a92d7cb01be8588" UNIQUE ("assetId"), CONSTRAINT "PK_e7895f56e9d232b3de27ccc7c9d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "CV" ADD "isPrimary" boolean NOT NULL`);
        await queryRunner.query(`ALTER TABLE "recommend-jobs" ADD CONSTRAINT "FK_6e97073744e658f96a6b1d3f869" FOREIGN KEY ("candidateId") REFERENCES "applicant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "recommend-jobs" ADD CONSTRAINT "FK_49e86ef7a51a92d7cb01be85883" FOREIGN KEY ("assetId") REFERENCES "CV"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "recommend-jobs" DROP CONSTRAINT "FK_49e86ef7a51a92d7cb01be85883"`);
        await queryRunner.query(`ALTER TABLE "recommend-jobs" DROP CONSTRAINT "FK_6e97073744e658f96a6b1d3f869"`);
        await queryRunner.query(`ALTER TABLE "CV" DROP COLUMN "isPrimary"`);
        await queryRunner.query(`DROP TABLE "recommend-jobs"`);
    }

}
