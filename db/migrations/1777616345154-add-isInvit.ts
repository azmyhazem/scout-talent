import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsInvit1777616345154 implements MigrationInterface {
    name = 'AddIsInvit1777616345154'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "recommend-candidates" ADD "isInvit" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "recommend-candidates" DROP COLUMN "isInvit"`);
    }

}
