import { Transform } from "class-transformer";
import { IsISO8601, IsNotEmpty, IsString, MaxLength } from "class-validator";

function sanitizeString(value: any) {
  if (typeof value !== "string") return value;

  let s = value.replace(/<[^>]*>/g, "").trim();
  s = s.replace(
    /(\b)(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE|EXEC|UNION|--|AND|OR)(\b)/gi,
    "",
  );
  s = s.replace(
    /(--|;|\/\*|\*\/|@@|@|char\(|nchar\(|varchar\(|nvarchar\(|cast\(|convert\()/gi,
    "",
  );

  return s;
}

export class CreateCongresoDto {
  @IsString({ message: "El campo \"nombre\" debe ser texto." })
  @IsNotEmpty({ message: "El campo \"nombre\" es obligatorio." })
  @MaxLength(150, {
    message: "El campo \"nombre\" no puede tener más de $constraint1 caracteres.",
  })
  @Transform(({ value }) => sanitizeString(value))
  nombre!: string;

  @IsString({ message: "El campo \"eslogan\" debe ser texto." })
  @IsNotEmpty({ message: "El campo \"eslogan\" es obligatorio." })
  @MaxLength(200, {
    message:
      "El campo \"eslogan\" no puede tener más de $constraint1 caracteres.",
  })
  @Transform(({ value }) => sanitizeString(value))
  eslogan!: string;

  @IsString({ message: "El campo \"ubicacion\" debe ser texto." })
  @IsNotEmpty({ message: "El campo \"ubicacion\" es obligatorio." })
  @MaxLength(255, {
    message:
      "El campo \"ubicacion\" no puede tener más de $constraint1 caracteres.",
  })
  @Transform(({ value }) => sanitizeString(value))
  ubicacion!: string;

  @IsISO8601(
    { strict: true },
    { message: "El campo \"fecha_inicio\" debe tener formato ISO." },
  )
  @IsNotEmpty({ message: "El campo \"fecha_inicio\" es obligatorio." })
  fecha_inicio!: string;

  @IsISO8601(
    { strict: true },
    { message: "El campo \"fecha_fin\" debe tener formato ISO." },
  )
  @IsNotEmpty({ message: "El campo \"fecha_fin\" es obligatorio." })
  fecha_fin!: string;
}
