import { IsString, Matches } from 'class-validator';

export class QrTokenParamDto {
  @IsString()
  @Matches(/^[A-Za-z0-9_-]{43}$/, { message: 'Token QR invalido' })
  token!: string;
}
