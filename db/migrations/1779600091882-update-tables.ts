import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTables1779600091882 implements MigrationInterface {
    name = 'UpdateTables1779600091882'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "feature_usage" DROP CONSTRAINT "FK_424dcd1ed11627ead62eab22abc"`);
        await queryRunner.query(`ALTER TABLE "feature_permissions" RENAME COLUMN "created_at" TO "createdAt"`);
        await queryRunner.query(`ALTER TABLE "features" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "features" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "feature_usage" DROP COLUMN "used_count"`);
        await queryRunner.query(`ALTER TABLE "feature_usage" DROP COLUMN "period_start"`);
        await queryRunner.query(`ALTER TABLE "feature_usage" DROP COLUMN "period_end"`);
        await queryRunner.query(`ALTER TABLE "feature_usage" DROP COLUMN "last_used_at"`);
        await queryRunner.query(`ALTER TABLE "feature_usage" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "feature_usage" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "feature_usage" DROP COLUMN "featurePermissionId"`);
        await queryRunner.query(`ALTER TABLE "plan_feature_permissions" DROP COLUMN "limit_count"`);
        await queryRunner.query(`ALTER TABLE "plan_feature_permissions" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "features" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "features" ADD "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "feature_usage" ADD "usedCount" bigint NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "feature_usage" ADD "periodStart" date NOT NULL`);
        await queryRunner.query(`ALTER TABLE "feature_usage" ADD "periodEnd" date NOT NULL`);
        await queryRunner.query(`ALTER TABLE "feature_usage" ADD "lastUsedAt" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "feature_usage" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "feature_usage" ADD "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "feature_usage" ADD "planFeaturePermissionId" uuid`);
        await queryRunner.query(`ALTER TABLE "plan_feature_permissions" ADD "limitCount" integer`);
        await queryRunner.query(`ALTER TABLE "plan_feature_permissions" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "feature_permissions" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "feature_permissions" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "feature_usage" ADD CONSTRAINT "FK_83f019d8b71cc64e546c0917571" FOREIGN KEY ("planFeaturePermissionId") REFERENCES "plan_feature_permissions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "feature_usage" DROP CONSTRAINT "FK_83f019d8b71cc64e546c0917571"`);
        await queryRunner.query(`ALTER TABLE "feature_permissions" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "feature_permissions" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "plan_feature_permissions" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "plan_feature_permissions" DROP COLUMN "limitCount"`);
        await queryRunner.query(`ALTER TABLE "feature_usage" DROP COLUMN "planFeaturePermissionId"`);
        await queryRunner.query(`ALTER TABLE "feature_usage" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "feature_usage" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "feature_usage" DROP COLUMN "lastUsedAt"`);
        await queryRunner.query(`ALTER TABLE "feature_usage" DROP COLUMN "periodEnd"`);
        await queryRunner.query(`ALTER TABLE "feature_usage" DROP COLUMN "periodStart"`);
        await queryRunner.query(`ALTER TABLE "feature_usage" DROP COLUMN "usedCount"`);
        await queryRunner.query(`ALTER TABLE "features" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "features" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "plan_feature_permissions" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "plan_feature_permissions" ADD "limit_count" integer`);
        await queryRunner.query(`ALTER TABLE "feature_usage" ADD "featurePermissionId" uuid`);
        await queryRunner.query(`ALTER TABLE "feature_usage" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "feature_usage" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "feature_usage" ADD "last_used_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "feature_usage" ADD "period_end" date NOT NULL`);
        await queryRunner.query(`ALTER TABLE "feature_usage" ADD "period_start" date NOT NULL`);
        await queryRunner.query(`ALTER TABLE "feature_usage" ADD "used_count" bigint NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "features" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "features" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "feature_permissions" RENAME COLUMN "createdAt" TO "created_at"`);
        await queryRunner.query(`ALTER TABLE "feature_usage" ADD CONSTRAINT "FK_424dcd1ed11627ead62eab22abc" FOREIGN KEY ("featurePermissionId") REFERENCES "feature_permissions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
