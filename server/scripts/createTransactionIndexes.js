/**
 * Script to create indexes on the transactions collection
 */

print("Creating indexes on transactions collection...");

try {
  // Drop the existing problematic index if it exists
  try {
    db.transactions.dropIndex("transactionId_idx");
    print("Dropped existing transactionId_idx index");
  } catch (e) {
    print("No existing index to drop or drop failed: " + e.message);
  }
  
  // Create the indexes one by one to better handle any errors
  db.transactions.createIndex(
    { "transactionId": 1 },
    { 
      unique: true, 
      name: "transactionId_idx",
      background: true 
    }
  );
  print("Created transactionId unique index");
  
  db.transactions.createIndex(
    { "senderUpiId": 1, "timestamp": -1 },
    { 
      name: "sender_timestamp_idx",
      background: true 
    }
  );
  print("Created sender_timestamp index");
  
  db.transactions.createIndex(
    { "recipientUpiId": 1, "timestamp": -1 },
    { 
      name: "recipient_timestamp_idx",
      background: true 
    }
  );
  print("Created recipient_timestamp index");
  
  db.transactions.createIndex(
    { "status": 1 },
    { 
      name: "status_idx",
      background: true 
    }
  );
  print("Created status index");
  
  print("All indexes created successfully!");
} catch (e) {
  print("Error creating indexes: " + e);
}
