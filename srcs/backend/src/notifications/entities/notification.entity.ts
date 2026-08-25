
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { NotificationType } from '../../common/enums/notification-type.enum';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @ManyToOne(() => User, (user) => user.notifications, {
    onDelete: 'CASCADE',
  })
  recipient!: User;

  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  actor!: User | null;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type!: NotificationType;

  @Column({ type: 'uuid', nullable: true })
  entityId!: string | null;

  @Column({ type: 'boolean', default: false })
  read!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
}

