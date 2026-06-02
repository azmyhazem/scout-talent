import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTypes1780379943131 implements MigrationInterface {
    name = 'UpdateTypes1780379943131'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."notification_type_enum" RENAME TO "notification_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."notification_type_enum" AS ENUM('apply job', 'interview_scheduled', 'feedback_submitted', 'Hired', 'offer_sent', 'interview_rescheduled', 'interview_cancelled', 'rejected', 'Invit', 'offer_response')`);
        await queryRunner.query(`ALTER TABLE "notification" ALTER COLUMN "type" TYPE "public"."notification_type_enum" USING "type"::"text"::"public"."notification_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."notification_type_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."notification_type_enum_old" AS ENUM('interview_scheduled', 'feedback_submitted', 'Hired', 'offer_sent', 'interview_rescheduled', 'interview_cancelled', 'rejected', 'Invit')`);
        await queryRunner.query(`ALTER TABLE "notification" ALTER COLUMN "type" TYPE "public"."notification_type_enum_old" USING "type"::"text"::"public"."notification_type_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."notification_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."notification_type_enum_old" RENAME TO "notification_type_enum"`);
    }

}
