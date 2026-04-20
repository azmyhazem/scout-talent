import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateJob1776655858567 implements MigrationInterface {
    name = 'UpdateJob1776655858567'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "jobs" ADD "industryId" uuid`);
        await queryRunner.query(`ALTER TABLE "jobs" ADD CONSTRAINT "FK_11ce0b6be29ddc40ca1639ed597" FOREIGN KEY ("industryId") REFERENCES "industry"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "jobs" DROP CONSTRAINT "FK_11ce0b6be29ddc40ca1639ed597"`);
        await queryRunner.query(`ALTER TABLE "jobs" DROP COLUMN "industryId"`);
    }

}
