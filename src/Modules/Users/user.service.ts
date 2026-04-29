import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./user.entity";
import { Between, EntityManager, Repository } from "typeorm";
import { RoleUser } from "src/Shared/Enums/user.enum";
import { ApplicantService } from "../applicant/applicant.service";
import { CompanyService } from "../company/company.service";
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private applicantService: ApplicantService,
    private companyService: CompanyService,
  ) {}

  public async createUser(data: Partial<User>, manger?: EntityManager) {
    const repo = manger ? manger.getRepository(User) : this.userRepository;

    const user = repo.create(data);

    return repo.save(user);
  }

  public findUserByEmail(email: string) {
    return this.userRepository.findOne({
      where: { email },
    });
  }

  public findUserByEmailWithPassword(email: string) {
    return this.userRepository
      .createQueryBuilder("user")
      .addSelect("user.password")
      .where("user.email = :email", { email })
      .getOne();
  }

  public async findUserBySlug(slug: string) {
    const user = await this.userRepository
      .createQueryBuilder("user")
      .addSelect("user.slug")
      .where("user.slug = :slug", { slug })
      .getOne();

    if (!user) throw new BadRequestException("bot found user in this name");

    if (user.role === RoleUser.APPLICANT) {
      return this.applicantService.findApplicantwithDetails(user.id);
    }
    return this.companyService.findCompanywithDetails(user.id);
  }

  public findUserByIdWithToken(userId: string) {
    return this.userRepository
      .createQueryBuilder("user")
      .addSelect("user.refreshToken")
      .where("user.id = :userId", { userId })
      .getOne();
  }

  public updateAuth(
    userId: string,
    data: {
      role?: RoleUser;
      refreshToken: string;
      linkedIn_profile?: string;
      location?: string;
      slug?: string
    },
    manger?: EntityManager,
  ) {
    const repo = manger ? manger.getRepository(User) : this.userRepository;

    return repo.update(userId, data);
  }

  public restoreAccount(userId: string, manger: EntityManager) {
    const repo = manger ? manger.getRepository(User) : this.userRepository;

    return repo.update(userId, { isDelete: false });
  }

  public verify(userId: string, manger: EntityManager) {
    const repo = manger ? manger.getRepository(User) : this.userRepository;

    return repo.update(userId, { isEmailVerified: true });
  }

  public updatePassword(
    userId: string,
    password: string,
    manger: EntityManager,
  ) {
    const repo = manger ? manger.getRepository(User) : this.userRepository;

    return repo.update(userId, { password });
  }

  public updateData(
    userId: string,
    data: Partial<User>,
    manger?: EntityManager,
  ) {
    const repo = manger ? manger.getRepository(User) : this.userRepository;

    return repo.update(userId, data);
  }

  public async findUser(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    return user;
  }

  public async deleteAccount(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) throw new BadRequestException("no user found");

    user.isDelete = true;
    user.refreshToken = "";
    await this.userRepository.save(user);

    return { message: "Account deleted successfully" };
  }

  async getTotalUsers() {
    return this.userRepository.count();
  }

  async getRecentUsers() {
    return this.userRepository.find({
      order: {
        createAt: "DESC",
      },
      take: 10,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createAt: true,
      },
    });
  }

  async getSignUpTodayCount() {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    return this.userRepository.count({
      where: {
        createAt: Between(startOfDay, endOfDay),
      },
    });
  }

  async getVerifiedUsersCount() {
    return this.userRepository.count({
      where: { isEmailVerified: true },
    });
  }

  async getVerifiedCompaniesCount() {
    return this.userRepository.count({
      where: { role: RoleUser.COMPANY, isEmailVerified: true },
    });
  }

  async getPendingUsersCount() {
    return this.userRepository.count({
      where: { isEmailVerified: false },
    });
  }

  async getDeleteUsersCount() {
    return this.userRepository.count({
      where: { isDelete: true },
    });
  }

  async getBanUsersCount() {
    return this.userRepository.count({
      where: { isBanned: true },
    });
  }

  async getBanCompaniessCount() {
    return this.userRepository.count({
      where: { role: RoleUser.COMPANY, isBanned: true },
    });
  }

  async getApplicantUsersCount() {
    return this.userRepository.count({
      where: { role: RoleUser.APPLICANT },
    });
  }

  async getCompanyUsersCount() {
    return this.userRepository.count({
      where: { role: RoleUser.COMPANY },
    });
  }

  async getUsers(skip: number, limit: number) {
    return this.userRepository.find({ skip, take: limit });
  }

  async getCompanies(skip: number, limit: number) {
    return this.userRepository.find({
      where: { role: RoleUser.COMPANY },
      skip,
      take: limit,
    });
  }

  async updateIsBan(id: string, ban: boolean) {
    return this.userRepository.update(id, { isBanned: ban });
  }

  async findCompany(id: string) {
    const company = await this.userRepository.findOne({
      where: { id, role: RoleUser.COMPANY },
    });

    return company;
  }
}
