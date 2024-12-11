import { REFERRALS_ENDPOINT } from "./consts.mjs";

/**
 * @param {string} accessToken
 */
export async function getReferrals(accessToken) {
  const body = {
    Filters: {
      ReferredByBusinessunitIds: [],
      ReferredToBusinessunitIds: [],
      PatientNameSearch: "",
      DeliveryMode: "All",
      ProviderTypeIds: [],
      ReferralType: ["Provider", "CareTransition", "RecordedReferral"],
      IsEnabled: true,
      ReferralStatus: [
        "Accepted",
        "Dates Received",
        "Referral Sent",
        "Pending",
        "Open",
        "Confirmed",
        "Transport Scheduled",
        "Transport Completed",
        "In Review",
        "Rejected",
        "Cancelled",
        "Suspended",
      ],
      RemoveReferralStatus: [],
      ReferralMode: "",
      InsuranceStatus: "",
      RemoveSuspendedReferral: true,
      FromDate: null,
      ToDate: null,
      NoOfItems: 25,
      SkippedItems: 0,
      IsActivePatient: null,
      HasReceivedRequest: null,
      ApplyLastDurationOfRecordsSetting: false,
      ApplyLastConfirmReferralDateSetting: false,
      DefaultConfirmReferralVisibilityInHrs: 0,
      TrackedBy: "All",
      TagNames: [],
      HospitalName: [],
    },
    OrganizationIds: [],
    OutputFields: {
      ReferredByBusinessunitName: true,
      IsChildBusinessunitPatient: true,
      ReferralSentAt: true,
      ReferralResponseReceivedAt: true,
      ServiceRequestedBy: true,
      ServiceRequestedByContactInfo: true,
      ReferralResponses: {
        ServiceResponseId: true,
        ReferredToBusinessunitId: true,
        ReferredToBusinessunitName: true,
        ReferredToBusinessunitLocationDetail: true,
        DeliveryMode: true,
        RequestReceivedOn: true,
        RequestRespondedOn: true,
        HasRespondedRequest: true,
        IsViewed: true,
        IsOrphanReferral: true,
        PreferenceOrder: true,
        Status: true,
        InsuranceStatus: true,
        EstimatedArrivalAtDestination: true,
        ActualArrivalAtDestination: true,
        ServiceExpirationTimeWithoutResponse: true,
        ConfirmedOn: true,
        TransportScheduledAt: true,
        Notes: true,
        ServiceRespondedBy: true,
        ServiceRespondedByContactInfo: true,
        NoteCount: true,
        LastUpdatedOn: true,
        IsMemberAssigned: true,
        IsInsuranceAuthorizationApproved: true,
      },
      IsTwoStepReferral: true,
      PatientDetail: {
        PatientName: true,
        SecureLink: true,
        Address: true,
        ContactInfo: true,
        Diagnosis: true,
      },
      ProviderType: true,
      ServiceNeeded: true,
      SpecialPrograms: true,
      IsPreAuthorizationRequired: true,
      TransportScheduledAt: true,
      GetMultipleReferralResponse: false,
      UnreadMessageCount: true,
      IsResourceJson: true,
    },
    ReferralLevel: "ServiceResponse",
    CurrentBusinessunitId: "89f490ec-f840-42cf-8a8d-305aabf9fe22",
  };

  const res = await fetch(REFERRALS_ENDPOINT, {
    method: "POST",
    headers: {
      accept: "application/json",
      authorization: `Bearer ${accessToken}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (res.status === 401) {
    // TODO: refresh the tokens and try again
    // const token = refreshTokens()
    // return getReferrals(token)
  }

  return res.json();
}
