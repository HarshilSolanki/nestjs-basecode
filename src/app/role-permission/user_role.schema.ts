import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserRoleDocument = UserRole & Document;

@Schema({ collection: 'user_role' })
export class UserRole {
    @Prop({ type: Types.ObjectId, ref: 'TanantUser', required: true })
    user_id: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Role', required: true })
    role_id: Types.ObjectId;
}

export const UserRoleSchema = SchemaFactory.createForClass(UserRole);
UserRoleSchema.set('toJSON', { getters: true });
UserRoleSchema.set('toObject', { getters: true });