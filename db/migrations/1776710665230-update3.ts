import { MigrationInterface, QueryRunner } from "typeorm";

export class Update31776710665230 implements MigrationInterface {
    name = 'Update31776710665230'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "recommend-candidates" ADD "years_experience" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "recommend-jobs" DROP COLUMN "seniority_match"`);
        await queryRunner.query(`ALTER TABLE "recommend-jobs" ADD "seniority_match" double precision NOT NULL`);
        await queryRunner.query(`ALTER TABLE "recommend-candidates" DROP COLUMN "semantic_score"`);
        await queryRunner.query(`ALTER TABLE "recommend-candidates" ADD "semantic_score" double precision NOT NULL`);
        await queryRunner.query(`ALTER TABLE "recommend-candidates" DROP COLUMN "skill_overlap_score"`);
        await queryRunner.query(`ALTER TABLE "recommend-candidates" ADD "skill_overlap_score" double precision NOT NULL`);
        await queryRunner.query(`ALTER TABLE "recommend-candidates" DROP COLUMN "experience_score"`);
        await queryRunner.query(`ALTER TABLE "recommend-candidates" ADD "experience_score" double precision NOT NULL`);
        await queryRunner.query(`ALTER TABLE "recommend-candidates" DROP COLUMN "final_score"`);
        await queryRunner.query(`ALTER TABLE "recommend-candidates" ADD "final_score" double precision NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "recommend-candidates" DROP COLUMN "final_score"`);
        await queryRunner.query(`ALTER TABLE "recommend-candidates" ADD "final_score" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "recommend-candidates" DROP COLUMN "experience_score"`);
        await queryRunner.query(`ALTER TABLE "recommend-candidates" ADD "experience_score" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "recommend-candidates" DROP COLUMN "skill_overlap_score"`);
        await queryRunner.query(`ALTER TABLE "recommend-candidates" ADD "skill_overlap_score" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "recommend-candidates" DROP COLUMN "semantic_score"`);
        await queryRunner.query(`ALTER TABLE "recommend-candidates" ADD "semantic_score" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "recommend-jobs" DROP COLUMN "seniority_match"`);
        await queryRunner.query(`ALTER TABLE "recommend-jobs" ADD "seniority_match" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "recommend-candidates" DROP COLUMN "years_experience"`);
    }

}
