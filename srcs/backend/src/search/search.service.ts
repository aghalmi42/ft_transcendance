
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Post } from '../posts/entities/post.entity';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
  ) {}

  async searchUsers(query: string): Promise<User[]> {
    return this.usersRepository.find({
      where: { username: ILike(`%${query}%`) },
      take: 20,
    });
  }

  async searchPosts(query: string): Promise<Post[]> {
    return this.postsRepository.find({
      where: { content: ILike(`%${query}%`) },
      relations: ['author'],
      order: { createdAt: 'DESC' },
      take: 20,
    });
  }

  async searchAll(query: string): Promise<{ users: User[]; posts: Post[] }> {
    const [users, posts] = await Promise.all([
      this.searchUsers(query),
      this.searchPosts(query),
    ]);
    return { users, posts };
  }
}

