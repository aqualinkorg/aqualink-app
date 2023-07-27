import {
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  RelationId,
} from 'typeorm';
import { SiteSurveyPoint } from '../site-survey-points/site-survey-points.entity';
import { Site } from '../sites/sites.entity';
import { DataUploads } from './data-uploads.entity';

@Entity()
export class DataUploadsSites {
  @ManyToOne(() => Site, { onDelete: 'CASCADE', nullable: false })
  @Index()
  @JoinColumn()
  site: Site;

  @RelationId((dataUploadsSite: DataUploadsSites) => dataUploadsSite.site)
  @PrimaryColumn()
  siteId: number;

  @ManyToOne(() => DataUploads, { onDelete: 'CASCADE', nullable: false })
  @Index()
  dataUpload: DataUploads;

  @RelationId((dataUploadsSite: DataUploadsSites) => dataUploadsSite.dataUpload)
  @PrimaryColumn()
  dataUploadId: number;

  @ManyToOne(() => SiteSurveyPoint, { onDelete: 'SET NULL', nullable: true })
  @Index()
  surveyPoint: SiteSurveyPoint | null;

  @RelationId(
    (dataUploadsSite: DataUploadsSites) => dataUploadsSite.surveyPoint,
  )
  surveyPointId?: number;
}
