import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TanantUserDocument = TanantUser & Document;

@Schema({ autoCreate: false })
export class TanantUser {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: false })
  is_active: boolean;

  @Prop({ required: false })
  reset_token: string;

  @Prop({ required: false })
  reset_token_date: Date;

  @Prop({ required: false })
  created_at: Date;

  @Prop({ required: false })
  updated_at: Date;

  @Prop({ required: false })
  deleted_at: Date;
}

export const TanantUserSchema = SchemaFactory.createForClass(TanantUser);
