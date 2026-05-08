import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateStatus1778248047949 implements MigrationInterface {
    name = 'UpdateStatus1778248047949'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."payments_status_enum" RENAME TO "payments_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."payments_status_enum" AS ENUM('pending', 'success', 'failed')`);
        await queryRunner.query(`ALTER TABLE "payments" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "payments" ALTER COLUMN "status" TYPE "public"."payments_status_enum" USING "status"::"text"::"public"."payments_status_enum"`);
        await queryRunner.query(`ALTER TABLE "payments" ALTER COLUMN "status" SET DEFAULT 'pending'`);
        await queryRunner.query(`DROP TYPE "public"."payments_status_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."payments_method_enum" RENAME TO "payments_method_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."payments_method_enum" AS ENUM('card', 'wallet')`);
        await queryRunner.query(`ALTER TABLE "payments" ALTER COLUMN "method" TYPE "public"."payments_method_enum" USING "method"::"text"::"public"."payments_method_enum"`);
        await queryRunner.query(`DROP TYPE "public"."payments_method_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."payments_method_enum_old" AS ENUM('0', '1')`);
        await queryRunner.query(`ALTER TABLE "payments" ALTER COLUMN "method" TYPE "public"."payments_method_enum_old" USING "method"::"text"::"public"."payments_method_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."payments_method_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."payments_method_enum_old" RENAME TO "payments_method_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."payments_status_enum_old" AS ENUM('0', '1', '2')`);
        await queryRunner.query(`ALTER TABLE "payments" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "payments" ALTER COLUMN "status" TYPE "public"."payments_status_enum_old" USING "status"::"text"::"public"."payments_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "payments" ALTER COLUMN "status" SET DEFAULT '0'`);
        await queryRunner.query(`DROP TYPE "public"."payments_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."payments_status_enum_old" RENAME TO "payments_status_enum"`);
    }

}
