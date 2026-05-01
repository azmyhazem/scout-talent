import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  OnModuleInit,
} from "@nestjs/common";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
import { Applicant } from "./applicant.entity";
import { DataSource, EntityManager, In, MoreThan, Repository } from "typeorm";
import { updateApplicantDTO } from "./dto/updateApplicant.dto";
import { UserService } from "../Users/user.service";
import { JobApplicant } from "../application/job_applicant.entity";
import { CandidateStatus } from "src/Shared/Enums/candidateStatus.enum";
import { CVService } from "../CV/cv.service";
import { RecommendAiService } from "../recommend-ai-cv/recommend-ai-cv.service";
import { JobServices } from "../Job/job.service";
import { Queue, QueueEvents } from "bullmq";
import { InjectQueue } from "@nestjs/bullmq";
import { CV } from "../CV/cv.entity";
import { StatusAI } from "src/Shared/Enums/statusAI.enum";
import { RecommendationBatchCV } from "../recommend-ai-cv/recommendation-batch-cv.entity";

@Injectable()
export class ApplicantService implements OnModuleInit {
  private queueEvents: QueueEvents;

  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
    @InjectRepository(Applicant)
    private applicantRepository: Repository<Applicant>,
    @InjectRepository(JobApplicant)
    private jobApplicantRepository: Repository<JobApplicant>,

    @Inject(forwardRef(() => UserService))
    private userService: UserService,

    @Inject(forwardRef(() => CVService))
    private cvServcie: CVService,
    private recommendAiService: RecommendAiService,

    @Inject(forwardRef(() => JobServices))
    private jobService: JobServices,

    @InjectQueue("create-batch-cv")
    private create_batch_cv: Queue,
  ) {}

  onModuleInit() {
    this.queueEvents = new QueueEvents("create-batch-cv", {
      connection: {
        url: process.env.REDIS_URL
        // host: process.env.REDIS_HOST ?? "localhost",
        // port: 6379,
      },
    });
  }

  public async shareLink(userId: string) {
    const applicant = await this.applicantRepository
      .createQueryBuilder("applicant")
      .leftJoin("applicant.user", "user")
      .addSelect("user.slug")
      .where("user.id = :userId", { userId })
      .getOne();

    return { data: { slug: applicant?.user.slug } };
  }

  public async getApplicantByCandidateId(candidateId: number[]) {
    return this.applicantRepository.find({
      where: {
        candidateId: In(candidateId),
      },
    });
  }

  public async createApplicant(
    data: Partial<Applicant>,
    manger: EntityManager,
  ) {
    const repo = manger
      ? manger.getRepository(Applicant)
      : this.applicantRepository;

    const applicant = repo.create(data);

    return repo.save(applicant);
  }

  public async findApplicantWithIdUser(userId: string) {
    const applicant = await this.applicantRepository.findOne({
      where: { user: { id: userId } },
      relations: ["user", "industry", "cvs"],
    });

    return applicant;
  }

  public async findApplicantwithDetails(id: string) {
    const applicant = await this.applicantRepository.findOne({
      where: { user: { id } },
      relations: ["skills", "experiences", "user"],
    });

    return applicant;
  }

  public async basicInformation(id: string) {
    const applicant = await this.applicantRepository
      .createQueryBuilder("applicant")
      .leftJoin("applicant.user", "user")
      .where("user.id = :id", { id })
      .select([
        "applicant.id",
        "applicant.job_title",
        "applicant.phone",
        "user.name",
        "user.email",
        "user.linkedIn_profile",
        "user.location",
      ])
      .getOne();

    return applicant;
  }

  public async updateProfile(dto: updateApplicantDTO, id: string) {
    const applicant = await this.applicantRepository.findOne({
      where: { user: { id } },
      relations: ["user"],
    });

    if (!applicant) throw new BadRequestException("no user found");

    return await this.dataSource.transaction(async (manager) => {
      const { name, linkedIn_profile, phone, location, job_title } = dto;

      await this.userService.updateData(
        applicant.user.id,
        {
          name,
          linkedIn_profile,
          location,
        },
        manager,
      );
      await manager.update(Applicant, applicant.id, { phone, job_title });
      return true;
    });
  }

  public async profileCompleteUser(id: string) {
    const applicant = await this.applicantRepository.findOne({
      where: { user: { id } },
      relations: ["user", "skills", "experiences"],
    });

    if (!applicant) throw new BadRequestException("no user found");

    let percentage = 0;
    let basicInfo = false;

    if (
      applicant.job_title &&
      applicant.phone &&
      applicant.user.name &&
      applicant.user.location &&
      applicant.user.linkedIn_profile
    ) {
      percentage += 40;
      basicInfo = true;
    }

    const skillsCompleted = applicant.skills.length > 0;
    const experienceCompleted = applicant.experiences.length > 0;

    if (skillsCompleted) percentage += 30;

    if (experienceCompleted) percentage += 30;

    return {
      percentage,
      sections: {
        basicInfo,
        skillsCompleted,
        experienceCompleted,
      },
    };
  }

  public async dashboardStatisticsUser(id: string) {
    const applicant = await this.applicantRepository.findOne({
      where: { user: { id } },
    });

    if (!applicant) throw new BadRequestException("no user found");

    const totalApplicant = await this.totalApplicant(applicant.id);

    const inReview = await this.inReview(applicant.id);

    const interview = await this.CountInterview(applicant.id);

    return {
      totalApplicant,
      inReview,
      interview,
    };
  }

  public async deleteAccount(id: string) {
    await this.userService.deleteAccount(id);

    return { message: "Account deleted successfully" };
  }

  public async getJobsRecommend(userId: string, isRefresh: boolean) {
    const applicant = await this.findApplicantWithIdUser(userId);
    if (!applicant) throw new BadRequestException("No applicant found");

    const cv = await this.cvServcie.getCvPrimary(applicant.id);
    if (!cv) throw new BadRequestException("No CV found");

    const recommendJob = await this.recommendAiService.getLastBatchByCv(cv.id);

    if (isRefresh) {
      if (recommendJob) {
        const latestJob = await this.jobService.getLatestJobByIndustry(
          applicant.industry.id,
        );
        if (!latestJob || latestJob.createdAt <= recommendJob.createdAt) {
          return { data: recommendJob }; // Already up to date
        }
      }

      // Trigger both processors and wait for COMPLETED status
      const fresh = await this.triggerAndWaitForBatch(cv);
      return { data: fresh };
    }

    if (!recommendJob) {
      return { data: null, message: "No recommendations available" };
    }

    return { data: recommendJob };
  }

  private async triggerAndWaitForBatch(
    cv: CV,
  ): Promise<RecommendationBatchCV | null> {
    // Step 1: Trigger Processor 1
    const job = await this.create_batch_cv.add(
      "add-batch-cv",
      { cv },
      {
        attempts: 3,
        backoff: { type: "exponential", delay: 2000 },
      },
    );

    // Step 2: Wait for Processor 1 to finish (creates batch + triggers Processor 2)
    await job.waitUntilFinished(this.queueEvents, 15000);

    // Step 3: Now poll the batch STATUS until COMPLETED or FAILED
    return this.pollUntilCompleted(cv.id);
  }

  private async pollUntilCompleted(
    cvId: string,
    intervalMs = 2000,
    maxWaitMs = 30000,
  ): Promise<RecommendationBatchCV | null> {
    const start = Date.now();

    while (Date.now() - start < maxWaitMs) {
      await new Promise((resolve) => setTimeout(resolve, intervalMs));

      const batch = await this.recommendAiService.getLastBatchByCv(cvId);

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

  public async updateCandidataId(
    applicantId: string,
    candidateId: string,
    manger: EntityManager,
  ) {
    const repo = manger
      ? manger.getRepository(Applicant)
      : this.applicantRepository;

    const applicant = await this.applicantRepository.findOne({
      where: { id: applicantId },
    });

    if (!applicant) throw new BadRequestException("no user found");

    applicant.candidateId = candidateId;

    return repo.save(applicant);
  }

  private totalApplicant(id: string) {
    return this.jobApplicantRepository.count({
      where: {
        applicant: { id },
        createdAt: MoreThan(this.getDateBeforeMonths(3)),
      },
    });
  }

  private inReview(id: string) {
    return this.jobApplicantRepository.count({
      where: {
        applicant: { id },
        createdAt: MoreThan(this.getDateBeforeMonths(3)),
        status: CandidateStatus.SCREENING,
      },
    });
  }

  private CountInterview(id: string) {
    return this.jobApplicantRepository.count({
      where: {
        applicant: { id },
        createdAt: MoreThan(this.getDateBeforeMonths(3)),
        status: CandidateStatus.INTERVIEW,
      },
    });
  }

  private getDateBeforeMonths(month: number) {
    const date = new Date();

    date.setMonth(date.getMonth() - month);

    return date;
  }
}
