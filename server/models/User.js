const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    trim: true
  },
  upiId: {
    type: String,
    unique: true,
    sparse: true, // Allows null values
    trim: true
  },
  wallets: {
    fiat: {
      balance: {
        type: Number,
        default: 0
      }
    },
    crypto: {
      btc: {
        type: Number,
        default: 0
      },
      eth: {
        type: Number,
        default: 0
      },
      usdc: {
        type: Number,
        default: 0
      },
      dai: {
        type: Number,
        default: 0
      }
    }
  },
  kyc: {
    status: {
      type: String,
      enum: ['not_submitted', 'pending', 'verified', 'rejected'],
      default: 'not_submitted'
    },
    documents: {
      idProof: String,
      addressProof: String
    },
    verifiedAt: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare password
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
