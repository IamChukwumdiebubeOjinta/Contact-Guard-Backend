import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  Validate,
} from 'class-validator';

class NameValidator {
  validate(value: string) {
    return /^[a-zA-Z\s'-]+$/.test(value);
  }

  defaultMessage() {
    return 'Name should only contain letters, spaces, hyphens, and apostrophes';
  }
}

export class UpdateContactDto {
  @ApiProperty({ description: 'The first name of the contact' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @Validate(NameValidator)
  @Transform(({ value }) => value.trim())
  firstname?: string;

  @ApiProperty({ description: 'The last name of the contact' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @Validate(NameValidator)
  @Transform(({ value }) => value.trim())
  lastname?: string;

  @ApiProperty({
    description: 'The phone number of the contact',
    example: '+2345678900896',
  })
  @IsOptional()
  @IsString()
  @Matches(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/, {
    message: 'Phone number must be a valid format',
  })
  @Transform(({ value }) => value.replace(/\s+/g, ''))
  phonenumber?: string;

  @ApiProperty({ description: 'contact email' })
  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  email?: string;
}
