export class CreateUserDto {
  email: string;
  password: string;
  twoFAEnabled?: boolean;
}
