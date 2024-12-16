import { Sequelize, DataTypes, Op } from "sequelize";
import { config } from "../config.mjs";
import { ServiceRequest } from "./models/service-request.mjs";

/**
 * @typedef {import("../types/service-request").ServiceRequest} ServiceRequest
 * @typedef {import("../types/service-request").ServiceRequestDto} ServiceRequestDto
 */

export class ServiceRequestDao {
  #sequelize = new Sequelize(config.dbURI);

  #ServiceRequest = ServiceRequest.init(
    {
      id: { type: DataTypes.UUID, primaryKey: true, allowNull: false },
      status: { type: DataTypes.STRING, allowNull: false },
      patientId: { type: DataTypes.UUID, allowNull: false },
      patientName: { type: DataTypes.STRING, allowNull: false },
      providerType: { type: DataTypes.STRING, allowNull: false },
      referralType: { type: DataTypes.STRING, allowNull: false },

      // Business units involved
      referredByUnit: { type: DataTypes.STRING, allowNull: false },
      referredToUnit: { type: DataTypes.STRING, allowNull: true },

      // Time tracking
      createdOn: { type: DataTypes.TIME, allowNull: true },
      referralSentAt: { type: DataTypes.TIME, allowNull: true },
      responseReceivedAt: { type: DataTypes.TIME, allowNull: true },

      // Contact information
      requestedByName: { type: DataTypes.STRING, allowNull: true },
      requestedByEmail: { type: DataTypes.STRING, allowNull: true },
      requestedByPhone: { type: DataTypes.STRING, allowNull: true },

      // Notification tracking
      notifiedAt: { type: DataTypes.TIME, allowNull: true },
    },
    { sequelize: this.#sequelize },
  );

  /**
   * @returns {Promise<typeof this.#sequelize>}
   */
  init() {
    return this.#sequelize.sync();
  }

  /**
   * @param {ServiceRequestDto} sr
   * @returns {Promise<prisma.ServiceRequest>}
   */
  createServiceRequest(sr) {
    const dto = this.#requestResponseToDBDto(sr);
    return this.#ServiceRequest.create(dto);
  }

  /**
   * @param {ServiceRequestDto[]} srs
   * @returns {Promise<prisma.ServiceRequest[]>}
   */
  createServiceRequests(srs) {
    const dto = srs.map((sr) => this.#requestResponseToDBDto(sr));
    return this.#ServiceRequest.bulkCreate(dto);
  }

  /**
   * @returns {Promise<prisma.ServiceRequest[]>}
   */
  getServiceRequests() {
    return this.#ServiceRequest.findAll();
  }

  /**
   * @param {string} id
   * @returns {Promise<void>}
   */
  markServiceRequestAsNotified(id) {
    return this.#ServiceRequest.update({
      where: { id },
      data: { notifiedAt: new Date() },
    });
  }

  /**
   * @returns {Promise<?prisma.ServiceRequest>}
   */
  async getLastNotified() {
    const res = await this.#ServiceRequest.findOne({
      order: [["notifiedAt", "DESC"]],
      where: { notifiedAt: { [Op.not]: null } },
    });
    return res || null;
  }

  /**
   * @returns {Promise<void>}
   */
  async disconnect() {
    await this.#sequelize.close();
    this.#sequelize = undefined;
  }

  /**
   * @param {ServiceRequestDto} sr - The service request from the API response
   * @returns {prisma.Prisma.ServiceRequestCreateArgs["data"]}
   */
  #requestResponseToDBDto(sr) {
    return {
      id: sr.ServiceRequestId,
      status: sr.Status,
      patientId: sr.PatientId,
      patientName: `${sr.PatientDetail.FirstName} ${sr.PatientDetail.LastName}`,
      providerType: sr.ProviderType,
      referralType: sr.ReferralType,

      referredByUnit: sr.ReferredByBusinessunitName,
      referredToUnit: sr.ReferralResponse.ReferredToBusinessunitName,

      createdOn: sr.CreatedOn ? new Date(sr.CreatedOn) : null,
      referralSentAt: sr.ReferralSentAt ? new Date(sr.ReferralSentAt) : null,
      responseReceivedAt: sr.ReferralResponseReceivedAt ? new Date(sr.ReferralResponseReceivedAt) : null,

      requestedByName: sr.ServiceRequestedBy,
      requestedByEmail: sr.ServiceRequestedByContactInfo.EmailId || null,
      requestedByPhone: sr.ServiceRequestedByContactInfo.PhoneNumber || null,
    };
  }
}
