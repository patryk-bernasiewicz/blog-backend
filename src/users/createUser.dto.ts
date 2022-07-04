import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Match } from 'src/utils/decorators/match.decorator';

export class CreateUserDTO {
  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  displayName: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  @Match(CreateUserDTO, (user) => user.password)
  confirmPassword: string;
}
