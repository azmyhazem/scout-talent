import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateRelation1776225638452 implements MigrationInterface {
    name = 'UpdateRelation1776225638452'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "applicant" DROP CONSTRAINT "FK_00099a40978bff6411793df6bd0"`);
        await queryRunner.query(`ALTER TABLE "applicant" DROP CONSTRAINT "UQ_00099a40978bff6411793df6bd0"`);
        await queryRunner.query(`ALTER TABLE "applicant" ADD CONSTRAINT "FK_00099a40978bff6411793df6bd0" FOREIGN KEY ("industryId") REFERENCES "industry"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "applicant" DROP CONSTRAINT "FK_00099a40978bff6411793df6bd0"`);
        await queryRunner.query(`ALTER TABLE "applicant" ADD CONSTRAINT "UQ_00099a40978bff6411793df6bd0" UNIQUE ("industryId")`);
        await queryRunner.query(`ALTER TABLE "applicant" ADD CONSTRAINT "FK_00099a40978bff6411793df6bd0" FOREIGN KEY ("industryId") REFERENCES "industry"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
