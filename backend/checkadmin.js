require("dotenv").config();
const mongoose = require("mongoose");
const Admin = require("./models/Admin");

async function checkAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const admins = await Admin.find({}, { username: 1, _id: 0 });
    console.log("Existing admin usernames:", admins);
  } catch (error) {
    console.log("Error:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

checkAdmin();
