import {
  Entity,
  Column,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Site } from '../sites/sites.entity';
import { ReefCheckSite } from '../reef-check-sites/reef-check-sites.entity';
import { ReefCheckOrganism } from '../reef-check-organisms/reef-check-organisms.entity';

@Entity()
export class ReefCheckSurvey {
  @ApiProperty()
  @PrimaryColumn()
  id: string;

  @ApiProperty()
  @Column()
  siteId: number;

  @ApiProperty()
  @ManyToOne(() => Site, { nullable: false })
  @JoinColumn({ name: 'site_id' })
  @Index()
  site: Site;

  @ApiProperty()
  @Column()
  reefCheckSiteId: string;

  @ApiProperty()
  @ManyToOne(() => ReefCheckSite, { nullable: false })
  @JoinColumn({ name: 'reef_check_site_id' })
  @Index()
  reefCheckSite: ReefCheckSite;

  @ApiProperty()
  @OneToMany(() => ReefCheckOrganism, (organism) => organism.surveyId)
  organisms: ReefCheckOrganism[];

  @ApiProperty()
  @Column({ nullable: true })
  date: Date;

  @ApiProperty()
  @Column({ nullable: true })
  errors: string;

  @ApiProperty()
  @Column('float', { nullable: true })
  depth: number;

  @ApiProperty()
  @Column({ nullable: true })
  timeOfDayWorkBegan: string;

  @ApiProperty()
  @Column({ nullable: true })
  timeOfDayWorkEnded: string;

  @ApiProperty()
  @Column({ nullable: true })
  methodUsedToDetermineLocation: string;

  @ApiProperty()
  @Column({ nullable: true })
  riverMouthWidth: string;

  @ApiProperty()
  @Column({ nullable: true })
  weather: string;

  @ApiProperty()
  @Column('float')
  airTemp: number;

  @ApiProperty()
  @Column('float')
  waterTempAtSurface: number;

  @ApiProperty()
  @Column('float')
  waterTempAt3M: number;

  @ApiProperty()
  @Column('float')
  waterTempAt10M: number;

  @ApiProperty()
  @Column('float')
  approxPopnSizeX1000: number;

  @ApiProperty()
  @Column('float')
  horizontalVisibilityInWater: number;

  @ApiProperty()
  @Column({ nullable: true })
  bestReefArea: string;

  @ApiProperty()
  @Column({ nullable: true })
  whyWasThisSiteSelected: string;

  @ApiProperty()
  @Column({ nullable: true })
  shelteredOrExposed: string;

  @ApiProperty()
  @Column({ nullable: true })
  anyMajorStormsInLastYears: string;

  @ApiProperty()
  @Column({ nullable: true })
  whenStorms: string;

  @ApiProperty()
  @Column({ nullable: true })
  overallAnthroImpact: string;

  @ApiProperty()
  @Column({ nullable: true })
  whatKindOfImpacts: string;

  @ApiProperty()
  @Column({ nullable: true })
  siltation: string;

  @ApiProperty()
  @Column({ nullable: true })
  dynamiteFishing: string;

  @ApiProperty()
  @Column({ nullable: true })
  poisonFishing: string;

  @ApiProperty()
  @Column({ nullable: true })
  aquariumFishCollection: string;

  @ApiProperty()
  @Column({ nullable: true })
  harvestOfInvertsForFood: string;

  @ApiProperty()
  @Column({ nullable: true })
  harvestOfInvertsForCurio: string;

  @ApiProperty()
  @Column({ nullable: true })
  touristDivingSnorkeling: string;

  @ApiProperty()
  @Column({ nullable: true })
  sewagePollution: string;

  @ApiProperty()
  @Column({ nullable: true })
  industrialPollution: string;

  @ApiProperty()
  @Column({ nullable: true })
  commercialFishing: string;

  @ApiProperty()
  @Column({ nullable: true })
  liveFoodFishing: string;

  @ApiProperty()
  @Column({ nullable: true })
  artisinalRecreational: string;

  @ApiProperty()
  @Column({ nullable: true })
  otherFormsOfFishing: string;

  @ApiProperty()
  @Column({ nullable: true })
  otherFishing: string;

  @ApiProperty()
  @Column({ nullable: true })
  yachts: string;

  @ApiProperty()
  @Column({ nullable: true })
  levelOfOtherImpacts: string;

  @ApiProperty()
  @Column({ nullable: true })
  otherImpacts: string;

  @ApiProperty()
  @Column({ nullable: true })
  isSiteProtected: string;

  @ApiProperty()
  @Column({ nullable: true })
  isProtectionEnforced: string;

  @ApiProperty()
  @Column({ nullable: true })
  levelOfPoaching: string;

  @ApiProperty()
  @Column({ nullable: true })
  spearfishing: string;

  @ApiProperty()
  @Column({ nullable: true })
  bannedCommercialFishing: string;

  @ApiProperty()
  @Column({ nullable: true })
  recreationalFishing: string;

  @ApiProperty()
  @Column({ nullable: true })
  invertebrateShellCollection: string;

  @ApiProperty()
  @Column({ nullable: true })
  anchoring: string;

  @ApiProperty()
  @Column({ nullable: true })
  diving: string;

  @ApiProperty()
  @Column({ nullable: true })
  otherSpecify: string;

  @ApiProperty()
  @Column({ nullable: true })
  natureOfProtection: string;

  @ApiProperty()
  @Column({ nullable: true })
  siteComments: string;

  @ApiProperty()
  @Column({ nullable: true })
  substrateComments: string;

  @ApiProperty()
  @Column({ nullable: true })
  fishComments: string;

  @ApiProperty()
  @Column({ nullable: true })
  invertsComments: string;

  @ApiProperty()
  @Column({ nullable: true })
  commentsFromOrganismSheet: string;

  @ApiProperty()
  @Column({ nullable: true })
  grouperSize: string;

  @ApiProperty()
  @Column({ nullable: true })
  percentBleaching: string;

  @ApiProperty()
  @Column({ nullable: true })
  percentColoniesBleached: string;

  @ApiProperty()
  @Column({ nullable: true })
  percentOfEachColony: string;

  @ApiProperty()
  @Column({ nullable: true })
  suspectedDisease: string;

  @ApiProperty()
  @Column({ nullable: true })
  rareAnimalsDetails: string;

  @ApiProperty()
  @Column({ nullable: true })
  submittedBy: string;
}
