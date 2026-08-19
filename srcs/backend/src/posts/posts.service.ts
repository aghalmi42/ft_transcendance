import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { User } from '../users/entities/user.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(author: User, createPostDto: CreatePostDto): Promise<Post> {
    const post = this.postsRepository.create({
      content: createPostDto.content,
      author,
    });
    return this.postsRepository.save(post);
  }

  findAll(): Promise<Post[]> {
    return this.postsRepository.find({
      relations: ['author'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOneById(id: string): Promise<Post> {
    const post = await this.postsRepository.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!post) {
      throw new NotFoundException('Post introuvable.');
    }
    return post;
  }

  async findAllByUser(userId: string): Promise<Post[]> {
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé.');
    }
    return this.postsRepository.find({
      where: { author: { id: userId } },
      relations: ['author'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(user: User, id: string, updatePostDto: UpdatePostDto): Promise<Post> {
    const post = await this.findOneById(id);
    if (post.author.id !== user.id) {
      throw new ForbiddenException('Vous ne pouvez modifier que vos propres posts.');
    }
    Object.assign(post, updatePostDto);
    return this.postsRepository.save(post);
  }

  async remove(user: User, id: string): Promise<void> {
    const post = await this.findOneById(id);
    if (post.author.id !== user.id) {
      throw new ForbiddenException('Vous ne pouvez supprimer que vos propres posts.');
    }
    await this.postsRepository.softDelete(id);
  }
}