import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';
import { AIPrompt } from './ai-prompt.entity';
import { User } from '../users/users.entity';

@Entity('ai_prompts_history')
export class AIPromptHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => AIPrompt, { onDelete: 'CASCADE' })
  prompt: AIPrompt;

  @Column({ name: 'prompt_id' })
  promptId: number;

  @Column({ name: 'prompt_key' })
  promptKey: string;

  @Column({ type: 'text' })
  content: string;

  @Column()
  version: number;

  @CreateDateColumn({ name: 'changed_at' })
  changedAt: Date;

  @Column({ name: 'changed_by', nullable: true })
  changedBy: number | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'changed_by' })
  changedByUser: User | null;

  @Column({ name: 'change_notes', type: 'text', nullable: true })
  changeNotes: string | null;
}
