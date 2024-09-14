import { DevicesModel } from "../../db/db";
import { securityMapper } from "../../middlewares/security/security-mapper";
import { DeviceDBType } from "../../types/security/input";
import { OutputDeviceType } from "../../types/security/output";

export class QuerySecurityRepostiory {
  async getAllDevicesByUserId(
    userId: string
  ): Promise<OutputDeviceType[] | null> {
    const allDevices: DeviceDBType[] | null = await DevicesModel.find({
      userId: userId,
    });
    if (!allDevices) {
      return null;
    }
    return securityMapper(allDevices);
  }

  async getDeviceByDeviceId(deviceId: string): Promise<DeviceDBType | null> {
    const device: DeviceDBType | null = await DevicesModel.findOne({
      deviceId: deviceId,
    });
    if (!device) {
      return null;
    }
    return device;
  }
}
