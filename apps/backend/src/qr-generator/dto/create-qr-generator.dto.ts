import { IsNotEmpty, IsString } from "class-validator";



export class CreateQrGeneratorDto {

    @IsString({message: "El contenido debe ser una cadena de caracteres"})
    @IsNotEmpty({message: "El contenido no puede estar vacio"})
    content!: string;
}
