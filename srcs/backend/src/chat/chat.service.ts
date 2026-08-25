
import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { User } from '../users/entities/user.entity';
import { SendMessageDto } from './dto/send-message.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../common/enums/notification-type.enum';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationsRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private readonly messagesRepository: Repository<Message>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly notificationsService: NotificationsService,
  ) {}

  private orderUsers(u1: User, u2: User): { userA: User; userB: User } {
    return u1.id < u2.id
      ? { userA: u1, userB: u2 }
      : { userA: u2, userB: u1 };
  }

  async findOrCreateConversation(currentUser: User, otherUserId: string): Promise<Conversation> {
    if (currentUser.id === otherUserId) {
      throw new BadRequestException("Vous ne pouvez pas discuter avec vous-même.");
    }

    const otherUser = await this.usersRepository.findOneBy({ id: otherUserId });
    if (!otherUser) {
      throw new NotFoundException("Utilisateur non trouvé.");
    }

    const { userA, userB } = this.orderUsers(currentUser, otherUser);

    let conversation = await this.conversationsRepository.findOne({
      where: { userA: { id: userA.id }, userB: { id: userB.id } },
      relations: ['userA', 'userB'],
    });

    if (conversation) {
      return conversation;
    }

    conversation = this.conversationsRepository.create({ userA, userB });
    return this.conversationsRepository.save(conversation);
  }

  async findMyConversations(userId: string): Promise<Conversation[]> {
    return this.conversationsRepository.find({
      where: [
        { userA: { id: userId } },
        { userB: { id: userId } },
      ],
      relations: ['userA', 'userB'],
      order: { updatedAt: 'DESC' },
    });
  }

  async findConversationById(user: User, conversationId: string): Promise<Conversation> {
    const conversation = await this.conversationsRepository.findOne({
      where: { id: conversationId },
      relations: ['userA', 'userB'],
    });
    if (!conversation) {
      throw new NotFoundException('Conversation introuvable.');
    }
    if (conversation.userA.id !== user.id && conversation.userB.id !== user.id) {
      throw new ForbiddenException("Vous n'êtes pas participant de cette conversation.");
    }
    return conversation;
  }

  async findMessages(user: User, conversationId: string): Promise<Message[]> {
    await this.findConversationById(user, conversationId);

    return this.messagesRepository.find({
      where: { conversation: { id: conversationId } },
      relations: ['sender'],
      order: { createdAt: 'ASC' },
    });
  }

  async sendMessage(
    sender: User,
    conversationId: string,
    dto: SendMessageDto,
  ): Promise<Message> {
    const conversation = await this.findConversationById(sender, conversationId);

    const message = this.messagesRepository.create({
      content: dto.content,
      sender,
      conversation,
    });
    const saved = await this.messagesRepository.save(message);

    conversation.updatedAt = new Date();
    await this.conversationsRepository.save(conversation);

    const recipient = conversation.userA.id === sender.id
      ? conversation.userB
      : conversation.userA;

    await this.notificationsService.create({
      recipient,
      actor: sender,
      type: NotificationType.MESSAGE,
      entityId: conversation.id,
    });

    return saved;
  }

  async markAsRead(user: User, conversationId: string): Promise<{ updated: number }> {
    await this.findConversationById(user, conversationId);

    const result = await this.messagesRepository
      .createQueryBuilder()
      .update(Message)
      .set({ read: true })
      .where('conversationId = :convId', { convId: conversationId })
      .andWhere('senderId != :userId', { userId: user.id })
      .andWhere('read = false')
      .execute();

    return { updated: result.affected ?? 0 };
  }
}

