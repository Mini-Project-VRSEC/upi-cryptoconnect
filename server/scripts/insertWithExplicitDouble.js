if (db.moneyRequests.countDocuments() === 0) {
  const amount = 1000.00;
  
  // Insert with explicit double conversion
  db.moneyRequests.insertOne({
    requestId: "REQ" + Date.now(),
    // Force MongoDB to store as double
    amount: { $convert: { input: amount, to: "double" } },
    currency: "inr",
    senderUpiId: "sanjana@upicryptoconnect",
    senderName: "Sanjana Sharma",
    recipientUpiId: "eee3475@cryptoconnect",
    note: "Payment for services",
    status: "pending",
    timestamp: new Date(),
    expiresAt: new Date(Date.now() + 7*24*60*60*1000)
  });
  
  print("Sample money request inserted with explicit double conversion");
}
