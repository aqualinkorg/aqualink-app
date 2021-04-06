import {
  Controller,
  Body,
  Param,
  Post,
  Put,
  Delete,
  ParseIntPipe,
  Get,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { AdminLevel, User } from './users.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { Auth } from '../auth/auth.decorator';
import { AuthRequest } from '../auth/auth.types';
import { Reef } from '../reefs/reefs.entity';
import { OverrideLevelAccess } from '../auth/override-level-access.decorator';
import { Public } from '../auth/public.decorator';
import { CustomApiNotFoundResponse } from '../docs/api-properties';

@ApiTags('Users')
@Auth()
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Public()
  @Post()
  create(@Req() req: any, @Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(req, createUserDto);
  }

  @ApiBearerAuth()
  @Get('current')
  getSelf(@Req() req: AuthRequest): Promise<User> {
    return this.usersService.getSelf(req);
  }

  @ApiBearerAuth()
  @CustomApiNotFoundResponse('No user was found with the specified id')
  @OverrideLevelAccess(AdminLevel.SuperAdmin)
  @Put(':id/level')
  setAdminLevel(
    @Param('id', ParseIntPipe) id: number,
    @Body('level') adminLevel: AdminLevel,
  ): Promise<void> {
    return this.usersService.setAdminLevel(id, adminLevel);
  }

  @ApiBearerAuth()
  @CustomApiNotFoundResponse('No user was found with the specified id')
  @OverrideLevelAccess(AdminLevel.SuperAdmin)
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.usersService.delete(id);
  }

  @ApiBearerAuth()
  @OverrideLevelAccess(AdminLevel.ReefManager, AdminLevel.SuperAdmin)
  @Get('current/administered-reefs')
  getAdministeredReefs(@Req() req: AuthRequest): Promise<Reef[]> {
    return this.usersService.getAdministeredReefs(req);
  }
}
