import { Body, Controller, Post } from '@nestjs/common';

import { LoginCorreoDto } from './dto/login-correo.dto';
import { LoginService } from './login.service';

@Controller('login')
export class LoginController {
  constructor(private readonly loginService: LoginService) {}

  @Post()
  login(@Body() dto: LoginCorreoDto) {
    return this.loginService.loginPorCorreo(dto.correo);
  }
}
