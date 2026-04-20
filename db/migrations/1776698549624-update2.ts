import { MigrationInterface, QueryRunner } from "typeorm";

export class Update21776698549624 implements MigrationInterface {
    name = 'Update21776698549624'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "recommend-candidates" ADD "semantic_score" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "recommend-candidates" ADD "skill_overlap_score" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "recommend-candidates" ADD "experience_score" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "recommend-candidates" ADD "final_score" integer NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "recommend-candidates" DROP COLUMN "final_score"`);
        await queryRunner.query(`ALTER TABLE "recommend-candidates" DROP COLUMN "experience_score"`);
        await queryRunner.query(`ALTER TABLE "recommend-candidates" DROP COLUMN "skill_overlap_score"`);
        await queryRunner.query(`ALTER TABLE "recommend-candidates" DROP COLUMN "semantic_score"`);
    }

}
