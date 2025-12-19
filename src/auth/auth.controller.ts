import { Controller, Post, Body, Get, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
    constructor (private readonly authService: AuthService){}




@Post('register')
register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }


@Post('login')
login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

@UseGuards(JwtAuthGuard)
@Get('me')
async getMe(@Req() req: any) {
    // req.user is injected by JwtStrategy validate()
    return this.authService.getMe(req.user.id);
}

}
