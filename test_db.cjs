require('dotenv').config({ path: '../our hive/.env' });
const mongoose = require('mongoose');
const PartnerProfile = require('../our hive/src/models/PartnerProfile.js');
const User = require('../our hive/src/models/User.js');

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  const count = await PartnerProfile.countDocuments();
  console.log(`Total Partners: ${count}`);
  const partners = await PartnerProfile.find().populate('userId').lean();
  console.log(JSON.stringify(partners, null, 2));
  process.exit(0);
}
test();
