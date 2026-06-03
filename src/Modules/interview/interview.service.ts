import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
import { DataSource, FindOptionsWhere, Repository } from "typeorm";
import { Interview } from "./interviews.entity";
import {
  InterviewNextStep,
  InterviewStatus,
} from "src/Shared/Enums/Interview.enum";
import { completeInterviewDTO } from "./dto/completeInterview.dto";
import { FeedBack } from "./feedback.entity";
import { rescheduleDTO } from "./dto/reschedule.dto";
import { cancelInterviewDTO } from "./dto/cancelInterview.dto";
import { CancelInterview } from "./cancelInterview.entity";
import { CancelBy } from "src/Shared/Enums/interviewCancel.enum";
import { mintesToMilliseconds } from "src/Shared/utils/cookie.util";
import { JobApplicant } from "../application/job_applicant.entity";
import { ApplicationService } from "../application/application.service";
import { NotificationService } from "../notification/notification.service";
import { NotificationType } from "src/Shared/Enums/notification.enum";

@Injectable()
export class InterviewService {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,

    @InjectRepository(JobApplicant)
    private jobApplicantRepository: Repository<JobApplicant>,

    @InjectRepository(Interview)
    private interviewRepository: Repository<Interview>,

    @InjectRepository(FeedBack)
    private feedbackRepository: Repository<FeedBack>,

    @InjectRepository(CancelInterview)
    private cancelInterviewRepository: Repository<CancelInterview>,

    private applicationService: ApplicationService,

    private notificationService: NotificationService,
  ) {}

  public async getAllInterviewWithCompany(userId: string) {
    const interviews = await this.interviewRepository
      .createQueryBuilder("interview")
      .leftJoin("interview.application", "application")
      .leftJoin("application.job", "job")
      .leftJoin("job.company", "company")
      .leftJoin("company.user", "user")
      .leftJoin("application.applicant", "applicant")
      .leftJoin("applicant.user", "userA")
      .leftJoinAndSelect("interview.feedback", "feedback")
      .leftJoinAndSelect("interview.CancelInterview", "cancel")

      .where("user.id = :userId", { userId })

      .select([
        "interview",

        "application",
        "applicant.id",
        "userA.name",

        "job.id",
        "job.title",

        "feedback",

        "cancel",
      ])

      .getMany();

    if (!interviews) throw new BadRequestException("there is no job interview");
    return {
      data: {
        type: interviews,
      },
    };
  }

  public async completeInterview(
    interviewId: string,
    userId: string,
    dto: completeInterviewDTO,
  ) {
    const interview = await this.interviewRepository.findOne({
      where: {
        id: interviewId,
        application: { job: { company: { user: { id: userId } } } },
      },
      relations: [
        "application",
        "application.job",
        "application.job.company",
        "application.job.company.user",
        "application.applicant.user",
      ],
    });
    if (!interview) throw new BadRequestException("there is no interview");

    if (interview.status === InterviewStatus.COMPLETED)
      throw new BadRequestException("this interview is already complete");

    if (interview.status === InterviewStatus.CANCELLED) {
      throw new BadRequestException("this interview is cancel");
    }

    const now = new Date().getTime();

    const endTime =
      new Date(interview.scheduledAt).getTime() +
      mintesToMilliseconds(interview.durationMin);

    if (now < endTime) {
      throw new BadRequestException("Interview is not finished yet");
    }

    const {
      publicFeedback,
      rating,
      nextStep,
      offer,
      anotherInterview,
      reject,
    } = dto;

    return await this.dataSource.transaction(async (manager) => {
      interview.status = InterviewStatus.COMPLETED;
      const Ninterview = await manager.save(interview);

      const feedback = this.feedbackRepository.create({
        publicFeedback,
        rating,
        nextStep,
        interview: Ninterview,
      });

      switch (nextStep) {
        case InterviewNextStep.ANOTHERINTERVIEW: {
          if (!anotherInterview)
            throw new BadRequestException("another interview data required");

          const { data } = await this.applicationService.interviewCV(
            userId,
            interview.application.id,
            anotherInterview,
            manager,
          );

          feedback.resultId = data.interviewId;
          break;
        }

        case InterviewNextStep.OFFERED: {
          if (!offer) throw new BadRequestException("offer data required");

          const { data } = await this.applicationService.jobOffer(
            userId,
            interview.application.id,
            offer,
            manager,
          );

          feedback.resultId = data.offerId;
          break;
        }

        case InterviewNextStep.REJECTED: {
          if (!reject) throw new BadRequestException("reject data required");

          const { data } = await this.applicationService.rejectCV(
            userId,
            interview.application.id,
            reject,
            manager,
          );
          feedback.resultId = data.rejectId;
          break;
        }
      }

      await manager.save(feedback);

      await this.notificationService.create(
        interview.application.applicant.user.id,
        {
          type: NotificationType.FEEDBACK_SUBMITTED,
          body: `${interview.application.job.company.user.name} has submitted feedback for your ${interview.application.job.title} interview. Next step: ${nextStep}.`,
          meta: {
            companyName: interview.application.job.company.user.name,
            nextStep,
          },
          user: interview.application.applicant.user,
        },
        manager,
      );

      return {
        data: {
          feedback,
        },
      };
    });
  }

  public async rescheduleInterview(
    interviewId: string,
    dto: rescheduleDTO,
    companyId: string,
  ) {
    const interview = await this.interviewRepository.findOne({
      where: {
        id: interviewId,
        application: { job: { company: { user: { id: companyId } } } },
      },
      relations: [
        "application",
        "application.job",
        "application.job.company",
        "application.job.company.user",
        "application.applicant.user",
      ],
    });

    if (!interview) throw new BadRequestException("there is no interview");

    if (
      !(
        interview.status === InterviewStatus.SCHEDULED ||
        interview.status === InterviewStatus.RESCHEDULED
      )
    ) {
      throw new BadRequestException(
        `can't rescheduled, the interview status is ${interview.status}`,
      );
    }

    const now = Date.now();
    const scheduledDate = new Date(dto.scheduledAt);

    if (scheduledDate.getTime() <= now) {
      throw new BadRequestException("the scheduled date must be in the future");
    }

    if (interview.scheduledAt.getTime() <= now) {
      throw new BadRequestException(
        "can't reschedule, interview already finished",
      );
    }

    if (interview.scheduledAt.getTime() === scheduledDate.getTime()) {
      throw new BadRequestException(
        "No changes detected in the scheduled interview time.",
      );
    }
    await this.checkInterviewConflict(
      companyId,
      scheduledDate,
      interview.durationMin,
    );

    return this.dataSource.transaction(async (manager) => {
      interview.scheduledAt = scheduledDate;
      interview.meetingLink = dto.meetingLink;
      interview.durationMin = dto.durationMin;
      interview.status = InterviewStatus.RESCHEDULED;

      const Ninter = await manager.save(interview);

      await this.notificationService.create(
        interview.application.applicant.user.id,
        {
          type: NotificationType.INTERVIEW_RESCHEDULED,
          body: `Your interview for ${interview.application.job.title} at ${interview.application.job.company.user.name} has been rescheduled to ${dto.scheduledAt}. Please check your dashboard for updated details.`,
          meta: {
            interviewId: interview.id,
            companyName: interview.application.job.company.user.name,
            interviewDate: dto.scheduledAt,
            jobTitle: interview.application.job.title,
          },
          user: interview.application.applicant.user,
        },
        manager,
      );

      return {
        data: {
          id: Ninter.id,
          status: Ninter.status,
          scheduledAt: Ninter.scheduledAt,
          meetingLink: Ninter.meetingLink,
        },
      };
    });
  }

  public async cancelInterview(
    interviewId: string,
    dto: cancelInterviewDTO,
    cancelBy: CancelBy,
    companyId?: string,
    applicantId?: string,
  ) {
    if (cancelBy === CancelBy.COMPANY && !companyId) {
      throw new BadRequestException("companyId is required");
    }

    if (cancelBy === CancelBy.APPLICANT && !applicantId) {
      throw new BadRequestException("applicantId is required");
    }

    let where: FindOptionsWhere<Interview>;

    if (cancelBy === CancelBy.COMPANY) {
      where = {
        id: interviewId,
        application: {
          job: { company: { user: { id: companyId } } },
        },
      };
    } else {
      where = {
        id: interviewId,
        application: {
          applicant: { user: { id: applicantId } },
        },
      };
    }

    const interview = await this.interviewRepository.findOne({
      where,
      relations: [
        "application",
        "application.job",
        "application.job.company",
        "application.job.company.user",
        "application.applicant.user",
      ],
    });
    if (!interview) throw new BadRequestException("there is no interview");

    if (interview.status === InterviewStatus.CANCELLED) {
      throw new BadRequestException(`this interview already cancel`);
    }

    return await this.dataSource.transaction(async (manager) => {
      interview.status = InterviewStatus.CANCELLED;

      const Ninter = await manager.save(interview);

      const cancel = this.cancelInterviewRepository.create({
        reason: dto.reason,
        cancelBy,
        interview: Ninter,
      });
      const Ncancel = await manager.save(cancel);

      await this.applicationService.rejectCV(
        Ninter.application.job.company.user.id,
        Ninter.application.id,
        { reason: `the interview cancel by ${cancelBy} + ${dto.reason}` },
      );

      await this.notificationService.create(
        interview.application.applicant.user.id,
        {
          type: NotificationType.INTERVIEW_CANCELLED,
          body: `Your ${interview.application.job.title} interview with ${interview.application.job.company.user.name} has been cancelled. You can check your dashboard for updates or explore other opportunities.`,
          meta: {
            interviewId: interview.id,
            companyName: interview.application.job.company.user.name,
            jobTitle: interview.application.job.title,
          },
          user: interview.application.applicant.user,
        },
        manager,
      );

      return {
        data: {
          id: Ncancel.id,
          reason: Ncancel.reason,
          cancelBy: Ncancel.cancelBy,
          createdAt: Ncancel.createdAt,
        },
      };
    });
  }

  public async getApplicantInterviews(userId: string) {
    const interviews = await this.interviewRepository
      .createQueryBuilder("interview")
      .leftJoin("interview.application", "application")
      .leftJoin("application.job", "job")
      .leftJoin("job.company", "company")
      .leftJoin("company.user", "userC")
      .leftJoin("application.applicant", "applicant")
      .leftJoin("applicant.user", "user")
      .leftJoinAndSelect("interview.feedback", "feedback")
      .leftJoinAndSelect("interview.CancelInterview", "cancel")

      .where("user.id = :userId", { userId })

      .select([
        "interview",

        "application",

        "job.id",
        "job.title",

        "company.id",
        "userC.name",

        "feedback",

        "cancel",
      ])

      .getMany();

    if (!interviews)
      throw new BadRequestException("there is no interview for this applicant");

    return { data: { interviews } };
  }

  public async getInterviewStatsWithCompany(companyId: string) {
    const total = await this.totalCompany(companyId);

    const todayInterview = await this.todayInterviewCompany(companyId);

    const upcoming = await this.upcomingCompany(companyId);

    const completed = await this.completeCompany(companyId);

    return {
      data: {
        total,
        todayInterview,
        upcoming,
        completed,
      },
    };
  }

  public async getInterviewStatsWithApplicant(applicantId: string) {
    const total = await this.totalApplicant(applicantId);

    const todayInterview = await this.todayInterviewApplicant(applicantId);

    const upcoming = await this.upcomingApplicant(applicantId);

    const completed = await this.completeApplicant(applicantId);

    return {
      data: {
        total,
        todayInterview,
        upcoming,
        completed,
      },
    };
  }

  private async checkInterviewConflict(
    companyId: string,
    scheduledAt: Date,
    durationMin: number,
  ) {
    const start = new Date(scheduledAt);
    const end = new Date(start.getTime() + durationMin * 60000);

    const conflict = await this.interviewRepository
      .createQueryBuilder("interview")
      .leftJoin("interview.application", "application")
      .leftJoin("application.job", "job")
      .leftJoin("job.company", "company")
      .where("company.id= :companyId", { companyId })
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

    console.log(conflict);
    if (conflict) {
      const formattedStart = new Date(conflict.scheduledAt).toLocaleString(
        "en-EG",
        { timeZone: "Africa/Cairo" },
      );

      const formattedEnd = new Date(
        conflict.scheduledAt.getTime() + durationMin * 60000,
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

  private totalCompany(companyId: string) {
    return this.jobApplicantRepository
      .createQueryBuilder("jobApply")
      .leftJoin("jobApply.job", "job")
      .leftJoin("job.company", "company")
      .leftJoin("jobApply.interviews", "interview")
      .where("company.id = :companyId", { companyId })
      .andWhere("interview.id IS NOT NULL")
      .getCount();
  }

  private todayInterviewCompany(companyId: string) {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    return this.interviewRepository
      .createQueryBuilder("interview")
      .leftJoin("interview.application", "application")
      .leftJoin("application.job", "job")
      .leftJoin("job.company", "company")
      .where("company.id = :companyId", { companyId })
      .andWhere("interview.scheduledAt BETWEEN :start AND :end", {
        start: startOfDay,
        end: endOfDay,
      })
      .getCount();
  }

  private upcomingCompany(companyId: string) {
    return this.interviewRepository
      .createQueryBuilder("interview")
      .leftJoin("interview.application", "application")
      .leftJoin("application.job", "job")
      .leftJoin("job.company", "company")
      .where("company.id = :companyId", { companyId })
      .andWhere("interview.status IN (:...statuses)", {
        statuses: [InterviewStatus.SCHEDULED, InterviewStatus.RESCHEDULED],
      })
      .getCount();
  }

  private completeCompany(companyId: string) {
    return this.interviewRepository
      .createQueryBuilder("interview")
      .leftJoin("interview.application", "application")
      .leftJoin("application.job", "job")
      .leftJoin("job.company", "company")
      .where("company.id = :companyId", { companyId })
      .andWhere("interview.status = :status", {
        status: InterviewStatus.COMPLETED,
      })
      .getCount();
  }

  private totalApplicant(applicantId: string) {
    return this.jobApplicantRepository
      .createQueryBuilder("jobApply")
      .leftJoin("jobApply.applicant", "applicant")
      .leftJoin("jobApply.interviews", "interview")
      .where("applicant.id = :applicantId", { applicantId })
      .andWhere("interview.id IS NOT NULL")
      .getCount();
  }

  private todayInterviewApplicant(applicantId: string) {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    return this.interviewRepository
      .createQueryBuilder("interview")
      .leftJoin("interview.application", "application")
      .leftJoin("application.applicant", "applicant")
      .where("applicant.id = :applicantId", { applicantId })
      .andWhere("interview.scheduledAt BETWEEN :start AND :end", {
        start: startOfDay,
        end: endOfDay,
      })
      .getCount();
  }

  private upcomingApplicant(applicantId: string) {
    return this.interviewRepository
      .createQueryBuilder("interview")
      .leftJoin("interview.application", "application")
      .leftJoin("application.applicant", "applicant")
      .where("applicant.id = :applicantId", { applicantId })
      .andWhere("interview.status IN (:...statuses)", {
        statuses: [InterviewStatus.SCHEDULED, InterviewStatus.RESCHEDULED],
      })
      .getCount();
  }

  private completeApplicant(applicantId: string) {
    return this.interviewRepository
      .createQueryBuilder("interview")
      .leftJoin("interview.application", "application")
      .leftJoin("application.applicant", "applicant")
      .where("applicant.id = :applicantId", { applicantId })
      .andWhere("interview.status = :status", {
        status: InterviewStatus.COMPLETED,
      })
      .getCount();
  }
}
