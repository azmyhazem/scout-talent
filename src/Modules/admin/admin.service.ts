import { Injectable } from "@nestjs/common";
import { UserService } from "../Users/user.service";
import { JobServices } from "../Job/job.service";
import { ApplicationService } from "../application/application.service";
import { PlanService } from "../plan/plan.service";
import { SubscriptionService } from "../subscription/subscription.service";
import { CreatePlanDto } from "../plan/dto/createPlan.dto";

@Injectable()
export class AdminService {
  constructor(
    private userService: UserService,
    private jobService: JobServices,
    private applicationService: ApplicationService,
    private planService: PlanService,
    private subscriptionService: SubscriptionService,
  ) {}

  public async dashboardAdmin() {
    const totalUser = await this.userService.getTotalUsers();

    const activeJobs = await this.jobService.getActiveJobs();

    const revenueMRR = 0;

    const offersSent = await this.applicationService.getOffersSent();

    const newSignupsToday = await this.userService.getSignUpTodayCount();

    const pendingVerifications = await this.userService.getPendingUsersCount();

    const hiredThisWeek = await this.applicationService.getHiredThisWeekCount();

    const rejectedToday = await this.applicationService.rejectTodayCount();

    const recentUsers = await this.userService.getRecentUsers();

    const recentJobs = await this.jobService.getRecentJobs();

    return {
      data: {
        status: { totalUser, activeJobs, revenueMRR, offersSent },
        activity: {
          newSignupsToday,
          pendingVerifications,
          hiredThisWeek,
          rejectedToday,
        },
        recentUsers,
        recentJobs,
      },
    };
  }

  public async usersList(page: number, limit: number) {
    const totalUser = await this.userService.getTotalUsers();

    const applicants = await this.userService.getApplicantUsersCount();

    const companys = await this.userService.getCompanyUsersCount();

    const deleted = await this.userService.getDeleteUsersCount();

    const ban = await this.userService.getBanUsersCount();

    const verified = await this.userService.getVerifiedUsersCount();

    const unverified = await this.userService.getPendingUsersCount();

    const skip = (page - 1) * limit;

    const users = await this.userService.getUsers(skip, limit);

    return {
      data: {
        status: {
          totalUser,
          applicants,
          companys,
          deleted,
          ban,
          verified,
          unverified,
        },

        users,

        pagination: {
          page,
          limit,
          total: totalUser,
          totalPages: Math.ceil(totalUser / limit),
        },
      },
    };
  }

  public async userDetails(userId: string) {
    const user = await this.userService.findUser(userId);

    return {
      data: user,
    };
  }

  public async banUser(userId: string) {
    await this.userService.updateIsBan(userId, true);

    return {
      data: {
        message: "User ban successfully",
      },
    };
  }

  public async unBanUser(userId: string) {
    await this.userService.updateIsBan(userId, false);

    return {
      data: {
        message: "User restored successfully",
      },
    };
  }

  public async companiesList(page: number, limit: number) {
    const totalCompanies = await this.userService.getCompanyUsersCount();

    const ban = await this.userService.getBanCompaniessCount();

    const active = await this.userService.getVerifiedCompaniesCount();

    const skip = (page - 1) * limit;

    const users = await this.userService.getCompanies(skip, limit);

    return {
      data: {
        status: {
          totalCompanies,
          ban,
          active,
        },

        users,

        pagination: {
          page,
          limit,
          total: totalCompanies,
          totalPages: Math.ceil(totalCompanies / limit),
        },
      },
    };
  }

  public async companyDetails(userId: string) {
    const user = await this.userService.findCompany(userId);

    return {
      data: user,
    };
  }

  public async jobsList(page: number, limit: number) {
    const totalJobs = await this.jobService.getAllJobsCount();

    const published = await this.jobService.getActiveJobs();

    const totalApplications =
      await this.applicationService.getApplicationCount();

    const totalHired = await this.applicationService.getHiredCount();

    const skip = (page - 1) * limit;

    const jobs = await this.jobService.getAllJobForAdmin(skip, limit);

    return {
      data: {
        status: {
          totalJobs,
          published,
          totalApplications,
          totalHired,
        },

        jobs,

        pagination: {
          page,
          limit,
          total: totalJobs,
          totalPages: Math.ceil(totalJobs / limit),
        },
      },
    };
  }

  public async jobDetails(jobId: string) {
    const job = await this.jobService.getJob(jobId);

    return {
      data: job,
    };
  }

  public async getPlans() {
    const plans = await this.planService.getAllPlan();

    const totalPlans = await this.planService.countAllPlans();
    const activePlans = await this.planService.countAllPlansActive();

    const totalSubscribers = await this.subscriptionService.countSubscription();

    const enterpriseSubscribers =
      await this.subscriptionService.countEnterpriseSubscribers();

    return {
      data: {
        plans,
        stats: {
          totalPlans,
          activePlans,
          totalSubscribers,
          enterpriseSubscribers,
        },
      },
    };
  }

  public async createPlans(dto: CreatePlanDto) {
    await this.planService.createPlan(dto);

    return {
      data: {
        message: "Plan created successfully",
      },
    };
  }

  public async getSubscription() {
    const totalSubscriptions =
      await this.subscriptionService.countSubscription();

    const proSubscribers = await this.subscriptionService.countProSubscribers();

    const enterpriseSubscribers =
      await this.subscriptionService.countEnterpriseSubscribers();

    const mrr = await this.subscriptionService.mrr();

    const subscriptions = await this.subscriptionService.allSubscription();

    return {
      data: {
        stats: {
          totalSubscriptions,
          proSubscribers,
          enterpriseSubscribers,
          mrr,
        },
        subscriptions,
      },
    };
  }
}
