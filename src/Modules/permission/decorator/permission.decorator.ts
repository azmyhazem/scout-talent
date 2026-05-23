import { SetMetadata } from '@nestjs/common';

export const PERMISSION_KEY = 'permission';

// Use this decorator on any route you want to protect
export const RequirePermission = (permissionName: string) =>
  SetMetadata(PERMISSION_KEY, permissionName);