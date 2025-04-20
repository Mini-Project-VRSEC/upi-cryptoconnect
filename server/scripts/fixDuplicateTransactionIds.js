/**
 * Script to fix duplicate transaction IDs in MongoDB
 */

// Print a message at the start
print("Starting script to fix duplicate transaction IDs...");

// Find all duplicate transaction IDs
const findDuplicates = db.transactions.aggregate([
  { $group: { _id: "$transactionId", count: { $sum: 1 }, ids: { $push: "$_id" } } },
  { $match: { count: { $gt: 1 } } }
]).toArray();

print(`Found ${findDuplicates.length} duplicate transactionId values`);

// Process each duplicate to assign new IDs
let totalFixed = 0;
findDuplicates.forEach(duplicate => {
  const duplicateTxnId = duplicate._id;
  print(`Fixing duplicate transactionId: ${duplicateTxnId}`);
  
  // Keep first occurrence, update others with new IDs
  for (let i = 1; i < duplicate.ids.length; i++) {
    const newTxnId = `TXN-${new Date().getTime()}-${Math.floor(Math.random() * 10000)}`;
    
    db.transactions.updateOne(
      { _id: duplicate.ids[i] },
      { $set: { transactionId: newTxnId } }
    );
    
    print(`Updated transaction ${duplicate.ids[i]} with new ID: ${newTxnId}`);
    totalFixed++;
  }
});

// Fix any null or undefined transaction IDs
const nullResults = db.transactions.updateMany(
  { $or: [
      { transactionId: null },
      { transactionId: "" },
      { transactionId: { $exists: false } }
    ]
  },
  { $set: { transactionId: `TXN-${new Date().getTime()}-${Math.floor(Math.random() * 10000)}` } }
);

print(`Fixed ${totalFixed} duplicate transaction IDs and ${nullResults.modifiedCount} null IDs.`);

// Verify no more duplicates exist
const remainingDuplicates = db.transactions.aggregate([
  { $group: { _id: "$transactionId", count: { $sum: 1 } } },
  { $match: { count: { $gt: 1 } } }
]).toArray();

if (remainingDuplicates.length === 0) {
  print("SUCCESS: All duplicate transaction IDs have been fixed!");
} else {
  print(`WARNING: There are still ${remainingDuplicates.length} duplicate transaction IDs. Please run the script again.`);
}
