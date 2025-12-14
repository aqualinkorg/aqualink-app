import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Site } from '../sites/sites.entity';
import { User } from '../users/users.entity';

@Entity({ name: 'ai_chat_logs' })
@Index(['siteId', 'createdAt'])
export class AiChatLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'site_id' })
  @Index()
  siteId: number;

  @Column({ name: 'user_id', nullable: true })
  @Index()
  userId: number | null;

  @ManyToOne(() => Site)
  @JoinColumn({ name: 'site_id' })
  site: Site;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'text', name: 'user_message' })
  userMessage: string;

  @Column({ type: 'text', name: 'ai_response' })
  aiResponse: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
