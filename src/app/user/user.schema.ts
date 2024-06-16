import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true })
  id: number;

  @Prop({ required: true })
  tanant_id: number;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  is_active: boolean;

  @Prop({ required: true })
  reset_token: string;

  @Prop({ required: true })
  reset_token_date: Date;

  @Prop({ required: true })
  created_at: Date;

  @Prop({ required: true })
  updated_at: Date;

  @Prop({ required: true })
  deleted_at: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
