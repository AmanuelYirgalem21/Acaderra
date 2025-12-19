import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';


@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_ACCESS_SECRET');
        const signOptions = { expiresIn: parseInt(configService.get<string>('JWT_ACCESS_EXPIRE') || '3600') }; 
        
        return {
          secret,
          signOptions,
        };
},
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}
