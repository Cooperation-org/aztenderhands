-- CreateTable
CREATE TABLE "ServiceRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "patientName" TEXT NOT NULL,
    "providerType" TEXT NOT NULL,
    "referralType" TEXT NOT NULL,
    "referredByUnit" TEXT NOT NULL,
    "referredToUnit" TEXT,
    "createdOn" DATETIME,
    "referralSentAt" DATETIME,
    "responseReceivedAt" DATETIME,
    "requestedByName" TEXT,
    "requestedByEmail" TEXT,
    "requestedByPhone" TEXT
);
