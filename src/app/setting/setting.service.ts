import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Setting, SettingDocument } from './setting.schema';
import { Model } from 'mongoose';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';

@Injectable()
export class SettingService {
    constructor(@InjectModel(Setting.name) private settingModel: Model<SettingDocument>) { }

    async create(createSettingDto: CreateSettingDto): Promise<Setting> {
        const createdSetting = new this.settingModel(createSettingDto);
        return createdSetting.save();
    }

    async findAll(queryParams): Promise<Setting[]> {
        return this.settingModel.find().exec();
    }

    async findOne(id: string): Promise<Setting> {
        return this.settingModel.findById(id).exec();
    }

    async update(id: string, updateSettingDto: UpdateSettingDto): Promise<Setting> {
        return this.settingModel.findByIdAndUpdate(id, updateSettingDto, { new: true }).exec();
    }

    async remove(id: string): Promise<Setting> {
        return this.settingModel.findByIdAndDelete(id).exec();
    }
}
