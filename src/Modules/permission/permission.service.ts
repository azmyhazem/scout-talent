import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Permission } from "./permission.entity";
import { In, Repository } from "typeorm";

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {}

  getAll() {
    return this.permissionRepository.find();
  }

  async getPermissionsByIds(permissionIds: string[]) {
    return await this.permissionRepository.findBy({
      id: In(permissionIds),
    });
  }
}
