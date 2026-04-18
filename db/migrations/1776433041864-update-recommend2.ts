import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateRecommend21776433041864 implements MigrationInterface {
    name = 'UpdateRecommend21776433041864'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "recommend-jobs" DROP COLUMN "generatedAt"`);
        await queryRunner.query(`ALTER TABLE "recommend-jobs" ADD "generatedAiAt" TIMESTAMP WITH TIME ZONE NOT NULL`);
        await queryRunner.query(`ALTER TABLE "recommend-jobs" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "recommend-jobs" ALTER COLUMN "recommends" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "recommend-jobs" ALTER COLUMN "recommends" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "recommend-jobs" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "recommend-jobs" DROP COLUMN "generatedAiAt"`);
        await queryRunner.query(`ALTER TABLE "recommend-jobs" ADD "generatedAt" TIMESTAMP WITH TIME ZONE NOT NULL`);
    }

}
