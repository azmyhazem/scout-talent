import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTransactionId1778249988528 implements MigrationInterface {
    name = 'AddTransactionId1778249988528'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payments" ADD "paymob_transaction_id" character varying`);
        await queryRunner.query(`CREATE INDEX "IDX_0565093e103474a457750b87af" ON "payments" ("paymob_order_id") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_0565093e103474a457750b87af"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "paymob_transaction_id"`);
    }

}
