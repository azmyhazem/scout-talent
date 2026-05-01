import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  OnModuleInit,
} from "@nestjs/common";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
import { Job } from "./job.entity";
import { DataSource, EntityManager, In, MoreThan, Repository } from "typeorm";
import { addJobDTO } from "./dto/addJob.dto";
import { updateJobDTO } from "./dto/updateJob.dto";
import { JobStatus, JobType, WorkMode } from "src/Shared/Enums/job.enum";
import { jobStatusDTO } from "./dto/statusJob.dto";
import { CompanyService } from "../company/company.service";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue, QueueEvents } from "bullmq";
import { StatusAI } from "src/Shared/Enums/statusAI.enum";
import { IndustryRepository } from "../industry/industry.repository";
import { RecommendJobService } from "../recommend-ai-company/recommend-job.service";
import { RecommendationBatchJob } from "../recommend-ai-company/recommendation-batch-job.entity";
import { CVService } from "../CV/cv.service";
import { ApplicantService } from "../applicant/applicant.service";
import { ApplicationService } from "../application/application.service";
import { NotificationService } from "../notification/notification.service";
import { NotificationType } from "src/Shared/Enums/notification.enum";

@Injectable()
export class JobServices implements OnModuleInit {
  private queueEvents: QueueEvents;

  constructor(
    @InjectRepository(Job) private jobRepository: Repository<Job>,

    @InjectDataSource()
    private dataSource: DataSource,

    @Inject(forwardRef(() => CompanyService))
    private companyService: CompanyService,

    @InjectQueue("upload-job")
    private upload_job: Queue,

    private industryRepo: IndustryRepository,

    private recommendCandidateService: RecommendJobService,

    @InjectQueue("update-job-status")
    private update_job_status: Queue,

    private cvService: CVService,

    @InjectQueue("create-batch-job")
    private create_batch_job: Queue,

    @Inject(forwardRef(() => ApplicantService))
    private applicantService: ApplicantService,

    @Inject(forwardRef(() => ApplicationService))
    private applicationService: ApplicationService,

    private notificationService: NotificationService,
  ) {}

  onModuleInit() {
    this.queueEvents = new QueueEvents("create-batch-job", {
      connection: {
        url: process.env.REDIS_URL,
        // host: process.env.REDIS_HOST ?? "localhost",
        // port: 6379,
      },
    });
  }

  public async findJob(id: string) {
    const job = await this.jobRepository
      .createQueryBuilder("job")
      .leftJoin("job.company", "company")
      .leftJoin("company.user", "user")
      .where("job.id = :id AND job.status = :status", {
        id,
        status: JobStatus.PUBLISHED,
      })
      .select([
        "job.id",
        "job.title",
        "job.description",
        "job.jobIdAi",
        "company.id",
        "user.name",
      ])
      .getOne();
    return job;
  }

  public activeJobs(companyId: string): Promise<number> {
    return this.jobRepository.count({
      where: {
        company: { id: companyId },
        createdAt: MoreThan(this.getDateBeforeMonths(3)),
        status: JobStatus.PUBLISHED,
      },
    });
  }
  /**
   * to add new job
   * @param dto title , description , status ,deelline , salaryMin
   * @param recruiterId
   * @returns messsage
   */
  public async Addjob(dto: addJobDTO, userId: string) {
    const company = await this.companyService.findCompanyWithIdUser(userId);

    if (!company) throw new BadRequestException("please try again");

    const {
      title,
      description,
      skills,
      location,
      minSalary,
      maxSalary,
      requirements,
      type,
      workMode,
      responsibilities,
      positions,
      maxApplications,
      seniority,
      industry,
    } = dto;

    const now = Date.now();
    const deadline = new Date(dto.deadline);

    if (deadline.getTime() <= now) {
      throw new BadRequestException("the deadline must be in the future");
    }
    const industryR = await this.industryRepo.find(industry);

    if (!industryR) throw new BadRequestException("industry not found");

    const Njob = this.jobRepository.create({
      title,
      description,
      location,
      minSalary,
      maxSalary,
      status: JobStatus.DRAFT,
      requirements,
      type,
      workMode,
      skills,
      seniority,
      responsibilities,
      company,
      positions,
      maxApplications,
      deadline,
      industry: industryR,
    });

    await this.jobRepository.save(Njob);

    return { message: "add job successful" };
  }

  /**
   * get all job
   * @returns all jobs
   */
  public async getAllJob() {
    const jobs = await this.jobRepository.find({
      where: {
        status: JobStatus.PUBLISHED,
      },
    });

    return jobs;
  }

  public async GetAllJobsByCompany(
    companyId: string,
    q?: JobStatus,
    workMode?: WorkMode,
    jobType?: JobType,
  ) {
    const jobs = this.jobRepository
      .createQueryBuilder("job")
      .leftJoin("job.company", "company")
      .where("company.id = :companyId", { companyId });

    if (q) {
      jobs.andWhere("job.status = :q", { q });
    }

    if (jobType) {
      jobs.andWhere("LOWER(job.type) LIKE LOWER(:jobType)", {
        jobType: `%${jobType}%`,
      });
    }

    if (workMode) {
      jobs.andWhere("LOWER(job.workMode) LIKE LOWER(:workMode)", {
        workMode: `%${workMode}%`,
      });
    }

    return await jobs.getMany();
  }

  public async getRecommendCandidate(
    userId: string,
    isRefresh: boolean,
    jobId: string,
  ) {
    const company = await this.companyService.findCompanyWithIdUser(userId);

    if (!company) throw new BadRequestException("please try again");

    const job = await this.jobRepository.findOne({
      where: {
        id: jobId,
        company: { id: company.id },
      },
      relations: ["company"],
    });

    if (!job) throw new BadRequestException("no job found");

    const recommendCandidate =
      await this.recommendCandidateService.getLastBatchByJob(jobId);

    if (isRefresh) {
      if (recommendCandidate) {
        const latestJob = await this.cvService.getLatestCVByIndustry(
          job.industry.id,
        );
        if (!latestJob || latestJob.createdAt <= recommendCandidate.createdAt) {
          return { data: recommendCandidate }; // Already up to date
        }
      }

      // Trigger both processors and wait for COMPLETED status
      const fresh = await this.triggerAndWaitForBatch(job);
      return { data: fresh };
    }

    if (!recommendCandidate) {
      return { data: null, message: "No recommendations available" };
    }

    return { data: recommendCandidate };
  }

  private async triggerAndWaitForBatch(
    job: Job,
  ): Promise<RecommendationBatchJob | null> {
    // Step 1: Trigger Processor 1
    const jobProcessor = await this.create_batch_job.add(
      "add-batch-job",
      { job },
      {
        attempts: 3,
        backoff: { type: "exponential", delay: 2000 },
      },
    );

    // Step 2: Wait for Processor 1 to finish (creates batch + triggers Processor 2)
    await jobProcessor.waitUntilFinished(this.queueEvents, 15000);

    // Step 3: Now poll the batch STATUS until COMPLETED or FAILED
    return this.pollUntilCompleted(job.id);
  }

  private async pollUntilCompleted(
    jobId: string,
    intervalMs = 2000,
    maxWaitMs = 30000,
  ): Promise<RecommendationBatchJob | null> {
    const start = Date.now();

    while (Date.now() - start < maxWaitMs) {
      await new Promise((resolve) => setTimeout(resolve, intervalMs));

      const batch =
        await this.recommendCandidateService.getLastBatchByJob(jobId);

      if (!batch) continue;

      if (batch.status === StatusAI.COMPLETED) {
        return batch;
      }

      if (batch.status === StatusAI.FAILED) {
        throw new Error("Recommendation job failed");
      }

      // If ACTIVE or RETRYING → keep polling
      console.log(`Status: ${batch.status}, still waiting...`);
    }

    return null; // ⏱️ Timed out
  }

  public async invitCandidate(
    userId: string,
    jobId: string,
    recommendId: string,
    companyId: string,
  ) {
    const applicant =
      await this.applicantService.findApplicantWithIdUser(userId);

    if (!applicant) {
      throw new BadRequestException("no applicant found");
    }

    const job = await this.jobRepository
      .createQueryBuilder("job")
      .leftJoin("job.company", "company")
      .leftJoin("company.user", "user")
      .where("job.id = :jobId AND user.id= :companyId", {
        jobId,
        companyId,
      })
      .select([
        "job.id",
        "job.title",
        "job.description",
        "job.jobIdAi", 
        "company.id",
        "user.name",
      ])
      .getOne();

    if (!job) {
      throw new BadRequestException("no job found");
    }

    const jobApply = await this.applicationService.getApplicationjob(
      jobId,
      applicant.id,
    );

    if (jobApply) {
      return {
        data: {
          message: "this candidate already apply ",
          application: { id: jobApply.id },
        },
      };
    }

    await this.dataSource.transaction(async (manager) => {
      await this.recommendCandidateService.updateIsInvit(recommendId, manager);

      await this.notificationService.create(
        userId,
        {
          type: NotificationType.INVIT,
          body: `You’ve been invited to apply for the position "${job.title}" at ${job.company.user.name}. Check the job details and submit your application now.`,
          meta: {
            jobId,
            jobTitle: job.title,
            companyName: job.company.user.name,
          },
          user: applicant.user,
        },
        manager,
      );
    });

    return true;
  }

  /**
   * get job's id
   * @param id
   * @returns job
   */
  public async getJob(id: string) {
    const job = await this.jobRepository.findOne({
      where: { id },
      relations: ["industry"],
    });

    if (!job) {
      throw new BadRequestException("not found job");
    }
    return job;
  }

  public async getJobsByJobIdAi(jobIdAI: number[]) {
    return this.jobRepository.find({
      where: {
        jobIdAi: In(jobIdAI),
      },
    });
  }

  public async updateJob(userId: string, id: string, dto: updateJobDTO) {
    const company = await this.companyService.findCompanyWithIdUser(userId);

    if (!company) throw new BadRequestException("please try again");
    const job = await this.jobRepository.findOne({
      where: {
        id,
        company,
      },
    });

    if (!job) {
      throw new BadRequestException("not found job");
    }

    if (job.status !== JobStatus.DRAFT) {
      throw new BadRequestException(
        `the status of job ${job.status} , can't update`,
      );
    }

    let industry = job.industry;
    if (dto.industry) {
      const foundIndustry = await this.industryRepo.find(dto.industry);

      if (!foundIndustry) {
        throw new BadRequestException("industry not found");
      }

      industry = foundIndustry;
    }
    await this.jobRepository.update(id, { ...dto, industry });

    return { message: "Job updated successfully" };
  }

  /**
   * delete job
   * @param id
   * @returns message
   */
  public async deleteJob(companyId: string, id: string) {
    const result = await this.jobRepository.delete({
      id,
      company: {
        id: companyId,
      },
    });

    if (result.affected === 0) {
      throw new BadRequestException("Job not found");
    }

    return { message: "Job deleted successfully" };
  }
  /**
   * application job
   * @param applicantId user
   * @param jobId job
   * @returns message
   */

  public async ChangeJobStatus(
    companyId: string,
    jobId: string,
    dto: jobStatusDTO,
  ) {
    const job = await this.jobRepository.findOne({
      where: {
        id: jobId,
        company: { user: { id: companyId } },
      },
    });

    if (!job) throw new BadRequestException("no job found");

    const { status } = dto;

    if (job.status === JobStatus.DRAFT && status === JobStatus.PUBLISHED) {
      await this.upload_job.add(
        "job",
        {
          jobId: job.id,
          title: job.title,
          description: `${job.description}, ${job.requirements}, ${job.responsibilities.join(" | ")}`,
          seniority: job.seniority,
          required_skills: job.skills,
        },
        {
          attempts: 3,
          backoff: {
            type: "exponential",
            delay: 2000,
          },
        },
      );
    }

    const terminalStates = [
      JobStatus.APPLICATIONS_FULL,
      JobStatus.CLOSED,
      JobStatus.EXPIRED,
      JobStatus.FILLED,
    ];

    if (terminalStates.includes(job.status)) {
      throw new BadRequestException("Job cannot be modified anymore");
    }

    if (new Date() > job.deadline) {
      job.status = JobStatus.EXPIRED;
      await this.jobRepository.save(job);
      throw new BadRequestException("Job is expired");
    }

    const allowedTransitions = {
      [JobStatus.DRAFT]: [JobStatus.PUBLISHED],
      [JobStatus.PUBLISHED]: [JobStatus.PAUSED, JobStatus.CLOSED],
      [JobStatus.PAUSED]: [JobStatus.PUBLISHED, JobStatus.CLOSED],
    };

    if (!allowedTransitions[job.status]?.includes(status)) {
      throw new BadRequestException("Invalid status transition");
    }

    job.status = status;

    await this.jobRepository.save(job);

    await this.update_job_status.add(
      "job-status",
      {
        job_id: job.jobIdAi,
        status,
      },
      {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 2000,
        },
      },
    );

    return job;
  }

  public async updateJobIdAi(
    jobId: string,
    jobIdAi: string,
    manager: EntityManager,
  ) {
    const repo = manager ? manager.getRepository(Job) : this.jobRepository;
    return repo.update(jobId, { jobIdAi });
  }

  public async updateStatusAi(
    jobId: string,
    statusAi: StatusAI,
    manager?: EntityManager,
  ) {
    const repo = manager ? manager.getRepository(Job) : this.jobRepository;

    const job = await repo.findOne({
      where: {
        id: jobId,
      },
      relations: ["industry"],
    });

    if (!job) {
      throw new BadRequestException("not found job");
    }

    job.statusAi = statusAi;

    return repo.save(job);
  }

  public async getLatestJobByIndustry(industryId: string) {
    return await this.jobRepository.findOne({
      where: { industry: { id: industryId } },
      order: { createdAt: "DESC" },
    });
  }

  async getActiveJobs() {
    return this.jobRepository.count({
      where: { status: JobStatus.PUBLISHED },
    });
  }

  async getAllJobsCount() {
    return this.jobRepository.count();
  }

  async getRecentJobs() {
    return this.jobRepository.find({
      order: {
        createdAt: "DESC", // الأحدث أولًا
      },
      take: 10,
      relations: ["company", "company.user"],
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        applicationsCount: true,
        acceptedCount: true,
        company: {
          user: {
            name: true,
          },
        },
      },
    });
  }

  async getAllJobForAdmin(skip: number, limit: number) {
    return this.jobRepository.find({
      skip,
      take: limit,
    });
  }

  private getDateBeforeMonths(month: number) {
    const date = new Date();

    date.setMonth(date.getMonth() - month);

    return date;
  }
}
