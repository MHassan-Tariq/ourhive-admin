const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: '../our hive/.env' });

// We define the schemas here to avoid path issues with ES modules/CJS mix
const UserSchema = new mongoose.Schema({ role: String });
const User = mongoose.models.User || mongoose.model('User', UserSchema);

const OpportunitySchema = new mongoose.Schema({
  partnerId: mongoose.Schema.Types.ObjectId,
  title: String,
  description: String,
  location: String,
  specificLocation: String,
  date: Date,
  time: String,
  endTime: String,
  category: String,
  requiredVolunteers: Number,
  status: String,
  imageurl: String,
  attendees: [mongoose.Schema.Types.ObjectId]
}, { timestamps: true });
const Opportunity = mongoose.models.Opportunity || mongoose.model('Opportunity', OpportunitySchema);

async function createEvent() {
  try {
    console.log('Connecting to:', process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);
    
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.error('No admin found');
      process.exit(1);
    }

    const today = new Date();
    const event = await Opportunity.create({
      partnerId: admin._id,
      title: 'Annual Community Food Drive',
      description: 'Join us for our biggest event of the year! We need enthusiastic volunteers to help sort and pack fresh produce for local families in need.',
      location: 'Community Center Hall',
      specificLocation: '123 Marie Ave, Springfield, IL',
      date: today,
      time: '9:00 AM',
      endTime: '11:59 PM',
      category: 'Food Security',
      requiredVolunteers: 25,
      status: 'Confirmed',
      imageurl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433',
      attendees: []
    });

    console.log('SUCCESS: Created event with ID:', event._id);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

createEvent();
