
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { User } from '../users/entities/user.entity';
import { NotificationType } from '../common/enums/notification-type.enum';

interface CreateNotificationParams {
  recipient: User;
  actor: User | null;
  type: NotificationType;
  entityId?: string | null;
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationsRepository: Repository<Notification>,
  ) {}

  async create(params: CreateNotificationParams): Promise<Notification> {
    if (params.actor && params.actor.id === params.recipient.id) {
      return null as any;
    }

    const notification = this.notificationsRepository.create({
      recipient: params.recipient,
      actor: params.actor,
      type: params.type,
      entityId: params.entityId ?? null,
      read: false,
    });
    return this.notificationsRepository.save(notification);
  }

  async findAllForUser(userId: string): Promise<Notification[]> {
    return this.notificationsRepository.find({
      where: { recipient: { id: userId } },
      relations: ['actor'],
      order: { createdAt: 'DESC' },
    });
  }

  async countUnreadForUser(userId: string): Promise<number> {
    return this.notificationsRepository.count({
      where: { recipient: { id: userId }, read: false },
    });
  }

  async markAsRead(user: User, notificationId: string): Promise<Notification> {
    const notification = await this.notificationsRepository.findOne({
      where: { id: notificationId },
      relations: ['recipient'],
    });
    if (!notification) {
      throw new NotFoundException('Notification introuvable.');
    }
    if (notification.recipient.id !== user.id) {
      throw new ForbiddenException('Cette notification ne vous appartient pas.');
    }
    notification.read = true;
    return this.notificationsRepository.save(notification);
  }

  async markAllAsRead(user: User): Promise<{ updated: number }> {
    const result = await this.notificationsRepository.update(
      { recipient: { id: user.id }, read: false },
      { read: true },
    );
    return { updated: result.affected ?? 0 };
  }

  async remove(user: User, notificationId: string): Promise<void> {
    const notification = await this.notificationsRepository.findOne({
      where: { id: notificationId },
      relations: ['recipient'],
    });
    if (!notification) {
      throw new NotFoundException('Notification introuvable.');
    }
    if (notification.recipient.id !== user.id) {
      throw new ForbiddenException('Cette notification ne vous appartient pas.');
    }
    await this.notificationsRepository.remove(notification);
  }
}

