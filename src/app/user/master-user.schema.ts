import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type MasterUserDocument = MasterUser & Document;

@Schema({ collection: 'users' })
export class MasterUser {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Tanant', required: true })
  tanant_id: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: false, default: true })
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

export const MasterUserSchema = SchemaFactory.createForClass(MasterUser);
MasterUserSchema.set('toJSON', { getters: true });
MasterUserSchema.set('toObject', { getters: true });
