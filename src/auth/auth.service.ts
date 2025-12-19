import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { UserRole } from '../../generated/prisma/enums';
import { LoginDto } from './dto/login.dto';
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
    const accessToken = await this.jwtService.signAsync({ id: user.id, role: user.role, });

    // 5. Consistent response
    return {
      message: 'User registered successfully',
      data: {
        user,
        accessToken,
      },
    };
  }








   async login(dto: LoginDto) {
    const { email, password } = dto;

    //  Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        passwordHash: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const accessToken = await this.jwtService.signAsync({ id: user.id, role: user.role, });


    // Remove passwordHash from response
    const { passwordHash, ...userData } = user;

    // Return consistent response
    return {
      message: 'Login successful',
      data: {
        user: userData,
        accessToken,
      },
    };
  }






 async getMe(userId: string) {
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return {
    message: 'Current user fetched successfully',
    data: user,
  };
}


}
