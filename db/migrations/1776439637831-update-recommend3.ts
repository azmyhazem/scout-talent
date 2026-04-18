import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateRecommend31776439637831 implements MigrationInterface {
    name = 'UpdateRecommend31776439637831'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "recommend-jobs" ALTER COLUMN "generatedAiAt" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "recommend-jobs" ALTER COLUMN "generatedAiAt" SET NOT NULL`);
    }

}
