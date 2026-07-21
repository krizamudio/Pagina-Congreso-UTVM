import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginCorreoDto {
  @IsNotEmpty({
    message: 'El correo electrónico es obligatorio.',
  })
  @IsEmail(
    {},
    {
      message: 'El correo electrónico no es válido.',
    },
  )
  correo!: string;
}
