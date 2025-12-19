import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
    constructor(
        private readonly prisma : PrismaService,
        private config : ConfigService,
     ){}



   async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) throw new NotFoundException('User not found');

    return {
      message: 'User fetched successfully',
      data: user,
    };
  }
}
