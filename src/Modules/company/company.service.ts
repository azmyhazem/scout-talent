import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Company } from "./company.entity";
import { EntityManager, MoreThan, Repository } from "typeorm";
import { UserService } from "../Users/user.service";
import { updateCompanyDTO } from "./dto/updateCompany.dto";
import { updateoraddAboutDTO } from "./dto/about.dto";
import { JobApplicant } from "../application/job_applicant.entity";
import { CandidateStatus } from "src/Shared/Enums/candidateStatus.enum";
import { daysToMilliseconds } from "src/Shared/utils/cookie.util";
import { JobServices } from "../Job/job.service";
import { JobStatus } from "src/Shared/Enums/job.enum";

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectRepository(JobApplicant)
    private jobApplicantRepository: Repository<JobApplicant>,

    @Inject(forwardRef(() => UserService))
    private userService: UserService,

    @Inject(forwardRef(() => JobServices))
    private jobService: JobServices,
  ) {}

    public async shareLink(userId: string) {
    const company = await this.companyRepository
      .createQueryBuilder("company")
      .leftJoin("company.user", "user")
      .addSelect("user.slug")
      .where("user.id = :userId", { userId })
      .getOne();

    return { data: { slug: company?.user.slug } };
  }

  public createCompany(data: Partial<Company>, manger: EntityManager) {
    const repo = manger
      ? manger.getRepository(Company)
      : this.companyRepository;

    const company = repo.create(data);

    return repo.save(company);
  }

  public async findCompanyWithIdUser(userId: string) {
    const company = await this.companyRepository.findOne({
      where: { user: { id: userId } },
      relations: ["user"],
    });

    return company;
  }

  public async findCompanywithDetails(id: string) {
    const company = await this.companyRepository.findOne({
      where: { user: { id } },
      relations: ["specialization", "user"],
    });

    return company;
  }

  public async basicInformation(id: string) {
    const company = await this.companyRepository
      .createQueryBuilder("company")
      .leftJoin("company.user", "user")
      .where("user.id = :id", { id })
      .select([
        "company.id",
        "company.About",
        "user.name",
        "user.email",
        "user.linkedIn_profile",
        "user.location",
      ])
      .getOne();

    return company;
  }

  public async updateProfile(dto: updateCompanyDTO, id: string) {
    const company = await this.companyRepository.findOne({
      where: { user: { id } },
      relations: ["user"],
    });

    if (!company) throw new BadRequestException("no user found");

    await this.userService.updateData(company.user.id, dto);

    return true;
  }

  public async addorupdateAbout(dto: updateoraddAboutDTO, id: string) {
    const company = await this.companyRepository.findOne({
      where: { user: { id } },
    });

    if (!company) throw new BadRequestException("no company found");

    const { About } = dto;

    if (About) {
      company.About = About;

      await this.companyRepository.save(company);
    }

    return company.About;
  }

  public async profileCompleteCompany(id: string) {
    const company = await this.companyRepository.findOne({
      where: { user: { id } },
      relations: ["user"],
    });

    if (!company) throw new BadRequestException("no user found");

    let percentage = 0;
    let basicInfo = false;

    if (
      company.user.name &&
      company.user.location &&
      company.user.linkedIn_profile
    ) {
      percentage += 40;
      basicInfo = true;
    }

    const AboutCompleted = company.About?.trim();

    const specializationsCompleted = company.specialization.length > 0;

    if (AboutCompleted) percentage += 30;

    if (specializationsCompleted) percentage += 30;

    return {
      percentage,
      sections: {
        basicInfo,
        AboutCompleted,
        specializationsCompleted,
      },
    };
  }

  public async dashboardStatisticsCompany(id: string) {
    const company = await this.companyRepository.findOne({
      where: { user: { id } },
      relations: ["user"],
    });

    if (!company) throw new BadRequestException("no user found");

    const activeJobs = await this.jobService.activeJobs(company.id);

    const totalCandidates = await this.totalCandidates(company.id);

    const avgTimeToHireDays = await this.avgTimeToHireDays(company.id);

    const offersSent = await this.offersSentCount(company.id);

    const hired = await this.hiredCount(company.id);

    return {
      activeJobs,
      totalCandidates,
      avgTimeToHireDays,
      offersSent,
      hired,
    };
  }

  public async GetAllJobsByCompany(id: string, q?: JobStatus) {
    const company = await this.companyRepository.findOne({
      where: { user: { id } },
      relations: ["user"],
    });

    if (!company) throw new BadRequestException("no user found");

    return this.jobService.GetAllJobsByCompany(company.id, q);
  }

  public async deleteAccount(id: string) {
    await this.userService.deleteAccount(id);

    return { message: "Account deleted successfully" };
  }

  private totalCandidates(companyId: string): Promise<number> {
    return this.jobApplicantRepository.count({
      where: {
        job: { company: { id: companyId } },
        createdAt: MoreThan(this.getDateBeforeMonths(3)),
      },
    });
  }

  private offersSentCount(companyId: string): Promise<number> {
    return this.jobApplicantRepository.count({
      where: {
        job: { company: { id: companyId } },
        createdAt: MoreThan(this.getDateBeforeMonths(3)),
        status: CandidateStatus.OFFERED,
      },
    });
  }

  private async avgTimeToHireDays(companyId: string): Promise<number> {
    const jobHired = await this.jobApplicantRepository
      .createQueryBuilder("applicant")
      .leftJoinAndSelect("applicant.job", "job")
      .leftJoin("job.company", "company")
      .where("company.id = :companyId", { companyId })
      .andWhere("applicant.status = :status", { status: CandidateStatus.HIRED })
      .andWhere("job.createdAt > :date", {
        date: this.getDateBeforeMonths(3),
      })
      .getMany();

    let totalDays = 0;

    for (const job of jobHired) {
      const hired = job.hiredAt.getTime();
      const created = job.job.createdAt.getTime();

      const diffDays = (hired - created) / daysToMilliseconds(1);

      totalDays += diffDays;
    }

    return jobHired.length ? totalDays / jobHired.length : 0;
  }

  private hiredCount(companyId: string): Promise<number> {
    return this.jobApplicantRepository.count({
      where: {
        job: { company: { id: companyId } },
        createdAt: MoreThan(this.getDateBeforeMonths(3)),
        status: CandidateStatus.HIRED,
      },
    });
  }

  private getDateBeforeMonths(month: number) {
    const date = new Date();

    date.setMonth(date.getMonth() - month);

    return date;
  }
}
