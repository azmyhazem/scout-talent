import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFeaturePermission1778225339604 implements MigrationInterface {
    name = 'AddFeaturePermission1778225339604'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_7536cba909dd7584a4640cad7d5"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_fbdba4e2ac694cf8c9cecf4dc84"`);
        await queryRunner.query(`CREATE TABLE "features" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_5c1e336df2f4a7051e5bf08a941" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "permissions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" text, "method" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_920331560282b8bd21bb02290df" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "feature_usage" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "used_count" bigint NOT NULL DEFAULT '0', "period_start" date NOT NULL, "period_end" date NOT NULL, "last_used_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "subscriptionId" uuid, "featurePermissionId" uuid, CONSTRAINT "PK_f5b7116f8fafba341ccaf86919c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "feature_permissions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "featureId" uuid, "permissionId" uuid, CONSTRAINT "PK_10a78eab0154ad71ac1804a60f5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "plan_feature_permissions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "limit_count" integer, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "planId" uuid, "featurePermissionId" uuid, CONSTRAINT "PK_055d85b7042fcd2a825850e03ac" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."payments_status_enum" AS ENUM('pending', 'succeeded', 'failed', 'refunded', 'canceled')`);
        await queryRunner.query(`CREATE TYPE "public"."payments_method_enum" AS ENUM('0', '1')`);
        await queryRunner.query(`CREATE TABLE "payments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "amount" numeric(10,2) NOT NULL, "currency" character varying NOT NULL, "transaction_id" character varying, "status" "public"."payments_status_enum" NOT NULL, "paid_at" TIMESTAMP, "method" "public"."payments_method_enum" NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "subscriptionId" uuid, CONSTRAINT "PK_197ab7af18c93fbb0c9b28b4a59" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "plans" DROP COLUMN "durationDays"`);
        await queryRunner.query(`ALTER TABLE "plans" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."plans_status_enum"`);
        await queryRunner.query(`ALTER TABLE "plans" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP COLUMN "startDate"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP COLUMN "endDate"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "plans" ADD "description" text`);
        await queryRunner.query(`ALTER TABLE "plans" ADD "currency" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "plans" ADD "durationInDays" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "plans" ADD "is_active" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "plans" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "plans" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD "start_date" date NOT NULL`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD "end_date" date`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD "auto_renew" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "plans" ALTER COLUMN "price" TYPE numeric(10,2)`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "feature_usage" ADD CONSTRAINT "FK_c0f7420c25776eb0412f913260e" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "feature_usage" ADD CONSTRAINT "FK_424dcd1ed11627ead62eab22abc" FOREIGN KEY ("featurePermissionId") REFERENCES "feature_permissions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "feature_permissions" ADD CONSTRAINT "FK_bbf9916fcc32ab485e81e76e9dd" FOREIGN KEY ("featureId") REFERENCES "features"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "feature_permissions" ADD CONSTRAINT "FK_2191cbd9746aee51216066ebe4c" FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "plan_feature_permissions" ADD CONSTRAINT "FK_b646dd8c96124ba3867a4b63dce" FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "plan_feature_permissions" ADD CONSTRAINT "FK_c27baa0f4185abf1c146f397ed4" FOREIGN KEY ("featurePermissionId") REFERENCES "feature_permissions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payments" ADD CONSTRAINT "FK_2017d0cbfdbfec6b1b388e6aa08" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_fbdba4e2ac694cf8c9cecf4dc84" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_7536cba909dd7584a4640cad7d5" FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_7536cba909dd7584a4640cad7d5"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_fbdba4e2ac694cf8c9cecf4dc84"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "FK_2017d0cbfdbfec6b1b388e6aa08"`);
        await queryRunner.query(`ALTER TABLE "plan_feature_permissions" DROP CONSTRAINT "FK_c27baa0f4185abf1c146f397ed4"`);
        await queryRunner.query(`ALTER TABLE "plan_feature_permissions" DROP CONSTRAINT "FK_b646dd8c96124ba3867a4b63dce"`);
        await queryRunner.query(`ALTER TABLE "feature_permissions" DROP CONSTRAINT "FK_2191cbd9746aee51216066ebe4c"`);
        await queryRunner.query(`ALTER TABLE "feature_permissions" DROP CONSTRAINT "FK_bbf9916fcc32ab485e81e76e9dd"`);
        await queryRunner.query(`ALTER TABLE "feature_usage" DROP CONSTRAINT "FK_424dcd1ed11627ead62eab22abc"`);
        await queryRunner.query(`ALTER TABLE "feature_usage" DROP CONSTRAINT "FK_c0f7420c25776eb0412f913260e"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ALTER COLUMN "status" SET DEFAULT 'active'`);
        await queryRunner.query(`ALTER TABLE "plans" ALTER COLUMN "price" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP COLUMN "auto_renew"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP COLUMN "end_date"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP COLUMN "start_date"`);
        await queryRunner.query(`ALTER TABLE "plans" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "plans" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "plans" DROP COLUMN "is_active"`);
        await queryRunner.query(`ALTER TABLE "plans" DROP COLUMN "durationInDays"`);
        await queryRunner.query(`ALTER TABLE "plans" DROP COLUMN "currency"`);
        await queryRunner.query(`ALTER TABLE "plans" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD "endDate" TIMESTAMP WITH TIME ZONE NOT NULL`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD "startDate" TIMESTAMP WITH TIME ZONE NOT NULL`);
        await queryRunner.query(`ALTER TABLE "plans" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`CREATE TYPE "public"."plans_status_enum" AS ENUM('active', 'inactive', 'draft')`);
        await queryRunner.query(`ALTER TABLE "plans" ADD "status" "public"."plans_status_enum" NOT NULL DEFAULT 'draft'`);
        await queryRunner.query(`ALTER TABLE "plans" ADD "durationDays" integer NOT NULL`);
        await queryRunner.query(`DROP TABLE "payments"`);
        await queryRunner.query(`DROP TYPE "public"."payments_method_enum"`);
        await queryRunner.query(`DROP TYPE "public"."payments_status_enum"`);
        await queryRunner.query(`DROP TABLE "plan_feature_permissions"`);
        await queryRunner.query(`DROP TABLE "feature_permissions"`);
        await queryRunner.query(`DROP TABLE "feature_usage"`);
        await queryRunner.query(`DROP TABLE "permissions"`);
        await queryRunner.query(`DROP TABLE "features"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_fbdba4e2ac694cf8c9cecf4dc84" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_7536cba909dd7584a4640cad7d5" FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
