const mongoose = require('mongoose');

const instagramSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  instagram: { type: String, required: true },
});

const Instagram = mongoose.model('Instagram', instagramSchema);

module.exports = Instagram;
