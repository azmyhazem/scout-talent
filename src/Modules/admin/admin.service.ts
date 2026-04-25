import { Injectable } from "@nestjs/common";
import { UserService } from "../Users/user.service";
import { JobServices } from "../Job/job.service";
import { ApplicationService } from "../application/application.service";

@Injectable()
export class AdminService {
  constructor(
    private userService: UserService,
    private jobService: JobServices,
    private applicationService: ApplicationService,
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

    const ban = await this.userService.getCompanyUsersCount();

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
}
