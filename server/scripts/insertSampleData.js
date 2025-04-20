if (db.moneyRequests.countDocuments() === 0) {
  db.moneyRequests.insertOne({
    requestId: "REQ" + Date.now(),
    // Add decimal point to ensure it's stored as a double
    amount: 1000.00,  // or use explicit: Number(1000.00).toFixed(2)
    currency: "inr",
    senderUpiId: "sanjana@upicryptoconnect",
    senderName: "Sanjana Sharma",
    recipientUpiId: "eee3475@cryptoconnect",
    note: "Payment for services",
    status: "pending",
    timestamp: new Date(),
    expiresAt: new Date(Date.now() + 7*24*60*60*1000)
  });
  print("Sample money request inserted");
}
