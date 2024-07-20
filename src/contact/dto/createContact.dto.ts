import {
  IsString,
  IsNotEmpty,
  Matches,
  IsEmail,
  MinLength,
  MaxLength,
  IsOptional,
  Validate,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

class NameValidator {
  validate(value: string) {
    return /^[a-zA-Z\s'-]+$/.test(value);
  }

  defaultMessage() {
    return 'Name should only contain letters, spaces, hyphens, and apostrophes';
  }
}

export class CreateContactDto {
  @ApiProperty({ description: 'The first name of the contact' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  @Validate(NameValidator)
  @Transform(({ value }) => value.trim())
  firstname: string;

  @ApiProperty({ description: 'The last name of the contact' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  @Validate(NameValidator)
  @Transform(({ value }) => value.trim())
  lastname: string;

  @ApiProperty({
    description: 'The phone number of the contact',
    example: '+2345678900896',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Phone number must be a valid format',
  })
  @Transform(({ value }) => value.replace(/\s+/g, ''))
  phonenumber: string;

  @ApiProperty({ description: 'contact email' })
  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  email?: string;
}
