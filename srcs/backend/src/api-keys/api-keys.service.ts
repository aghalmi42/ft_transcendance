import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes } from 'crypto';

import { ApiKey } from './entities/api-key.entity';
import { User } from '../users/entities/user.entity';

const KEY_PREFIX = 'ftt_';

@Injectable()
export class ApiKeysService {
  constructor(
    @InjectRepository(ApiKey)
    private readonly apiKeysRepository: Repository<ApiKey>,
  ) {}

  // The raw key is only ever returned once, at creation time.
  async create(owner: User, label: string): Promise<{ id: string; key: string; label: string }> {
    const key = `${KEY_PREFIX}${randomBytes(24).toString('hex')}`;
    const apiKey = this.apiKeysRepository.create({ owner, label: label || 'Clé API', key });
    const saved = await this.apiKeysRepository.save(apiKey);
    return { id: saved.id, key: saved.key, label: saved.label };
  }

  async listForUser(userId: string): Promise<Omit<ApiKey, 'key'>[]> {
    const keys = await this.apiKeysRepository.find({
      where: { owner: { id: userId } },
      order: { createdAt: 'DESC' },
    });
    return keys.map(({ key, ...safe }) => safe);
  }

  async revoke(user: User, id: string): Promise<{ success: true }> {
    const apiKey = await this.apiKeysRepository.findOne({ where: { id }, relations: ['owner'] });
    if (!apiKey) throw new NotFoundException('Clé API introuvable.');
    if (apiKey.owner.id !== user.id) throw new ForbiddenException("Cette clé ne vous appartient pas.");
    apiKey.revoked = true;
    await this.apiKeysRepository.save(apiKey);
    return { success: true };
  }

  async validate(rawKey: string): Promise<User | null> {
    if (!rawKey || !rawKey.startsWith(KEY_PREFIX)) return null;
    const apiKey = await this.apiKeysRepository.findOne({ where: { key: rawKey }, relations: ['owner'] });
    if (!apiKey || apiKey.revoked) return null;

    apiKey.lastUsedAt = new Date();
    await this.apiKeysRepository.save(apiKey);

    return apiKey.owner;
  }
}
