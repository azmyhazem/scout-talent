import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
import { JobApplicant } from "./job_applicant.entity";
import { Brackets, DataSource, EntityManager, Repository } from "typeorm";
import { CVService } from "../CV/cv.service";
import { applyJobDTO } from "./dto/applyJob.dto";
import { JobType, WorkMode } from "src/Shared/Enums/job.enum";
import { JobServices } from "../Job/job.service";
import { Job } from "../Job/job.entity";
import { CandidateStatus } from "src/Shared/Enums/candidateStatus.enum";
import { RejectDTO } from "./dto/reject.dto";
import { Reject } from "./reject.entity";
import { HiredDTO } from "./dto/hired.dto";
import { OfferStatus } from "src/Shared/Enums/offerStatus.enum";
import { HiredDetails } from "./Hired_Details.entity";
import { InterviewDTO } from "./dto/interview.dto";
import { Interview } from "../interview/interviews.entity";
import { JobOfferDTO } from "./dto/jobOffer.dto";
import { mintesToMilliseconds } from "src/Shared/utils/cookie.util";
import { JobOffer } from "./jobOffer.entity";
import { offerRespones } from "./dto/offerRespones.dto";
import { ApplicantService } from "../applicant/applicant.service";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import type { AIResult } from "./interface/result.interface";
import { StatusAI } from "src/Shared/Enums/statusAI.enum";

@Injectable()
export class ApplicationService {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,

    @InjectRepository(JobApplicant)
    private jobApplicantRepository: Repository<JobApplicant>,

    @InjectRepository(Interview)
    private interviewRepository: Repository<Interview>,

    @InjectRepository(JobOffer)
    private jobOfferRepository: Repository<JobOffer>,

    private cvService: CVService,
    private jobService: JobServices,
    private applicantService: ApplicantService,

    @InjectQueue("analyze-match")
    private analyze_match: Queue,
  ) {}

  public findOneByUserId(id: string, userId: string) {
    return this.jobApplicantRepository.findOne({
      where: {
        id,
        job: {
          company: { user: { id: userId } },
        },
      },
    });
  }

  public async GetAllJobsByCompanyApply(
    userId: string,
    q?: string,
    status?: string,
  ) {
    const jobsApply = this.jobApplicantRepository
      .createQueryBuilder("jobApply")

      .leftJoin("jobApply.applicant", "applicant")
      .leftJoin("applicant.user", "userA")
      .leftJoin("jobApply.job", "job")
      .leftJoin("job.company", "company")
      .leftJoin("company.user", "user")

      .select([
        "jobApply.id",
        "jobApply.status",

        "job.id",
        "job.title",
        "job.skills",

        "applicant.id",
        "userA.name",
        "applicant.job_title",
      ])

      .where("user.id = :userId", { userId });

    if (q) {
      jobsApply.andWhere(
        new Brackets((qb) => {
          qb.where("LOWER(job.title) LIKE LOWER(:q)", {
            q: `%${q}%`,
          }).orWhere("LOWER(job.skills) LIKE LOWER(:q)", {
            q: `%${q}%`,
          });
        }),
      );
    }

    if (status) {
      jobsApply.andWhere("jobApply.status = :status", { status });
    }

    return { jobaApply: await jobsApply.getMany() };
  }

  public async GetJobByCompanyApplyById(userId: string, applicationId: string) {
    const jobsApply = this.jobApplicantRepository
      .createQueryBuilder("jobApply")

      .leftJoin("jobApply.applicant", "applicant")
      .leftJoin("applicant.user", "userA")
      .leftJoin("jobApply.job", "job")
      .leftJoin("job.company", "company")
      .leftJoin("company.user", "user")

      .select([
        "jobApply.id",
        "jobApply.status",
        "jobApply.result",

        "job.id",
        "job.title",
        "job.skills",

        "applicant.id",
        "userA.name",
        "applicant.job_title",
      ])

      .where("user.id = :userId AND jobApply.id= :applicationId", {
        userId,
        applicationId,
      });

    return { jobApply: await jobsApply.getOne() };
  }

  public async getAllApplicationByJobId(jobId: string, userId: string) {
    const jobsApply = this.jobApplicantRepository
      .createQueryBuilder("jobApply")

      .leftJoinAndSelect("jobApply.applicant", "applicant")
      .leftJoinAndSelect("applicant.user", "userA")
      .leftJoinAndSelect("jobApply.job", "job")
      .leftJoinAndSelect("job.company", "company")
      .leftJoinAndSelect("company.user", "user")

      .where("user.id = :userId AND job.id= :jobId", {
        userId,
        jobId,
      });

    return { jobApply: await jobsApply.getMany() };
  }

  public async applyJob(
    userId: string,
    jobId: string,
    cvId: string,
    dto: applyJobDTO,
  ) {
    const user = await this.applicantService.findApplicantWithIdUser(userId);
    if (!user) throw new BadRequestException("please try again");

    const job = await this.jobService.findJob(jobId);
    if (!job) throw new BadRequestException("please try again");

    const cv = await this.cvService.findCV(cvId);
    if (!cv) throw new BadRequestException("try again");

    const { about } = dto;

    const apps = await this.dataSource.transaction(async (manager) => {
      if (job.applicationsCount >= job.maxApplications) {
        throw new BadRequestException(
          "This job has reached the maximum number of applications and is now closed.",
        );
      }
      await manager.increment(Job, { id: job.id }, "applicationsCount", 1);

      const jobApp = manager.create(JobApplicant, {
        applicant: user,
        job,
        cv,
        about,
      });

      const application = await manager.save(jobApp);

      return { applicationId: application.id };
    });

    await this.analyze_match.add(
      "application",
      {
        applicationId: apps.applicationId,
        candidateId: user.candidateId,
        jobIdAi: job.jobIdAi,
        asset_id: cv.asset_id,
      },
      {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 2000,
        },
      },
    );

    return {
      message: "application the job successful",
    };
  }

  public async screeningCV(userId: string, id: string) {
    const jobApplicantion = await this.jobApplicantRepository.findOne({
      where: {
        id,
        job: {
          company: { user: { id: userId } },
        },
      },
    });

    if (!jobApplicantion) throw new BadRequestException("please try again");

    if (jobApplicantion.status === CandidateStatus.SCREENING) {
      throw new BadRequestException("status of candidate is already screening");
    }

    if (jobApplicantion.status === CandidateStatus.NEW) {
      jobApplicantion.status = CandidateStatus.SCREENING;
      jobApplicantion.screenAt = new Date();

      const jobApp = await this.jobApplicantRepository.save(jobApplicantion);

      return {
        message: "convert candidate status to screening successful",
        jobApp: {
          id: jobApp.id,
          status: jobApp.status,
          screenAt: jobApp.screenAt,
        },
      };
    }
    return {
      message:
        "can't convert candidate status to screening, check candidate status",
      jobApp: {
        id: jobApplicantion.id,
        status: jobApplicantion.status,
        screenAt: jobApplicantion.screenAt,
      },
    };
  }

  public async rejectCV(
    userId: string,
    id: string,
    dto: RejectDTO,
    manager?: EntityManager,
  ) {
    const jobApplication = await this.findOneByUserId(id, userId);

    if (!jobApplication) throw new BadRequestException("please try again");

    if (jobApplication.status === CandidateStatus.REJECTED) {
      throw new BadRequestException("status of candidate is already rejected");
    }

    if (jobApplication.status === CandidateStatus.HIRED) {
      throw new BadRequestException("this applicantion is hired, can't reject");
    }

    const exec = async (manager: EntityManager) => {
      const jobApp = await this.moveToReject(jobApplication, manager);

      const reject = manager.create(Reject, {
        reason: dto.reason,
        application: jobApp,
      });

      const Nreject = await manager.save(reject);

      return {
        message: "convert cadidate status to rejected successful",
        data: {
          id: jobApp.id,
          status: jobApp.status,
          rejectId: Nreject.id,
          reason: Nreject.reason,
          rejectAt: jobApp.rejectAt,
        },
      };
    };

    if (manager) {
      return exec(manager);
    }

    return this.dataSource.transaction(exec);
  }

  public async hiredCV(userId: string, id: string, dto: HiredDTO) {
    const { startDate } = dto;

    const jobAppDB = await this.findOneByUserId(id, userId);

    if (!jobAppDB) {
      throw new BadRequestException("please try again");
    }

    return await this.dataSource.transaction(async (manager) => {
      if (jobAppDB.status === CandidateStatus.HIRED) {
        throw new BadRequestException("status of candidate is already hired");
      }

      if (jobAppDB.status !== CandidateStatus.OFFERED) {
        throw new BadRequestException(
          `the candidate status ${jobAppDB.status}, can't hired`,
        );
      }

      if (jobAppDB.offer.status !== OfferStatus.ACCEPTED) {
        throw new BadRequestException(
          "this offer is not accepted , can't hired",
        );
      }

      if (jobAppDB.job.acceptedCount >= jobAppDB.job.positions) {
        throw new BadRequestException("Hiring limit reached");
      }

      const jobApply = await this.moveToHired(jobAppDB, manager);

      await manager.increment(Job, { id: jobAppDB.job.id }, "acceptedCount", 1);

      const hired = manager.create(HiredDetails, {
        startDate,
        application: jobAppDB,
      });

      const savedHired = await manager.save(hired);

      return {
        message: "convert candidate status to hired successful",
        data: {
          id: jobApply.id,
          status: jobApply.status,
          hiredAt: jobApply.hiredAt,
          startDate: savedHired.startDate,
        },
      };
    });
  }

  public async interviewCV(
    userId: string,
    id: string,
    dto: InterviewDTO,
    manager?: EntityManager,
  ) {
    const jobApplicantion = await this.findOneByUserId(id, userId);

    if (!jobApplicantion) throw new BadRequestException("please try again");

    if (
      !(
        jobApplicantion.status === CandidateStatus.SCREENING ||
        jobApplicantion.status === CandidateStatus.INTERVIEW
      )
    ) {
      throw new BadRequestException(
        `can't interview ,the candidate status is ${jobApplicantion.status}`,
      );
    }
    const { type, scheduledAt, meetingLink, durationMin } = dto;

    const scheduledDate = new Date(scheduledAt);

    if (scheduledDate <= new Date()) {
      throw new BadRequestException("the scheduled date must be in the future");
    }

    await this.checkInterviewConflict(userId, scheduledDate, durationMin);

    const exce = async (manager: EntityManager) => {
      const jobApp = await this.moveToInterview(jobApplicantion, manager);

      const interview = await this.createInterview(
        {
          type,
          scheduledAt: scheduledDate,
          meetingLink,
          durationMin,
          application: jobApp,
        },
        manager,
      );

      return {
        message: "convert cadidate status to interview successful",
        data: {
          jobApplyid: jobApp.id,
          status: jobApp.status,
          interviewId: interview.id,
          interviewtype: type,
          scheduledAt: interview.scheduledAt,
          meetingLink,
          interviewAt: jobApp.interviewAt,
        },
      };
    };

    if (manager) {
      return exce(manager);
    }

    return this.dataSource.transaction(exce);
  }

  public async jobOffer(
    userId: string,
    id: string,
    dto: JobOfferDTO,
    manager?: EntityManager,
  ) {
    const jobApplicantion = await this.findOneByUserId(id, userId);
    if (!jobApplicantion) throw new BadRequestException("please try again");

    if (jobApplicantion.status === CandidateStatus.OFFERED) {
      throw new BadRequestException("status of candidate is already offered");
    }

    const { startDate, offeredSalary, notes, expiresAt } = dto;

    const expiredDate = new Date(expiresAt);
    const startDateTime = new Date(startDate);

    if (expiredDate <= new Date()) {
      throw new BadRequestException("the expired date must be in the future");
    }

    const exce = async (manager: EntityManager) => {
      const jobApp = await this.moveToOffer(jobApplicantion, manager);

      const offer = await this.createOffer(
        {
          startDate: startDateTime,
          offeredSalary,
          notes,
          expiresAt: expiredDate,
          application: jobApp,
        },
        manager,
      );

      return {
        message: "convert cadidate status to interview successful",
        data: {
          id: jobApp.id,
          status: jobApp.status,
          offerId: offer.id,
          offeredSalary,
          startDate,
          notes,
          expiresAt,
          offerAt: jobApp.sendOfferAt,
        },
      };
    };

    if (manager) {
      return exce(manager);
    }
    return this.dataSource.transaction(exce);
  }

  public async alljobsApplicantionByApplicant(
    userId: string,
    search?: string,
    location?: string,
    jobType?: JobType,
    workMode?: WorkMode,
  ) {
    const jobsApply = this.jobApplicantRepository
      .createQueryBuilder("jobApply")
      .leftJoinAndSelect("jobApply.job", "job")
      .leftJoinAndSelect("job.company", "company")
      .leftJoin("jobApply.applicant", "applicant")
      .leftJoin("applicant.user", "user")
      .where(" user.id= :userId", { userId });

    if (search) {
      jobsApply.andWhere("LOWER(job.title) LIKE LOWER(:search)", {
        search: `%${search}%`,
      });
    }

    if (location) {
      jobsApply.andWhere("LOWER(job.location) LIKE LOWER(:location)", {
        location: `%${location}%`,
      });
    }

    if (jobType) {
      jobsApply.andWhere("LOWER(job.type) LIKE LOWER(:jobType)", {
        jobType: `%${jobType}%`,
      });
    }

    if (workMode) {
      jobsApply.andWhere("LOWER(job.workMode) LIKE LOWER(:workMode)", {
        workMode: `%${workMode}%`,
      });
    }

    return jobsApply.getMany();
  }

  public async jobApplicantionByApplicantByID(
    userId: string,
    jobApplyId: string,
  ) {
    const jobApplyById = await this.jobApplicantRepository
      .createQueryBuilder("jobApply")
      .leftJoin("jobApply.applicant", "applicant")
      .leftJoin("applicant.user", "user")
      .leftJoin("jobApply.job", "job")
      .leftJoin("job.company", "company")
      .leftJoin("company.user", "userC")
      .leftJoin("jobApply.hiredDetails", "hiredDetails")
      .leftJoin("jobApply.offer", "offer")
      .leftJoin("jobApply.interviews", "interviews")
      .leftJoin("jobApply.reject", "reject")
      .where("jobApply.id = :jobApplyId AND user.id = :userId", {
        jobApplyId,
        userId,
      })
      .select([
        "jobApply",
        "applicant",
        "hiredDetails",
        "offer",
        "interviews",
        "reject",
        "job",
        "company.id",
        "userC.name",
      ])
      .getOne();

    if (!jobApplyById) throw new BadRequestException("not found Application");

    return jobApplyById;
  }

  public async jobOfferRespones(
    userId: string,
    offerId: string,
    dto: offerRespones,
  ) {
    const offer = await this.jobOfferRepository.findOne({
      where: {
        id: offerId,
        application: {
          applicant: { user: { id: userId } },
        },
      },
      relations: [
        "application",
        "application.job",
        "application.job.company",
        "application.job.company.user",
      ],
    });

    if (!offer) throw new BadRequestException("there is no offer");

    if (offer.expiresAt.getTime() <= Date.now()) {
      throw new BadRequestException("Offer expires");
    }

    const { status } = dto;

    return await this.dataSource.transaction(async (manager) => {
      offer.status = status;
      offer.respondedAt = new Date();

      const Noffer = await manager.save(offer);

      if (Noffer.status === OfferStatus.REJECTED) {
        await this.rejectCV(
          offer.application.job.company.user.id,
          offer.application.id,
          {
            reason: "applicant reject offer",
          },
          manager,
        );
      }

      return {
        data: {
          message:
            Noffer.status === OfferStatus.REJECTED
              ? "You have successfully rejected the job offer. We wish you the best in finding a better opportunity 💼"
              : "Congratulations! 🎉 You have successfully accepted the job offer. Wishing you success in your new journey 🚀",
        },
      };
    });
  }

  public async allOfferByApplicant(userId: string) {
    const offers = await this.jobOfferRepository
      .createQueryBuilder("offer")

      .leftJoinAndSelect("offer.application", "application")
      .leftJoin("application.interviews", "interview")
      .leftJoin("interview.feedback", "feedback")
      .leftJoin("application.job", "job")
      .leftJoin("job.company", "company")
      .leftJoin("company.user", "userC")
      .leftJoin("application.applicant", "applicant")
      .leftJoin("applicant.user", "user")

      .where("user.id = :userId", { userId })

      .select([
        "offer",

        "application.id",

        "job.id",
        "job.title",

        "company.id",
        "userC.name",
      ])

      .getMany();

    if (!offers) throw new BadRequestException("there is no offer");

    return offers;
  }

  public async allOfferByCompany(userId: string) {
    const offers = await this.jobOfferRepository
      .createQueryBuilder("offer")

      .leftJoinAndSelect("offer.application", "application")
      .leftJoin("application.interviews", "interview")
      .leftJoin("interview.feedback", "feedback")
      .leftJoin("application.job", "job")
      .leftJoin("job.company", "company")
      .leftJoin("company.user", "user")
      .leftJoin("application.applicant", "applicant")
      .leftJoin("applicant.user", "userA")

      .where("user.id = :userId", { userId })

      .select([
        "offer",

        "application.id",

        "job.id",
        "job.title",

        "applicant.id",
        "userA.name",
      ])

      .getMany();

    if (offers.length === 0) throw new BadRequestException("there is no offer");

    return offers;
  }

  public async updateResult(
    applicationId: string,
    result: AIResult,
    manger: EntityManager,
  ) {
    const repo = manger
      ? manger.getRepository(JobApplicant)
      : this.jobApplicantRepository;

    return repo.update(applicationId, { result });
  }

  public async updateStatusAi(
    applicationId: string,
    statusAi: StatusAI,
    manger?: EntityManager,
  ) {
    const repo = manger
      ? manger.getRepository(JobApplicant)
      : this.jobApplicantRepository;

    return repo.update(applicationId, { statusAi });
  }

  private async createInterview(
    data: Partial<Interview>,
    manger?: EntityManager,
  ) {
    const repo = manger
      ? manger.getRepository(Interview)
      : this.interviewRepository;

    const interview = repo.create(data);

    return repo.save(interview);
  }

  private async createOffer(data: Partial<JobOffer>, manger?: EntityManager) {
    const repo = manger
      ? manger.getRepository(JobOffer)
      : this.jobOfferRepository;

    const offer = repo.create(data);

    return repo.save(offer);
  }

  private async checkInterviewConflict(
    userId: string,
    scheduledAt: Date,
    durationMin: number,
  ) {
    const start = new Date(scheduledAt);
    const end = new Date(start.getTime() + mintesToMilliseconds(durationMin));

    const conflict = await this.interviewRepository
      .createQueryBuilder("interview")
      .leftJoin("interview.application", "application")
      .leftJoin("application.job", "job")
      .leftJoin("job.company", "company")
      .leftJoin("company.user", "user")
      .where("user.id= :userId", { userId })
      .andWhere(
        `
              interview.scheduledAt < :end
              AND interview.scheduledAt + (:duration * interval '1 minute') > :start
            `,
        {
          start,
          end,
          duration: durationMin,
        },
      )
      .getOne();

    if (conflict) {
      const formattedStart = new Date(conflict.scheduledAt).toLocaleString(
        "en-EG",
        { timeZone: "Africa/Cairo" },
      );

      const formattedEnd = new Date(
        conflict.scheduledAt.getTime() + mintesToMilliseconds(durationMin),
      ).toLocaleString("en-EG", {
        timeZone: "Africa/Cairo",
      });

      const newSelectedTime = new Date(scheduledAt).toLocaleString("en-EG", {
        timeZone: "Africa/Cairo",
      });

      throw new BadRequestException({
        message: "Interview time conflict",
        details: {
          message: `An interview is already scheduled from ${formattedStart} to ${formattedEnd}. The time you selected (${newSelectedTime}) overlaps with it. Please choose another available time.`,
        },
      });
    }
    return true;
  }

  private moveToHired(application: JobApplicant, manger?: EntityManager) {
    const repo = manger
      ? manger.getRepository(JobApplicant)
      : this.jobApplicantRepository;

    application.status = CandidateStatus.HIRED;
    application.hiredAt = new Date();

    return repo.save(application);
  }

  private moveToReject(application: JobApplicant, manger?: EntityManager) {
    const repo = manger
      ? manger.getRepository(JobApplicant)
      : this.jobApplicantRepository;

    application.status = CandidateStatus.REJECTED;
    application.rejectAt = new Date();

    return repo.save(application);
  }

  private moveToInterview(application: JobApplicant, manger?: EntityManager) {
    const repo = manger
      ? manger.getRepository(JobApplicant)
      : this.jobApplicantRepository;

    application.status = CandidateStatus.INTERVIEW;
    application.interviewAt = new Date();

    return repo.save(application);
  }

  private moveToOffer(application: JobApplicant, manger?: EntityManager) {
    const repo = manger
      ? manger.getRepository(JobApplicant)
      : this.jobApplicantRepository;

    application.status = CandidateStatus.OFFERED;
    application.sendOfferAt = new Date();

    return repo.save(application);
  }
}
