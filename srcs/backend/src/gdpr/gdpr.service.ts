import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../users/entities/user.entity';
import { Post } from '../posts/entities/post.entity';
import { Comment } from '../comments/entities/comment.entity';
import { PostLike } from '../likes/entities/post-like.entity';
import { CommentLike } from '../likes/entities/comment-like.entity';
import { Friendship } from '../friends/entities/friends.entity';
import { GameResult } from '../games/entities/game-result.entity';
import { Notification } from '../notifications/entities/notification.entity';
import { Message } from '../chat/entities/message.entity';
import { MailerService } from '../mailer/mailer.service';

@Injectable()
export class GdprService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @InjectRepository(Post) private readonly postsRepository: Repository<Post>,
    @InjectRepository(Comment) private readonly commentsRepository: Repository<Comment>,
    @InjectRepository(PostLike) private readonly postLikesRepository: Repository<PostLike>,
    @InjectRepository(CommentLike) private readonly commentLikesRepository: Repository<CommentLike>,
    @InjectRepository(Friendship) private readonly friendshipsRepository: Repository<Friendship>,
    @InjectRepository(GameResult) private readonly gameResultsRepository: Repository<GameResult>,
    @InjectRepository(Notification) private readonly notificationsRepository: Repository<Notification>,
    @InjectRepository(Message) private readonly messagesRepository: Repository<Message>,
    private readonly mailerService: MailerService,
  ) {}

  async exportUserData(userId: string) {
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('Utilisateur introuvable.');

    const [
      posts,
      comments,
      postLikes,
      commentLikes,
      sentFriendships,
      receivedFriendships,
      gameResults,
      notifications,
      sentMessages,
    ] = await Promise.all([
      this.postsRepository.find({ where: { author: { id: userId } }, order: { createdAt: 'DESC' } }),
      this.commentsRepository.find({ where: { author: { id: userId } }, relations: ['post'], order: { createdAt: 'DESC' } }),
      this.postLikesRepository.find({ where: { user: { id: userId } }, relations: ['post'] }),
      this.commentLikesRepository.find({ where: { user: { id: userId } }, relations: ['comment'] }),
      this.friendshipsRepository.find({ where: { sender: { id: userId } }, relations: ['receiver'] }),
      this.friendshipsRepository.find({ where: { receiver: { id: userId } }, relations: ['sender'] }),
      this.gameResultsRepository.find({ where: [{ playerXId: userId }, { playerOId: userId }], order: { createdAt: 'DESC' } }),
      this.notificationsRepository.find({ where: { recipient: { id: userId } }, order: { createdAt: 'DESC' } }),
      this.messagesRepository.find({ where: { sender: { id: userId } }, order: { createdAt: 'DESC' } }),
    ]);

    // Best-effort notification — never blocks the export itself.
    this.mailerService.sendDataExportConfirmation(user.email, user.username).catch(() => {});

    return {
      exportedAt: new Date().toISOString(),
      profile: {
        id: user.id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        avatar: user.avatar,
        status: user.status,
        role: user.role,
        wins: user.wins,
        losses: user.losses,
        draws: user.draws,
        level: user.level,
        xp: user.xp,
        eloRating: user.eloRating,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      posts: posts.map((p) => ({ id: p.id, content: p.content, createdAt: p.createdAt })),
      comments: comments.map((c) => ({ id: c.id, content: c.content, postId: c.post?.id, createdAt: c.createdAt })),
      likesGiven: {
        posts: postLikes.map((l) => ({ postId: l.post?.id, likedAt: l.createdAt })),
        comments: commentLikes.map((l) => ({ commentId: l.comment?.id, likedAt: l.createdAt })),
      },
      friendships: {
        sent: sentFriendships.map((f) => ({ id: f.id, withUsername: f.receiver?.username, status: f.status, createdAt: f.createdAt })),
        received: receivedFriendships.map((f) => ({ id: f.id, withUsername: f.sender?.username, status: f.status, createdAt: f.createdAt })),
      },
      gameHistory: gameResults.map((g) => ({
        id: g.id,
        result: g.result,
        wasPlayerX: g.playerXId === userId,
        won: g.winnerId === userId,
        createdAt: g.createdAt,
      })),
      notificationsReceived: notifications.map((n) => ({ id: n.id, type: n.type, read: n.read, createdAt: n.createdAt })),
      messagesSent: sentMessages.map((m) => ({ id: m.id, content: m.content, createdAt: m.createdAt })),
    };
  }
}
