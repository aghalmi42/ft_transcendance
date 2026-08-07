import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Friendship } from './entities/friends.entity';
import { User } from '../users/entities/user.entity';
import { FriendshipStatus } from 'src/common/enums/friendship-status.enum';

@Injectable()
export class FriendsService {
  constructor(
    @InjectRepository(Friendship)
    private readonly friendshipsRepository: Repository<Friendship>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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

    return this.friendshipsRepository.save(friendship);
  }

  async acceptFriendRequest(user: User, requestId: string) {
    const friendship = await this.friendshipsRepository.findOne({
      where: { id: requestId, receiver: { id: user.id } },
    });

    if (!friendship) {
      throw new NotFoundException("Demande d'ami introuvable.");
    }

    friendship.status = FriendshipStatus.ACCEPTED;
    return this.friendshipsRepository.save(friendship);
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