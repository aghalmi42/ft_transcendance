import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ApiKeysService } from '../api-keys.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const rawKey = request.headers['x-api-key'];

    if (!rawKey || typeof rawKey !== 'string') {
      throw new UnauthorizedException('En-tête X-API-Key manquant.');
    }

    const owner = await this.apiKeysService.validate(rawKey);
    if (!owner) {
      throw new UnauthorizedException('Clé API invalide ou révoquée.');
    }

    // Downstream services expect the acting User on request.user (same
    // contract as @CurrentUser() under JWT auth).
    request.user = owner;
    return true;
  }
}
