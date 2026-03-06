import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AIPrompt } from './ai-prompt.entity';
import { User } from '../users/users.entity';

@Entity('ai_prompts_history')
export class AIPromptHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => AIPrompt, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'prompt_id' })
  prompt: AIPrompt;

  @Column()
  promptId: number;

  @Column()
  promptKey: string;

  @Column({ type: 'text' })
  content: string;

  @Column()
  version: number;

  @CreateDateColumn()
  changedAt: Date;

  @Column({ nullable: true })
  changedBy: number | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'changed_by' })
  changedByUser: User | null;

  @Column({ type: 'text', nullable: true })
  changeNotes: string | null;
}
