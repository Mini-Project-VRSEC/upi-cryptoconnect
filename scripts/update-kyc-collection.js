// First, let's check the existing collection structure
db.kycs.findOne();

// If you need to modify the collection, there are two options:

// Option 1: Drop existing collection and recreate
// Note: This will DELETE all existing data
// db.kycs.drop();
// Then run your createCollection command again

// Option 2: Update schema validation for existing collection
db.runCommand({
  collMod: "kycs",
  validator: {
     $jsonSchema: {
        bsonType: "object",
        required: ["user", "idDocumentType", "idDocumentPath", "kycStatus", "submissionDate"],
        properties: {
           user: {
              bsonType: "objectId",
              description: "Reference to user and is required"
           },
           idDocumentType: {
              bsonType: "string",
              enum: ["aadhar", "pan"],
              description: "Type of ID document and is required"
           },
           idDocumentPath: {
              bsonType: "string",
              description: "Path to stored ID document and is required"
           },
           selfiePath: {
              bsonType: "string",
              description: "Path to stored selfie image"
           },
           videoVerificationPath: {
              bsonType: "string",
              description: "Path to stored verification video"
           },
           extractedInfo: {
              bsonType: "object",
              properties: {
                 name: { bsonType: "string" },
                 dob: { bsonType: "string" },
                 gender: { bsonType: "string" },
                 aadhaarNumber: { bsonType: "string" },
                 panNumber: { bsonType: "string" }
              }
           },
           faceMatchResult: {
              bsonType: "object",
              properties: {
                 match: { bsonType: "bool" },
                 confidence: { bsonType: "number" }
              }
           },
           kycStatus: {
              bsonType: "string",
              enum: ["pending", "verified", "rejected"],
              description: "Status of KYC verification and is required"
           },
           rejectionReason: {
              bsonType: "string",
              description: "Reason for rejection if KYC is rejected"
           },
           processedBy: {
              bsonType: "objectId",
              description: "Admin who processed the KYC"
           },
           submissionDate: {
              bsonType: "date",
              description: "Date of submission and is required"
           },
           processedDate: {
              bsonType: "date",
              description: "Date when KYC was processed"
           }
        }
     }
  },
  validationLevel: "moderate" // This allows existing documents that don't match the schema
});

// Create or update indexes
db.kycs.createIndex({ user: 1 });
db.kycs.createIndex({ kycStatus: 1 });
db.kycs.createIndex({ submissionDate: -1 });

// Update user schema to include KYC status if not already present
db.users.updateMany(
  { kycStatus: { $exists: false } },
  { $set: { kycStatus: "not_submitted" } }
);
