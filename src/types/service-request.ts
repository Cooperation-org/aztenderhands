export type ServiceRequest = {
  id: string;
  status: string;
  patientId: string;
  patientName: string;
  providerType: string;
  referralType: string;

  // Business units involved
  referredByUnit: string;
  referredToUnit: string;

  // Time tracking
  createdOn: Date;
  referralSentAt: Date;
  responseReceivedAt: Date;

  // Contact information
  requestedByName: Date;
  requestedByEmail: Date;
  requestedByPhone: Date;

  // Notification tracking
  notifiedAt: Date;
};

export type ServiceRequestDto = {
  ServiceRequestId: string;
  PatientId: string;
  ReferredByBusinessunitId: string;
  Status: string;
  IsEnabled: boolean;
  ReferralType: string;
  IsPartiallyConfirmed: boolean;
  IsReferralShared: boolean;
  CreatedOn: string;
  ReferralAttributeSetting: string;
  ReferredByBusinessunitName: string;
  ReferralSentAt: string;
  ReferralResponseReceivedAt: string | null;
  ServiceRequestedBy: string;
  ServiceRequestedByContactInfo: {
    ContactInfoId: string;
    EmailId: string;
    PhoneNumber: string;
    HomeNumber: string | null;
    MobileNumber: string | null;
    Fax: string | null;
  };
  IsTwoStepReferral: boolean;
  Zipcode: string | null;
  ProviderType: string;
  ProviderTypeId: string;
  ServiceNeeded: {
    AppcategoryId: string;
    ParentAppCategoryId: string | null;
    SystemName: string;
    AppCategoryLevel: string;
    DisplayName: string;
    DisplayColorLabel: string | null;
    IsGlobal: boolean;
    IsAssigned: string | null;
    IsEnabled: boolean;
    BusinessUnitId: string | null;
  }[];
  SpecialPrograms: {
    AppcategoryId: string;
    ParentAppCategoryId: string | null;
    SystemName: string;
    AppCategoryLevel: string;
    DisplayName: string;
    DisplayColorLabel: string | null;
    IsGlobal: boolean;
    IsAssigned: string | null;
    IsEnabled: boolean;
    BusinessUnitId: string | null;
  }[];
  Services: string | null;
  SecureLink: string | null;
  IsPreAuthorizationRequired: string | null;
  TransportScheduledAt: string | null;
  TransportScheduleNote: string | null;
  ReferralResponses: [];
  OriginContactInfo: [];
  ReferralResponse: {
    ServiceResponseId: string;
    ReferredToBusinessunitId: string;
    ReferredToBusinessunitName: string;
    ReferredToBusinessunitLocationAddressDetail: string | null;
    ReferredToBusinessunitLocationContactDetail: string | null;
    DeliveryMode: string;
    RequestReceivedOn: string;
    RequestRespondedOn: string | null;
    HasRespondedRequest: string | null;
    IsViewed: boolean;
    IsOrphanReferral: boolean;
    IsChildBusinessunitPatient: string | null;
    PreferenceOrder: number;
    Status: string;
    InsuranceStatus: string;
    EstimatedArrivalAtDestination: string;
    ActualArrivalAtDestination: string | null;
    ServiceExpirationTimeWithoutResponse: string;
    ConfirmedOn: string | null;
    TransportScheduledAt: string | null;
    Notes: string | null;
    ServiceRespondedBy: string;
    HasPatientAcceptedFacility: string | null;
    AHCCCSId: string | null;
    OrganizationAHCCCSId: string | null;
    ServiceRespondedByContactInfo: {
      ContactInfoId: string;
      EmailId: string;
      PhoneNumber: string | null;
      HomeNumber: string | null;
      MobileNumber: string | null;
      Fax: string | null;
    };
    NoteCount: number;
    LastUpdatedOn: string;
    IsMemberAssigned: string | null;
    IsInsuranceAuthorizationApproved: string | null;
    Tags: string | null;
    IsBusinessunitEnabled: string | null;
    HasReceivedRequest: boolean;
    AppointmentDateOptions: string | null;
    ReferralResourceJson: string;
    StartOfService: {
      RequestedStartOfService: string;
      ActualStartOfService: string | null;
      CaseManagerDetailsConfig: string;
      DestinationCaseManagerDetailsConfig: string | null;
    };
    ServiceResponseAttributes: string;
    TransportDetails: {
      ServiceResponseInfoUpdateId: string | null;
      ServiceRequestInfoUpdateId: string | null;
      ServiceResponseId: string | null;
      ServiceRequestId: string | null;
      Comment: string | null;
      PickupDateTime: string | null;
      CreatedOn: string | null;
    };
    UnreadMessageCount: number;
  };
  PatientDetail: {
    FirstName: string;
    MiddleName: string;
    LastName: string;
    Dob: string | null;
    Diagnosis: string | null;
    SecureLink: string | null;
    PatientStatus: string | null;
    InsuranceName: string | null;
    InsuranceId: string | null;
    AdmittedOn: string | null;
    DischargeOn: string | null;
    Address: string | null;
    ContactInfo: string | null;
    CreatedOn: string | null;
    PatientBusinessunitId: string | null;
  };
  UnreadMessageCount: string;
  IsChildBusinessunitPatient: string | null;
  EncounterId: string | null;
  ReferralResourceJson: string;
  ServiceRequestReferralResourceJson: string;
  IsResponsesInactive: boolean;
  AHCCCSID: string | null;
  PatientAttributes: string | null;
  Tags: string | null;
  IsPatientTracked: boolean;
  UpdateReferralResponse: boolean;
};

export type ServiceRequestResponseBody = {
  Data: ServiceRequestDto[];
  DataLength: number;
  Status: number;
  Message: string | null;
  Warning: string | null;
  Error: string | null;
  TotalRecords: number;
  FhirResponse: unknown | null;
};
