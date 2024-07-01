import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

@Schema({ collection: 'tanants' })
export class Tanant extends Document {
    @ApiProperty({ example: 'John Doe' })
    @Prop({ required: true })
    name: string;

    @ApiProperty({ example: 'googledb', uniqueItems: true })
    @Prop({ required: true, unique: true })
    db_name: string;

    @ApiProperty({ example: 'google', uniqueItems: true })
    @Prop({ required: true, unique: true })
    subdomain: string;

    @ApiProperty()
    @Prop({ required: true, default: true })
    is_active: boolean;
}


export const TanantSchema = SchemaFactory.createForClass(Tanant);
TanantSchema.set('toJSON', { getters: true });
TanantSchema.set('toObject', { getters: true });
