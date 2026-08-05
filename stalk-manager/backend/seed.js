// backend/seed.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullName: String, username: String, password: String, role: String,
  mobileNumber: String, address: String, shopName: String, agencyName: String, shopTimings: String
});
const User = mongoose.model('User', userSchema);

const orderSchema = new mongoose.Schema({
  storeOwnerId: String, shopName: String, address: String, mobileNumber: String, items: Array, totalBillAmount: Number, totalSuppliedBreads: Number, date: { type: Date, default: Date.now }
});
const Order = mongoose.model('Order', orderSchema);

mongoose.connect('mongodb://127.0.0.1:27017/stalkManager').then(async () => {
  console.log("Scrubbing obsolete database schemas...");
  await User.deleteMany({});
  await Order.deleteMany({});

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash('12345', salt);

  await User.create([
    { 
      fullName: 'Anand Nadar', username: 'anand', password: hash, role: 'store_owner', 
      shopName: 'Anand Fresh Bakery', address: 'Shop 12, Andheri West, Mumbai', 
      mobileNumber: '9876543210', shopTimings: '08:00 AM - 10:30 PM' 
    },
    { 
      fullName: 'Rajesh Sathya', username: 'dist', password: hash, role: 'distributor', 
      agencyName: 'Master Fleet Logistics', address: 'Warehouse 4, BKC Hub, Mumbai', 
      mobileNumber: '9123456780' 
    }
  ]);

  await Order.create({
    storeOwnerId: 'anand', shopName: 'Anand Fresh Bakery', address: 'Shop 12, Andheri West, Mumbai', mobileNumber: '9876543210',
    items: [
      { breadVariety: 'Whole Wheat Bread', pricePerBread: 20, targetStock: 5, currentLeft: 1, expired: 1, suppliedBreads: 5, billableBreads: 4, itemTotal: 80 },
      { breadVariety: 'White Bread (400 gm)', pricePerBread: 30, targetStock: 8, currentLeft: 2, expired: 0, suppliedBreads: 6, billableBreads: 6, itemTotal: 180 }
    ],
    totalBillAmount: 260, totalSuppliedBreads: 11
  });

  console.log("✅ SUCCESS! Clean database generated with full contact details.");
  process.exit();
});