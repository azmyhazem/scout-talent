import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Job } from "./job.entity";
import { MoreThan, Repository } from "typeorm";
import { addJobDTO } from "./dto/addJob.dto";
import { updateJobDTO } from "./dto/updateJob.dto";
import { JobStatus } from "src/Shared/Enums/job.enum";
import { jobStatusDTO } from "./dto/statusJob.dto";
import { CompanyService } from "../company/company.service";

@Injectable()
export class JobServices {
  constructor(
    @InjectRepository(Job) private jobRepository: Repository<Job>,
    @Inject(forwardRef(() => CompanyService))
    private companyService: CompanyService,
  ) {}

  public async findJob(id: string) {
    return this.jobRepository.findOne({
      where: { id, status: JobStatus.PUBLISHED },
    });
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
      status,
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
    } = dto;

    const now = Date.now();
    const deadline = new Date(dto.deadline);

    if (deadline.getTime() <= now) {
      throw new BadRequestException("the deadline must be in the future");
    }

    const Njob = this.jobRepository.create({
      title,
      description,
      location,
      minSalary,
      maxSalary,
      status,
      requirements,
      type,
      workMode,
      skills,
      responsibilities,
      company,
      positions,
      maxApplications,
      deadline,
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

  
  public async GetAllJobsByCompany(companyId: string, q?: JobStatus) {
    const jobs = this.jobRepository
      .createQueryBuilder("job")
      .leftJoin("job.company", "company")
      .where("company.id = :companyId", { companyId });

    if (q) {
      jobs.andWhere("job.status = :q", { q });
    }

    return await jobs.getMany();
  }

  /**
   * get job's id
   * @param id
   * @returns job
   */
  public async getJob(id: string) {
    const job = await this.jobRepository.findOne({ where: { id } });

    if (!job) {
      throw new BadRequestException("not found job");
    }
    return job;
  }

  public async updateJob(companyId: string, id: string, dto: updateJobDTO) {
    const job = await this.jobRepository.findOne({
      where: {
        id,
        company: {
          id: companyId,
        },
      },
    });

    if (!job) {
      throw new BadRequestException("not found job");
    }

    await this.jobRepository.update(id, dto);

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
        company: { id: companyId },
      },
    });

    if (!job) throw new BadRequestException("no job found");

    const { status } = dto;
    job.status = status;

    await this.jobRepository.save(job);

    return job;
  }

  private getDateBeforeMonths(month: number) {
    const date = new Date();

    date.setMonth(date.getMonth() - month);

    return date;
  }
}
