/**
 * This script updates the moneyRequests collection schema to accept both integer and double types
 * Run with: mongo upi_cryptoconnect fix_schema_validation.js
 */

// Update the schema validation for moneyRequests collection
db.runCommand({
  collMod: "moneyRequests",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["requestId", "amount", "currency", "senderUpiId", "recipientUpiId", "status"],
      properties: {
        requestId: {
          bsonType: "string",
          description: "must be a string and is required"
        },
        amount: {
          // Allow both integer and double types
          bsonType: ["double", "int", "decimal"], 
          description: "must be a number and is required"
        },
        currency: {
          bsonType: "string",
          enum: ["inr", "btc", "eth", "usdc", "dai"],
          description: "must be a valid currency code"
        },
        senderUpiId: {
          bsonType: "string",
          description: "UPI ID of person requesting money"
        },
        senderName: {
          bsonType: "string",
          description: "Name of person requesting money"
        },
        recipientUpiId: {
          bsonType: "string",
          description: "UPI ID of person who will pay"
        },
        status: {
          bsonType: "string",
          enum: ["pending", "completed", "rejected", "expired", "cancelled"],
          description: "Status of the money request"
        },
        timestamp: {
          bsonType: "date",
          description: "When the request was created"
        },
        expiresAt: {
          bsonType: "date",
          description: "When the request will expire"
        },
        note: {
          bsonType: "string",
          description: "Optional note with the request"
        }
      }
    }
  },
  validationLevel: "moderate"  // Use moderate validation to make it less strict
});

print("Schema updated successfully to accept both integer and double types.");

// Now try to insert the sample document again
if (db.moneyRequests.countDocuments() === 0) {
  db.moneyRequests.insertOne({
    requestId: "REQ" + Date.now(),
    amount: 1000.00,  // This will now be accepted regardless of how JavaScript handles it
    currency: "inr",
    senderUpiId: "sanjana@upicryptoconnect",
    senderName: "Sanjana Sharma",
    recipientUpiId: "eee3475@cryptoconnect",
    note: "Payment for services",
    status: "pending",
    timestamp: new Date(),
    expiresAt: new Date(Date.now() + 7*24*60*60*1000)
  });
  print("Sample money request inserted successfully");
}
