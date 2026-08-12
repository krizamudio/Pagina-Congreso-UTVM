import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
} from 'class-validator';

export class VerificarCodigoDto {
  @IsEmail({}, { message: 'El correo electrónico no es válido.' })
  @IsNotEmpty({ message: 'El correo es obligatorio.' })
  correo!: string;

  @IsString()
  @IsNotEmpty({ message: 'El código es obligatorio.' })
  @Matches(/^\d{6}$/, {
    message: 'El código debe contener exactamente 6 dígitos.',
  })
  codigo!: string;
}