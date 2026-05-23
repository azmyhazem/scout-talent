import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsDefaultPlan1779518381244 implements MigrationInterface {
    name = 'AddIsDefaultPlan1779518381244'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "plans" ADD "isDefault" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "plans" DROP COLUMN "isDefault"`);
    }

}
