import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { Request } from 'express';
import { AuthRequest } from '../auth/auth.types';
import { CreateUserDto } from './dto/create-user.dto';
import { AdminLevel, User } from './users.entity';
import { SiteApplication } from '../site-applications/site-applications.entity';
import { Site } from '../sites/sites.entity';
import { Collection } from '../collections/collections.entity';
import { extractAndVerifyToken } from '../auth/firebase-auth.utils';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,

    @InjectRepository(SiteApplication)
    private siteApplicationRepository: Repository<SiteApplication>,

    @InjectRepository(Collection)
    private collectionRepository: Repository<Collection>,
  ) {}

  async create(req: Request, createUserDto: CreateUserDto): Promise<User> {
    const firebaseUser = await extractAndVerifyToken(req);
    if (!firebaseUser) {
      throw new BadRequestException('Invalid Firebase token.');
    }
    if (
      firebaseUser.email?.toLowerCase() !== createUserDto.email.toLowerCase()
    ) {
      throw new BadRequestException('Invalid user email.');
    }
    const firebaseUid = firebaseUser.uid;
    const uidExists = await this.findByFirebaseUid(firebaseUid);
    if (uidExists) {
      throw new BadRequestException(
        `User with firebaseUid ${firebaseUid} already exists.`,
      );
    }
    const { email } = firebaseUser;
    const priorAccount = await this.findByEmail(email.toLowerCase());
    if (priorAccount && priorAccount.firebaseUid) {
      throw new BadRequestException(
        `Email ${email} is already connected to a different firebaseUid.`,
      );
    }

    if (priorAccount) {
      const newUser = await this.migrateUserAssociations(priorAccount);
      // User has associations so we have to explicitly change their admin level to site manager
      if (
        newUser.administeredSites.length &&
        priorAccount.adminLevel !== AdminLevel.SuperAdmin
      ) {
        // eslint-disable-next-line fp/no-mutation
        priorAccount.adminLevel = AdminLevel.SiteManager;
        // eslint-disable-next-line fp/no-mutation
        priorAccount.administeredSites = newUser.administeredSites;
      }
    }

    const user: DeepPartial<User> = {
      ...priorAccount,
      ...createUserDto,
      adminLevel: priorAccount?.adminLevel || AdminLevel.Default,
      email: email.toLowerCase(),
      firebaseUid,
    };
    const createdUser = await this.usersRepository.save(user);

    return createdUser;
  }

  async getSelf(req: AuthRequest): Promise<User> {
    return req.user;
  }

  async getAdministeredSites(req: AuthRequest): Promise<Site[]> {
    const user = await this.usersRepository
      .createQueryBuilder('users')
      .leftJoinAndSelect('users.administeredSites', 'sites')
      .leftJoinAndSelect('sites.siteApplication', 'siteApplication')
      .where('users.id = :id', { id: req.user.id })
      .getOne();

    return (
      user!.administeredSites.map((site) => ({
        ...site,
        siteApplication: undefined,
        applied: site.applied,
      })) || []
    );
  }

  async findByEmail(email: string): Promise<User | null> {
    // Use query builder to include the firebaseUid
    return this.usersRepository
      .createQueryBuilder('users')
      .addSelect('users.firebaseUid')
      .where('email = :email', { email })
      .getOne();
  }

  async findByFirebaseUid(firebaseUid: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { firebaseUid } });
  }

  async setAdminLevel(id: number, adminLevel: AdminLevel): Promise<void> {
    const result = await this.usersRepository.update(id, { adminLevel });
    if (!result.affected) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }
  }

  async delete(id: number): Promise<void> {
    const result = await this.usersRepository.delete(id);
    if (!result.affected) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }
  }

  /**
   * Transfer the associations between the user and the sites from the site-application table
   */
  private async migrateUserAssociations(user: User) {
    const siteAssociations = await this.siteApplicationRepository.find({
      where: { user: { id: user.id } },
      relations: ['site'],
    });

    const { administeredSites: existingSites = [] } =
      (await this.usersRepository.findOne({
        where: { id: user.id },
        relations: ['administeredSites'],
      })) || {};

    const administeredSites = siteAssociations.reduce(
      (sites, siteAssociation) => {
        const { site } = siteAssociation;
        const alreadyExists = sites.some(({ id }) => site.id === id);
        return alreadyExists ? sites : sites.concat(site);
      },
      existingSites,
    );

    const newUser = {
      id: user.id,
      administeredSites,
    };
    return this.usersRepository.save(newUser);
  }
}
