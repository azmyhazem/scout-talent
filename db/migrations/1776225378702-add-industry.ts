import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIndustry1776225378702 implements MigrationInterface {
    name = 'AddIndustry1776225378702'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "industry" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, CONSTRAINT "UQ_e756cbed5e9f27221c238f11fcc" UNIQUE ("name"), CONSTRAINT "PK_fc3e38485cff79e9fbba8f13831" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "applicant" ADD "industryId" uuid`);
        await queryRunner.query(`ALTER TABLE "applicant" ADD CONSTRAINT "UQ_00099a40978bff6411793df6bd0" UNIQUE ("industryId")`);
        await queryRunner.query(`ALTER TABLE "applicant" ADD CONSTRAINT "FK_00099a40978bff6411793df6bd0" FOREIGN KEY ("industryId") REFERENCES "industry"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "applicant" DROP CONSTRAINT "FK_00099a40978bff6411793df6bd0"`);
        await queryRunner.query(`ALTER TABLE "applicant" DROP CONSTRAINT "UQ_00099a40978bff6411793df6bd0"`);
        await queryRunner.query(`ALTER TABLE "applicant" DROP COLUMN "industryId"`);
        await queryRunner.query(`DROP TABLE "industry"`);
    }

}
