import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./user.entity";
import { EntityManager, Repository } from "typeorm";
import { RoleUser } from "src/Shared/Enums/user.enum";
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
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

  public findUserByIdWithToken(userId: string) {
    return this.userRepository
      .createQueryBuilder("user")
      .addSelect("user.refreshToken")
      .where("user.id = :userId", { userId })
      .getOne();
  }

  public updateAuth(
    userId: string,
    data: { role?: RoleUser; refreshToken: string },
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
}
