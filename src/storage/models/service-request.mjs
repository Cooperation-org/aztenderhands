import { Model } from "sequelize";

export class ServiceRequest extends Model {
  /**
   * @returns {boolean}
   */
  isNotified() {
    return !!this.notifiedAt;
  }
}
