import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './common/strategies/jwt.strategy';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    PassportModule,   
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
    PrismaModule,
    AuthModule,
    UsersModule, 
  ],
  controllers: [],
  providers: [JwtStrategy],
})
export class AppModule {}
