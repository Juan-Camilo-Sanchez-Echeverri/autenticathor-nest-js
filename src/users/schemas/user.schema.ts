import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class User extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: false })
  twoFAEnabled: boolean;

  @Prop()
  twoFASecret: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
