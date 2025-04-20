db.runCommand({
  collMod: "moneyRequests",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["requestId", "amount", "currency", "senderUpiId", "recipientUpiId", "status"],
      properties: {
        // ...other properties...
        amount: {
          bsonType: ["double", "int", "decimal"],  // Accept multiple numeric types
          description: "must be a number and is required"
        },
        // ...other properties...
      }
    }
  },
  validationLevel: "moderate"
});

print("Schema updated to accept both integer and double types for amount");
