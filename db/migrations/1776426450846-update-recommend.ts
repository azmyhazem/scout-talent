import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateRecommend1776426450846 implements MigrationInterface {
    name = 'UpdateRecommend1776426450846'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."recommend-jobs_status_enum" AS ENUM('pending', 'active', 'completed', 'failed', 'retrying')`);
        await queryRunner.query(`ALTER TABLE "recommend-jobs" ADD "status" "public"."recommend-jobs_status_enum" NOT NULL DEFAULT 'pending'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "recommend-jobs" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."recommend-jobs_status_enum"`);
    }

}
