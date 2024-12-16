import prisma, { PrismaClient } from "@prisma/client";

/**
 * @typedef {import("../types/service-request").ServiceRequest} ServiceRequest
 */

export class ServiceRequestDao {
  #dbClient = new PrismaClient();

  /**
   * @param {ServiceRequest} sr
   * @returns {Promise<prisma.ServiceRequest>}
   */
  async createServiceRequest(sr) {
    const dto = this.#requestResponseToDBDto(sr);
    const referral = await this.#dbClient.serviceRequest.create({ data: dto });
    return referral;
  }

  /**
   * @param {ServiceRequest[]} srs
   * @returns {Promise<prisma.ServiceRequest[]>}
   */
  async createServiceRequests(srs) {
    const dto = srs.map((sr) => this.#requestResponseToDBDto(sr));
    const referral = await this.#dbClient.serviceRequest.createMany({ data: dto });
    return referral;
  }

  /**
   * @param {string} id
   * @returns {Promise<void>}
   */
  async markAsNotified(id) {
    await this.#dbClient.serviceRequest.update({
      where: { id },
      data: { notifiedAt: new Date() },
    });
  }

  /**
   * @returns {Promise<?prisma.ServiceRequest>}
   */
  async getLastNotified() {
    const res = await this.#dbClient.serviceRequest.findMany({
      orderBy: { notifiedAt: prisma.Prisma.SortOrder.desc },
      take: 1,
      where: { notifiedAt: { not: null } },
    });
    return res?.length ? res[0] : null;
  }

  /**
   * @returns {Promise<void>}
   */
  async disconnect() {
    await this.#dbClient.$disconnect();
    this.#dbClient = undefined;
  }

  /**
   * @param {ServiceRequest} sr - The service request from the API response
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
