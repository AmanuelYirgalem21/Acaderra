import { Controller, Get, UseGuards, Param, Req, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserRole } from '../../generated/prisma/enums';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService){}



  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT, UserRole.ADMIN)
  @Get(':id')
  async getUser(@Param('id') id: string, @Req() req: any) {

    // Only allow if user is ADMIN or requesting their own data
    if (req.user.id !== id && req.user.role !== UserRole.ADMIN) {
        throw new ForbiddenException('You do not have permission to access this resource');
    }

    return this.usersService.getUserById(id);
  }
}
