import { InjectQueue } from "@nestjs/bullmq";
import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { Queue } from "bullmq";
import { Job } from "src/Modules/Job/job.entity";
import { JobStatus } from "src/Shared/Enums/job.enum";
import { Repository } from "typeorm";

@Injectable()
export class JobStatusService {
  constructor(
    @InjectRepository(Job) private jobRepository: Repository<Job>,

    @InjectQueue("update-job-status")
    private update_job_status: Queue,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleJobsStatus() {
    const now = new Date();

    const jobs = await this.jobRepository.find({
      where: [{ status: JobStatus.PUBLISHED }, { status: JobStatus.PAUSED }],
      take: 50,
    });

    for (const job of jobs) {
      let status = job.status;

      if (job.acceptedCount >= job.positions) {
        status = JobStatus.FILLED;
      } else if (job.applicationsCount >= job.maxApplications) {
        status = JobStatus.APPLICATIONS_FULL;
      } else if (now > job.deadline) {
        status = JobStatus.EXPIRED;
      }

      if (job.status !== status) {
        await this.jobRepository.update(job.id, { status });

        await this.update_job_status.add(
          "job-status",
          {
            job_id: job.jobIdAi,
            status,
          },
          {
            jobId: job.jobIdAi,
            attempts: 3,
            backoff: {
              type: "exponential",
              delay: 2000,
            },
          },
        );
      }
    }
  }
}
