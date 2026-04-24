import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateNotification1777052072463 implements MigrationInterface {
    name = 'UpdateNotification1777052072463'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notification" DROP COLUMN "content"`);
        await queryRunner.query(`CREATE TYPE "public"."notification_type_enum" AS ENUM('interview_scheduled', 'feedback_submitted', 'Hired', 'offer_sent', 'interview_rescheduled', 'interview_cancelled', 'rejected')`);
        await queryRunner.query(`ALTER TABLE "notification" ADD "type" "public"."notification_type_enum" NOT NULL`);
        await queryRunner.query(`ALTER TABLE "notification" ADD "title" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "notification" ADD "body" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "notification" ADD "meta" jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notification" DROP COLUMN "meta"`);
        await queryRunner.query(`ALTER TABLE "notification" DROP COLUMN "body"`);
        await queryRunner.query(`ALTER TABLE "notification" DROP COLUMN "title"`);
        await queryRunner.query(`ALTER TABLE "notification" DROP COLUMN "type"`);
        await queryRunner.query(`DROP TYPE "public"."notification_type_enum"`);
        await queryRunner.query(`ALTER TABLE "notification" ADD "content" character varying NOT NULL`);
    }

}
