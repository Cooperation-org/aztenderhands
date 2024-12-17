import { Sequelize, DataTypes, Op } from "sequelize";
import { config } from "../config.mjs";
import { Metadata, ServiceRequest } from "./models/service-request.mjs";

/**
 * @typedef {import("../types/service-request").ServiceRequest} IServiceRequest
 * @typedef {import("../types/service-request").ServiceRequestDto} ServiceRequestDto
 */

export class ServiceRequestDao {
  #sequelize = new Sequelize(config.dbURI, { logging: false });

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

  #Metadata = Metadata.init(
    {
      accessToken: { type: DataTypes.STRING },
      refreshToken: { type: DataTypes.STRING },
      totalServiceRequests: { type: DataTypes.NUMBER },
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
   * @param {ServiceRequestDto[]} srs
   * @returns {Promise<IServiceRequest[]>}
   */
  async createServiceRequests(srs) {
    const dto = srs.map(sr => this.#requestResponseToDBDto(sr));
    const serviceRequests = await this.getServiceRequests();
    const existingIds = serviceRequests.map(x => x.id);

    const srsToCreate = dto.filter(x => !existingIds.includes(x.id));

    if (!srsToCreate.length) return [];

    return this.#ServiceRequest.bulkCreate(srsToCreate);
  }

  /**
   * @returns {Promise<IServiceRequest[]>}
   */
  getServiceRequests() {
    return this.#ServiceRequest.findAll();
  }

  /**
   * @param {string} id
   * @returns {Promise<void>}
   */
  markServiceRequestAsNotified(id) {
    return this.#ServiceRequest.update(
      {
        notifiedAt: new Date(),
      },
      { where: { id } },
    );
  }

  /**
   * @returns {Promise<?IServiceRequest>}
   */
  async getLastNotifiedServiceRequest() {
    const res = await this.#ServiceRequest.findOne({
      order: [
        ["notifiedAt", "DESC"],
        ["createdOn", "DESC"],
      ],
      where: { notifiedAt: { [Op.not]: null } },
    });
    return res?.dataValues || null;
  }

  /**
   * @param {Date} date
   * @returns {Promise<?IServiceRequest>}
   */
  async getNotNotifiedServiceRequestsAfter(date) {
    const res = await this.#ServiceRequest.findOne({
      order: [["createdOn", "DESC"]],
      where: {
        createdOn: { [Op.gt]: date },
        notifiedAt: { [Op.is]: null },
      },
    });
    return res?.dataValues || null;
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
   * @returns {IServiceRequest}
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
