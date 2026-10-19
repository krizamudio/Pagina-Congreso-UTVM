import { Body, Controller, Post } from '@nestjs/common';

import { LoginCorreoDto } from './dto/login-correo.dto';
import { VerificarCodigoDto } from './dto/verificar-codigo.dto';
import { LoginService } from './login.service';

@Controller('login')
export class LoginController {
  constructor(private readonly loginService: LoginService) {}

  @Post()
  login(@Body() dto: LoginCorreoDto) {
    return this.loginService.loginPorCorreo(dto.correo);
  }

  @Post('verificar-codigo')
  verificarCodigo(@Body() dto: VerificarCodigoDto) {
    return this.loginService.verificarCodigo(dto.correo, dto.codigo);
  }
}
