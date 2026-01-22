import { SetMetadata } from '@nestjs/common';

// 'roles' anahtarı altında rolleri sakla (örn: ['admin', 'editor'])
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);