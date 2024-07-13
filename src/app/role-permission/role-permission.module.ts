import { Module } from '@nestjs/common';
import { RolePermissionController } from './role-permission.controller';
import { RolePermissionService } from './role-permission.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Role, RoleSchema } from './roles.schema';
import { Permission, PermissionSchema } from './permissions.schema';
import { RolePermission, RolePermissionSchema } from './role_permissions.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Role.name, schema: RoleSchema },
      { name: Permission.name, schema: PermissionSchema },
      { name: RolePermission.name, schema: RolePermissionSchema },
    ]),
  ],
  controllers: [RolePermissionController],
  providers: [RolePermissionService],
  exports: [RolePermissionService],
})
export class RolePermissionModule { }
