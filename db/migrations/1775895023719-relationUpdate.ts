import { MigrationInterface, QueryRunner } from "typeorm";

export class RelationUpdate1775895023719 implements MigrationInterface {
    name = 'RelationUpdate1775895023719'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "company" ADD "userId" uuid`);
        await queryRunner.query(`ALTER TABLE "company" ADD CONSTRAINT "UQ_c41a1d36702f2cd0403ce58d33a" UNIQUE ("userId")`);
        await queryRunner.query(`ALTER TABLE "applicant" ADD "userId" uuid`);
        await queryRunner.query(`ALTER TABLE "applicant" ADD CONSTRAINT "UQ_546a819aa07c196d7aa0f9d17db" UNIQUE ("userId")`);
        await queryRunner.query(`ALTER TABLE "company" ADD CONSTRAINT "FK_c41a1d36702f2cd0403ce58d33a" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "applicant" ADD CONSTRAINT "FK_546a819aa07c196d7aa0f9d17db" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "applicant" DROP CONSTRAINT "FK_546a819aa07c196d7aa0f9d17db"`);
        await queryRunner.query(`ALTER TABLE "company" DROP CONSTRAINT "FK_c41a1d36702f2cd0403ce58d33a"`);
        await queryRunner.query(`ALTER TABLE "applicant" DROP CONSTRAINT "UQ_546a819aa07c196d7aa0f9d17db"`);
        await queryRunner.query(`ALTER TABLE "applicant" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "company" DROP CONSTRAINT "UQ_c41a1d36702f2cd0403ce58d33a"`);
        await queryRunner.query(`ALTER TABLE "company" DROP COLUMN "userId"`);
    }

}
