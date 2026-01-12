// models/Idempotency.js
const mongoose = require('mongoose');

const idempotencySchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Idempotency', idempotencySchema);
