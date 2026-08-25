import { DataSource } from 'typeorm';
import { User } from './src/users/entities/user.entity';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { Friendship } from './src/friends/entities/friends.entity';
import { Post } from './src/posts/entities/post.entity';
import { Comment } from './src/comments/entities/comment.entity';
import { GameResult } from './src/games/entities/game-result.entity';

dotenv.config({
  path: path.resolve(__dirname, '../.env'),
});

export const AppDataSource = new DataSource({
  type: 'postgres',

  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),

  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,

  entities: [
    User,Friendship, Post, Comment, GameResult
  ],

  migrations: [
    'src/database/migrations/*.ts',
  ],

  synchronize: false,
});