-- AlterTable "certificates" to support certidnumber, status, recipient_type, and dual-mapped fields
ALTER TABLE "certificates" ADD COLUMN IF NOT EXISTS "certidnumber" VARCHAR(100);
ALTER TABLE "certificates" ADD COLUMN IF NOT EXISTS "certIdNumber" VARCHAR(100);
ALTER TABLE "certificates" ADD COLUMN IF NOT EXISTS "status" VARCHAR(50) DEFAULT 'Active';
ALTER TABLE "certificates" ADD COLUMN IF NOT EXISTS "recipient_type" VARCHAR(50) DEFAULT 'Student';
ALTER TABLE "certificates" ADD COLUMN IF NOT EXISTS "recipientType" VARCHAR(50) DEFAULT 'Student';
ALTER TABLE "certificates" ADD COLUMN IF NOT EXISTS "studentName" VARCHAR(255);
ALTER TABLE "certificates" ADD COLUMN IF NOT EXISTS "studentEmail" VARCHAR(255);
ALTER TABLE "certificates" ADD COLUMN IF NOT EXISTS "courseName" VARCHAR(255);
ALTER TABLE "certificates" ADD COLUMN IF NOT EXISTS "grade" VARCHAR(100);
ALTER TABLE "certificates" ADD COLUMN IF NOT EXISTS "institutionName" VARCHAR(255) DEFAULT 'CODE POINT KENYA';
ALTER TABLE "certificates" ADD COLUMN IF NOT EXISTS "subHeading" VARCHAR(255) DEFAULT 'INSTITUTE OF SOFTWARE ENGINEERING & APPLIED AI';
ALTER TABLE "certificates" ADD COLUMN IF NOT EXISTS "addressText" VARCHAR(255) DEFAULT 'Ngong Road, Twin Towers 5th Floor, Nairobi, Kenya';
ALTER TABLE "certificates" ADD COLUMN IF NOT EXISTS "signatory1Name" VARCHAR(255) DEFAULT 'Brenda Wambui';
ALTER TABLE "certificates" ADD COLUMN IF NOT EXISTS "signatory1Title" VARCHAR(255) DEFAULT 'CURRICULUM DIRECTOR - Faculty of Engineering';
ALTER TABLE "certificates" ADD COLUMN IF NOT EXISTS "signatory2Name" VARCHAR(255) DEFAULT 'Code Point Kenya Academic Board & Admin';
ALTER TABLE "certificates" ADD COLUMN IF NOT EXISTS "signatory2Title" VARCHAR(255) DEFAULT 'ISSUED DATE';
ALTER TABLE "certificates" ADD COLUMN IF NOT EXISTS "issueDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "certificates" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "certificates" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- CreateTable "Certificate" for Prisma Certificate model compatibility
CREATE TABLE IF NOT EXISTS "Certificate" (
    "id" VARCHAR(255) NOT NULL,
    "studentName" VARCHAR(255) NOT NULL,
    "studentEmail" VARCHAR(255) NOT NULL,
    "courseName" VARCHAR(255) NOT NULL,
    "grade" VARCHAR(100) NOT NULL,
    "institutionName" VARCHAR(255) NOT NULL DEFAULT 'CODE POINT KENYA',
    "subHeading" VARCHAR(255) NOT NULL DEFAULT 'INSTITUTE OF SOFTWARE ENGINEERING & APPLIED AI',
    "addressText" VARCHAR(255) NOT NULL DEFAULT 'Ngong Road, Twin Towers 5th Floor, Nairobi, Kenya',
    "signatory1Name" VARCHAR(255) NOT NULL DEFAULT 'Brenda Wambui',
    "signatory1Title" VARCHAR(255) NOT NULL DEFAULT 'CURRICULUM DIRECTOR - Faculty of Engineering',
    "signatory2Name" VARCHAR(255) NOT NULL DEFAULT 'Code Point Kenya Academic Board & Admin',
    "signatory2Title" VARCHAR(255) NOT NULL DEFAULT 'ISSUED DATE',
    "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "certidnumber" VARCHAR(100),
    "certIdNumber" VARCHAR(100),
    "recipienttype" VARCHAR(50) NOT NULL DEFAULT 'Student',
    "recipientType" VARCHAR(50) NOT NULL DEFAULT 'Student',
    "status" VARCHAR(50) NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);

-- Ensure columns exist in case "Certificate" already exists
ALTER TABLE "Certificate" ADD COLUMN IF NOT EXISTS "certidnumber" VARCHAR(100);
ALTER TABLE "Certificate" ADD COLUMN IF NOT EXISTS "certIdNumber" VARCHAR(100);
ALTER TABLE "Certificate" ADD COLUMN IF NOT EXISTS "recipienttype" VARCHAR(50) DEFAULT 'Student';
ALTER TABLE "Certificate" ADD COLUMN IF NOT EXISTS "recipientType" VARCHAR(50) DEFAULT 'Student';
ALTER TABLE "Certificate" ADD COLUMN IF NOT EXISTS "status" VARCHAR(50) DEFAULT 'Active';

-- Create unique index on certidnumber
CREATE UNIQUE INDEX IF NOT EXISTS "Certificate_certidnumber_key" ON "Certificate"("certidnumber");
CREATE UNIQUE INDEX IF NOT EXISTS "Certificate_certIdNumber_key" ON "Certificate"("certIdNumber");
