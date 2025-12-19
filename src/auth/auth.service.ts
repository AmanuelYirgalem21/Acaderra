import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { UserRole } from '../../generated/prisma/enums';
import * as bcrypt from "bcrypt";


@Injectable()
export class AuthService {
    constructor(
        private readonly prisma : PrismaService,
        private config : ConfigService,
        private jwtService: JwtService,
 ){}


    private async hashCode(plain: string) {
        const salt = await bcrypt.genSalt(10);
            return bcrypt.hash(plain, salt);
  }


   async register(dto: RegisterDto) {
    const { name, email, password, role } = dto;

    // 1. Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }

    // 2. Hash password
    const passwordHash = await this.hashCode(password);


    // 3. Create user
    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: role ?? UserRole.STUDENT,

      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    // 4. Generate token
    const accessToken = await this.jwtService.signAsync({ id: user.id,});

    // 5. Consistent response
    return {
      message: 'User registered successfully',
      data: {
        user,
        accessToken,
      },
    };
  }

}
