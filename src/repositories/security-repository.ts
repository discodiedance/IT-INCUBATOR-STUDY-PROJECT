import {
  CheckUserAndDeviceIdType,
  DeviceDBType,
  UpdateDeviceType,
} from "../types/security/input";
import { DevicesModel } from "../db/db";

export class SecurityRepostiory {
  static async terminateAllDevicesByUserIdExcludeCurrent(
    userAndDeviceId: CheckUserAndDeviceIdType
  ): Promise<boolean> {
    const savedDevice: DeviceDBType | null = await DevicesModel.findOne({
      userId: userAndDeviceId.userId,
      deviceId: userAndDeviceId.deviceId,
    });
    const result = await DevicesModel.deleteMany({
      userId: userAndDeviceId.userId,
      deviceId: { $ne: savedDevice!.deviceId },
    });
    return result.acknowledged === true;
  }

  static async terminateDeviceByDeviceId(deviceId: string): Promise<boolean> {
    try {
      const result = await DevicesModel.deleteOne({
        deviceId: deviceId,
      });
      return !!result.deletedCount;
    } catch (e) {
      console.log("not deleted device by deviceId", e);
      return false;
    }
  }

  static async addDevice(inputDevice: DeviceDBType): Promise<boolean> {
    try {
      await DevicesModel.create(inputDevice);
      return true;
    } catch (e) {
      console.log("not added device", e);
      return false;
    }
  }

  static async updateDevice(
    updateInputDevice: UpdateDeviceType
  ): Promise<boolean> {
    try {
      const result = await DevicesModel.updateOne(
        {
          id: updateInputDevice.deviceId,
        },
        {
          $set: {
            expirationDate: updateInputDevice.expirationDate,
            lastActiveDate: updateInputDevice.lastActiveDate,
          },
        }
      );

      return !!result.modifiedCount;
    } catch (e) {
      console.log("not updated device", e);
      return false;
    }
  }
}
