import { Exclude } from 'class-transformer';
import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Exclude()
    @Column()
    tanant_id: number;

    @Column()
    name: string;

    @Column({ unique: true })
    email: string;

    @Column()
    phone: string;

    @Exclude()
    @Column()
    password: string;

    @Column({ default: true })
    is_active: boolean;

    @Exclude()
    @Column({ type: 'varchar', length: 255, nullable: true })
    reset_token: string;

    @Exclude()
    @Column({ type: 'datetime', nullable: true })
    reset_token_date: Date;

    @Exclude()
    @CreateDateColumn({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', nullable: true })
    created_at: Date;

    @Exclude()
    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP', nullable: true })
    updated_at: Date;

    @Exclude()
    @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
    deleted_at: Date;
}

export enum SortByUserKey {
    ID = 'id',
    NAME = 'name',
    EMAIL = 'email',
    PHONE = 'phone',
}
