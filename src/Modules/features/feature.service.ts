import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { Feature } from "./feature.entity";
import { CreateFeatureDto } from "./dto/create-feature.dto";
import { Permission } from "../permission/permission.entity";
import { FeaturePermission } from "./feature-permissions.entity";
import { PermissionService } from "../permission/permission.service";
import { FeatureUsage } from "./feature-usage.entity";
import { startOfMonth, endOfMonth } from "date-fns";
import { UpdateFeatureDto } from "./dto/update-feature.dto";

@Injectable()
export class FeatureService {
  constructor(
    @InjectRepository(Feature)
    private featureRepository: Repository<Feature>,

    @InjectRepository(FeaturePermission)
    private featurePermissionRepository: Repository<FeaturePermission>,

    @InjectRepository(FeatureUsage)
    private featureUsageRepository: Repository<FeatureUsage>,

    private permissionService: PermissionService,
  ) {}

  // feature-usage.service.ts
  async increment(subscriptionId: string, planFeaturePermissionId: string) {
    const existing = await this.featureUsageRepository.findOne({
      where: {
        subscription: {
          id: subscriptionId,
        },
        planFeaturePermission: {
          id: planFeaturePermissionId,
        },
      },
    });

    if (!existing) {
      return this.featureUsageRepository.save(
        this.featureUsageRepository.create({
          usedCount: 1,
          periodStart: startOfMonth(new Date()),
          periodEnd: endOfMonth(new Date()),
          subscription: {
            id: subscriptionId,
          },
          planFeaturePermission: {
            id: planFeaturePermissionId,
          },
        }),
      );
    }

    existing.usedCount += 1;
    existing.lastUsedAt = new Date();
    return this.featureUsageRepository.save(existing);
  }

  async createFeature(dto: CreateFeatureDto) {
    const { name, description, permissionsId } = dto;

    const feat = this.featureRepository.create({ name, description });

    const feature = await this.featureRepository.save(feat);

    const permissions =
      await this.permissionService.getPermissionsByIds(permissionsId);

    // 3. create feature_permissions rows
    await this.createFeaturePermissions(feature, permissions);

    return { data: { message: "create feature successful" } };
  }

  async getAllFeature() {
    const features = await this.featureRepository.find({
      relations: ["featurePermissions", "featurePermissions.permission"],
    });

    return { data: features };
  }

  async getFeatureById(id: string) {
    const feature = await this.featureRepository.findOne({
      where: { id },
    });

    if (!feature) {
      throw new NotFoundException("Feature not found");
    }

    return { data: feature };
  }

  async update(id: string, dto: UpdateFeatureDto) {
    const { data: feature } = await this.getFeatureById(id);

    Object.assign(feature, dto);
    const newFeature = await this.featureRepository.save(feature);
    return { data: newFeature };
  }

  async delete(id: string): Promise<void> {
    const { data: feature } = await this.getFeatureById(id);

    await this.featureRepository.remove(feature);
  }

  async getFeaturePermissionsByIds(featurePermissionsId: string[]) {
    return this.featurePermissionRepository.findBy({
      id: In(featurePermissionsId),
    });
  }

  private async createFeaturePermissions(
    feature: Feature,
    permissions: Permission[],
  ) {
    const featurePermissions = permissions.map((permission) => {
      return this.featurePermissionRepository.create({
        feature,
        permission,
      });
    });

    await this.featurePermissionRepository.save(featurePermissions);
  }
}
