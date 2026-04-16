import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Job } from "./job.entity";
import { EntityManager, MoreThan, Repository } from "typeorm";
import { addJobDTO } from "./dto/addJob.dto";
import { updateJobDTO } from "./dto/updateJob.dto";
import { JobStatus } from "src/Shared/Enums/job.enum";
import { jobStatusDTO } from "./dto/statusJob.dto";
import { CompanyService } from "../company/company.service";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { StatusAI } from "src/Shared/Enums/statusAI.enum";

@Injectable()
export class JobServices {
  constructor(
    @InjectRepository(Job) private jobRepository: Repository<Job>,
    @Inject(forwardRef(() => CompanyService))
    private companyService: CompanyService,

    @InjectQueue("upload-job")
    private upload_job: Queue,
  ) {}

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
        'job.jobIdAi',
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
      seniority,
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
      seniority,
      responsibilities,
      company,
      positions,
      maxApplications,
      deadline,
    });

    const job = await this.jobRepository.save(Njob);

    const formattedSkills = skills.reduce(
      (acc, skill) => {
        acc[skill] = {
          level: "Intermediate", // قيمة ثابتة
        };
        return acc;
      },
      {} as Record<string, { level: string }>,
    );

    await this.upload_job.add(
      "job",
      {
        jobId: job.id,
        title,
        description: `${description}, ${requirements}, ${responsibilities.join(" | ")}`,
        seniority,
        required_skills: formattedSkills,
      },
      {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 2000,
        },
      },
    );
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
        company: { user: { id: companyId } },
      },
    });

    if (!job) throw new BadRequestException("no job found");

    const { status } = dto;
    job.status = status;

    await this.jobRepository.save(job);

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
    return repo.update(jobId, { statusAi });
  }

  private getDateBeforeMonths(month: number) {
    const date = new Date();

    date.setMonth(date.getMonth() - month);

    return date;
  }
}
