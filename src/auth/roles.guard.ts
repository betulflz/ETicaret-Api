import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Metodun tepesindeki rolleri oku (@Roles('admin'))
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    // Eğer rol şartı yoksa herkes geçebilir
    if (!requiredRoles) {
      return true;
    }

    // 2. Request içindeki kullanıcıyı al (AuthGuard zaten user'ı buraya koymuştu)
    const { user } = context.switchToHttp().getRequest();

    // 3. Kullanıcının rolü, istenen rollerden biri mi?
    // user.role veritabanında 'customer' veya 'admin' olarak kayıtlı olmalı.
    return requiredRoles.includes(user.role);
  }
}