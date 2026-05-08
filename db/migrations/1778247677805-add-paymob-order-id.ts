import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPaymobOrderId1778247677805 implements MigrationInterface {
    name = 'AddPaymobOrderId1778247677805'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payments" RENAME COLUMN "transaction_id" TO "paymob_order_id"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "paymob_order_id"`);
        await queryRunner.query(`ALTER TABLE "payments" ADD "paymob_order_id" integer`);
        await queryRunner.query(`ALTER TYPE "public"."payments_status_enum" RENAME TO "payments_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."payments_status_enum" AS ENUM('0', '1', '2')`);
        await queryRunner.query(`ALTER TABLE "payments" ALTER COLUMN "status" TYPE "public"."payments_status_enum" USING "status"::"text"::"public"."payments_status_enum"`);
        await queryRunner.query(`ALTER TABLE "payments" ALTER COLUMN "status" SET DEFAULT '0'`);
        await queryRunner.query(`DROP TYPE "public"."payments_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "payments" ALTER COLUMN "status" SET DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payments" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`CREATE TYPE "public"."payments_status_enum_old" AS ENUM('pending', 'succeeded', 'failed', 'refunded', 'canceled')`);
        await queryRunner.query(`ALTER TABLE "payments" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "payments" ALTER COLUMN "status" TYPE "public"."payments_status_enum_old" USING "status"::"text"::"public"."payments_status_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."payments_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."payments_status_enum_old" RENAME TO "payments_status_enum"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "paymob_order_id"`);
        await queryRunner.query(`ALTER TABLE "payments" ADD "paymob_order_id" character varying`);
        await queryRunner.query(`ALTER TABLE "payments" RENAME COLUMN "paymob_order_id" TO "transaction_id"`);
    }

}
