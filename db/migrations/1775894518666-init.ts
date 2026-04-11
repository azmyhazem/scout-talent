import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1775894518666 implements MigrationInterface {
    name = 'Init1775894518666'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user-token" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "token" character varying NOT NULL, "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL, "type" "public"."user-token_type_enum" NOT NULL, "userId" uuid, CONSTRAINT "UQ_8f5675e6be7fb584a04b6e26ca8" UNIQUE ("token"), CONSTRAINT "PK_ce0bc8c9c3bac40b0301e8e1165" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "location" character varying, "linkedIn_profile" character varying, "role" "public"."users_role_enum" NOT NULL DEFAULT 'Applicant', "refreshToken" character varying, "isEmailVerified" boolean NOT NULL DEFAULT false, "isDelete" boolean NOT NULL DEFAULT false, "createAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "specialization" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "companyId" uuid, CONSTRAINT "PK_904dfcbdb57f56f5b57b9c09cc5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "company" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "About" character varying, CONSTRAINT "PK_056f7854a7afdba7cbd6d45fc20" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "jobs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "location" character varying NOT NULL, "minSalary" numeric(10,2), "maxSalary" numeric(10,2), "type" "public"."jobs_type_enum" NOT NULL, "status" "public"."jobs_status_enum" NOT NULL DEFAULT 'Draft', "workMode" "public"."jobs_workmode_enum" NOT NULL, "description" text NOT NULL, "positions" integer NOT NULL, "maxApplications" integer, "applicationsCount" integer NOT NULL DEFAULT '0', "acceptedCount" integer NOT NULL DEFAULT '0', "deadline" TIMESTAMP WITH TIME ZONE NOT NULL, "skills" text, "responsibilities" text, "requirements" character varying NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "companyId" uuid, CONSTRAINT "PK_cf0a6c42b72fcc7f7c237def345" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "hiredDetails" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "startDate" TIMESTAMP WITH TIME ZONE NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "applicationId" uuid, CONSTRAINT "REL_6810b7bcf49a32fad3dacab772" UNIQUE ("applicationId"), CONSTRAINT "PK_58e69d2d78ddda9f7c54e09e669" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "jobOffer" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "offeredSalary" character varying NOT NULL, "startDate" TIMESTAMP WITH TIME ZONE NOT NULL, "notes" character varying, "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL, "respondedAt" TIMESTAMP WITH TIME ZONE, "status" "public"."jobOffer_status_enum" NOT NULL DEFAULT 'Pending', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "applicationId" uuid, CONSTRAINT "REL_3ef8642da65cce502da7550121" UNIQUE ("applicationId"), CONSTRAINT "PK_24d6aeb541b4ceffed3ca8e2b0d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "feedback" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "publicFeedback" character varying NOT NULL, "rating" integer NOT NULL, "nextStep" "public"."feedback_nextstep_enum" NOT NULL, "resultId" character varying NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "interviewId" uuid, CONSTRAINT "REL_1da270251d13dd20cf2a50271f" UNIQUE ("interviewId"), CONSTRAINT "CHK_55e3f752b77d6db7979d831c37" CHECK ("rating" >= 1 AND "rating" <= 5), CONSTRAINT "PK_8389f9e087a57689cd5be8b2b13" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "cancel-interview" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "reason" character varying, "cancelBy" "public"."cancel-interview_cancelby_enum" NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "interviewId" uuid, CONSTRAINT "REL_0888955f5632638166d1edad51" UNIQUE ("interviewId"), CONSTRAINT "PK_d876e20fe7347355457f08f2839" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "interviews" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" "public"."interviews_type_enum" NOT NULL DEFAULT 'Technical', "status" "public"."interviews_status_enum" NOT NULL DEFAULT 'Scheduled', "scheduledAt" TIMESTAMP WITH TIME ZONE NOT NULL, "meetingLink" character varying NOT NULL, "durationMin" integer NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "applicationId" uuid, CONSTRAINT "PK_fd41af1f96d698fa33c2f070f47" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "reject-cv" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "reason" character varying NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "applicationId" uuid, CONSTRAINT "REL_1e2c1e8293dcdaca3719dbb94a" UNIQUE ("applicationId"), CONSTRAINT "PK_445fa50d3594efddb8f8ee47d36" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "skills" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "applicantId" uuid, CONSTRAINT "PK_0d3212120f4ecedf90864d7e298" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "experience" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "company" character varying NOT NULL, "startDate" TIMESTAMP WITH TIME ZONE NOT NULL, "endDate" TIMESTAMP WITH TIME ZONE NOT NULL, "description" character varying NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "applicantId" uuid, CONSTRAINT "PK_5e8d5a534100e1b17ee2efa429a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "applicant" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "phone" character varying, "job_title" character varying, CONSTRAINT "PK_f4a6e907b8b17f293eb073fc5ea" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "job_applicant" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" "public"."job_applicant_status_enum" NOT NULL DEFAULT 'New', "about" character varying NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "hiredAt" TIMESTAMP WITH TIME ZONE, "screenAt" TIMESTAMP WITH TIME ZONE, "sendOfferAt" TIMESTAMP WITH TIME ZONE, "interviewAt" TIMESTAMP WITH TIME ZONE, "rejectAt" TIMESTAMP WITH TIME ZONE, "jobId" uuid, "applicantId" uuid, "cvId" uuid, CONSTRAINT "UQ_c2160c2da37f8325cd9c1b2b448" UNIQUE ("jobId", "applicantId"), CONSTRAINT "PK_66f870f5e5792506f5901a02e45" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "CV" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "url" character varying NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "applicantId" uuid, CONSTRAINT "PK_a7e0c0895ceb856a1420ce991fc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "outbox" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "event_type" "public"."outbox_event_type_enum" NOT NULL, "payload" jsonb NOT NULL, "status" "public"."outbox_status_enum" NOT NULL DEFAULT 'PENDING', "retryCount" integer NOT NULL DEFAULT '0', "nextRetryAt" TIMESTAMP WITH TIME ZONE NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_340ab539f309f03bdaa14aa7649" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user-token" ADD CONSTRAINT "FK_6c43c95ddb18b3ae863e7c9d06e" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "specialization" ADD CONSTRAINT "FK_353f54a6f585a07c0f90140797c" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "jobs" ADD CONSTRAINT "FK_6ce4483dc65ed9d2e171269d801" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "hiredDetails" ADD CONSTRAINT "FK_6810b7bcf49a32fad3dacab7729" FOREIGN KEY ("applicationId") REFERENCES "job_applicant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "jobOffer" ADD CONSTRAINT "FK_3ef8642da65cce502da75501219" FOREIGN KEY ("applicationId") REFERENCES "job_applicant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "feedback" ADD CONSTRAINT "FK_1da270251d13dd20cf2a50271f1" FOREIGN KEY ("interviewId") REFERENCES "interviews"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cancel-interview" ADD CONSTRAINT "FK_0888955f5632638166d1edad512" FOREIGN KEY ("interviewId") REFERENCES "interviews"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "interviews" ADD CONSTRAINT "FK_ba82c76bf124871821aedc35b7a" FOREIGN KEY ("applicationId") REFERENCES "job_applicant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reject-cv" ADD CONSTRAINT "FK_1e2c1e8293dcdaca3719dbb94a2" FOREIGN KEY ("applicationId") REFERENCES "job_applicant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "skills" ADD CONSTRAINT "FK_09ed4d6c331fbfb5a455d868db7" FOREIGN KEY ("applicantId") REFERENCES "applicant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "experience" ADD CONSTRAINT "FK_9c837a4822a45cf6bc4938a1bba" FOREIGN KEY ("applicantId") REFERENCES "applicant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "job_applicant" ADD CONSTRAINT "FK_f4887ecc2367922eb6feac0f1cd" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "job_applicant" ADD CONSTRAINT "FK_c78f9fee4defea0110ba5ef0ed0" FOREIGN KEY ("applicantId") REFERENCES "applicant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "job_applicant" ADD CONSTRAINT "FK_f04802c55e270cf2b9f70d6e42d" FOREIGN KEY ("cvId") REFERENCES "CV"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "CV" ADD CONSTRAINT "FK_0a4835f22b6d5b52b1ba4ba59d2" FOREIGN KEY ("applicantId") REFERENCES "applicant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "CV" DROP CONSTRAINT "FK_0a4835f22b6d5b52b1ba4ba59d2"`);
        await queryRunner.query(`ALTER TABLE "job_applicant" DROP CONSTRAINT "FK_f04802c55e270cf2b9f70d6e42d"`);
        await queryRunner.query(`ALTER TABLE "job_applicant" DROP CONSTRAINT "FK_c78f9fee4defea0110ba5ef0ed0"`);
        await queryRunner.query(`ALTER TABLE "job_applicant" DROP CONSTRAINT "FK_f4887ecc2367922eb6feac0f1cd"`);
        await queryRunner.query(`ALTER TABLE "experience" DROP CONSTRAINT "FK_9c837a4822a45cf6bc4938a1bba"`);
        await queryRunner.query(`ALTER TABLE "skills" DROP CONSTRAINT "FK_09ed4d6c331fbfb5a455d868db7"`);
        await queryRunner.query(`ALTER TABLE "reject-cv" DROP CONSTRAINT "FK_1e2c1e8293dcdaca3719dbb94a2"`);
        await queryRunner.query(`ALTER TABLE "interviews" DROP CONSTRAINT "FK_ba82c76bf124871821aedc35b7a"`);
        await queryRunner.query(`ALTER TABLE "cancel-interview" DROP CONSTRAINT "FK_0888955f5632638166d1edad512"`);
        await queryRunner.query(`ALTER TABLE "feedback" DROP CONSTRAINT "FK_1da270251d13dd20cf2a50271f1"`);
        await queryRunner.query(`ALTER TABLE "jobOffer" DROP CONSTRAINT "FK_3ef8642da65cce502da75501219"`);
        await queryRunner.query(`ALTER TABLE "hiredDetails" DROP CONSTRAINT "FK_6810b7bcf49a32fad3dacab7729"`);
        await queryRunner.query(`ALTER TABLE "jobs" DROP CONSTRAINT "FK_6ce4483dc65ed9d2e171269d801"`);
        await queryRunner.query(`ALTER TABLE "specialization" DROP CONSTRAINT "FK_353f54a6f585a07c0f90140797c"`);
        await queryRunner.query(`ALTER TABLE "user-token" DROP CONSTRAINT "FK_6c43c95ddb18b3ae863e7c9d06e"`);
        await queryRunner.query(`DROP TABLE "outbox"`);
        await queryRunner.query(`DROP TABLE "CV"`);
        await queryRunner.query(`DROP TABLE "job_applicant"`);
        await queryRunner.query(`DROP TABLE "applicant"`);
        await queryRunner.query(`DROP TABLE "experience"`);
        await queryRunner.query(`DROP TABLE "skills"`);
        await queryRunner.query(`DROP TABLE "reject-cv"`);
        await queryRunner.query(`DROP TABLE "interviews"`);
        await queryRunner.query(`DROP TABLE "cancel-interview"`);
        await queryRunner.query(`DROP TABLE "feedback"`);
        await queryRunner.query(`DROP TABLE "jobOffer"`);
        await queryRunner.query(`DROP TABLE "hiredDetails"`);
        await queryRunner.query(`DROP TABLE "jobs"`);
        await queryRunner.query(`DROP TABLE "company"`);
        await queryRunner.query(`DROP TABLE "specialization"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "user-token"`);
    }

}
