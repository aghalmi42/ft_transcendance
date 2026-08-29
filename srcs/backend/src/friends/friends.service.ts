
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Friendship } from './entities/friends.entity';
import { User } from '../users/entities/user.entity';
import { FriendshipStatus } from 'src/common/enums/friendship-status.enum';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../common/enums/notification-type.enum';

@Injectable()
export class FriendsService {
  constructor(
    @InjectRepository(Friendship)
    private readonly friendshipsRepository: Repository<Friendship>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async sendFriendRequest(sender: User, receiverId: string) {
    if (sender.id === receiverId) {
      throw new BadRequestException("Vous ne pouvez pas vous ajouter vous-même.");
    }

    const receiver = await this.userRepository.findOneBy({ id: receiverId });
    if (!receiver) {
      throw new NotFoundException("Utilisateur non trouvé.");
    }

    const existingRequest = await this.friendshipsRepository.findOne({
      where: [
        { sender: { id: sender.id }, receiver: { id: receiverId } },
        { sender: { id: receiverId }, receiver: { id: sender.id } },
      ],
    });

    if (existingRequest) {
      throw new BadRequestException("Une demande ou une relation existe déjà.");
    }

    const friendship = this.friendshipsRepository.create({
      sender,
      receiver,
      status: FriendshipStatus.PENDING,
    });

    const saved = await this.friendshipsRepository.save(friendship);

    await this.notificationsService.create({
      recipient: receiver,
      actor: sender,
      type: NotificationType.FRIEND_REQUEST,
      entityId: saved.id,
    });

    return saved;
  }

  async acceptFriendRequest(user: User, requestId: string) {
    const friendship = await this.friendshipsRepository.findOne({
      where: { id: requestId, receiver: { id: user.id } },
      relations: ['sender'],
    });

    if (!friendship) {
      throw new NotFoundException("Demande d'ami introuvable.");
    }

    friendship.status = FriendshipStatus.ACCEPTED;
    const saved = await this.friendshipsRepository.save(friendship);

    await this.notificationsService.create({
      recipient: friendship.sender,
      actor: user,
      type: NotificationType.FRIEND_ACCEPTED,
      entityId: saved.id,
    });

    return saved;
  }

  async declineFriendRequest(user: User, requestId: string) {
    const friendship = await this.friendshipsRepository.findOne({
      where: { id: requestId, receiver: { id: user.id }, status: FriendshipStatus.PENDING },
    });

    if (!friendship) {
      throw new NotFoundException("Demande d'ami introuvable.");
    }

    await this.friendshipsRepository.remove(friendship);
    return { success: true };
  }

  async removeFriend(userId: string, friendId: string) {
    const friendship = await this.friendshipsRepository.findOne({
      where: [
        { sender: { id: userId }, receiver: { id: friendId }, status: FriendshipStatus.ACCEPTED },
        { sender: { id: friendId }, receiver: { id: userId }, status: FriendshipStatus.ACCEPTED },
      ],
    });

    if (!friendship) {
      throw new NotFoundException('Relation amicale introuvable.');
    }

    const removedUser = await this.userRepository.findOneBy({ id: friendId });

    await this.friendshipsRepository.remove(friendship);

    // Notify the other person that the friendship was ended (a deletion action,
    // so the notification system covers create / update / delete).
    if (removedUser) {
      await this.notificationsService
        .create({
          recipient: removedUser,
          actor: { id: userId } as User,
          type: NotificationType.FRIEND_REMOVED,
          entityId: userId,
        })
        .catch(() => undefined);
    }

    return { success: true };
  }

  async getFriendsList(userId: string) {
    const friendships = await this.friendshipsRepository.find({
      where: [
        { sender: { id: userId }, status: FriendshipStatus.ACCEPTED },
        { receiver: { id: userId }, status: FriendshipStatus.ACCEPTED },
      ],
      relations: ['sender', 'receiver'],
    });

    return friendships.map((f) => (f.sender.id === userId ? f.receiver : f.sender));
  }
}