import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RolePermissionDocument = RolePermission & Document;

@Schema({ collection: 'role_permissions' })
export class RolePermission {
    @Prop({ type: Types.ObjectId, ref: 'Role', required: true })
    role_id: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Permission', required: true })
    permission_id: Types.ObjectId;
}

export const RolePermissionSchema = SchemaFactory.createForClass(RolePermission);
RolePermissionSchema.set('toJSON', { getters: true });
RolePermissionSchema.set('toObject', { getters: true });