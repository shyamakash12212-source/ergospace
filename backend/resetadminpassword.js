const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const readline = require("readline");
require("dotenv").config();

const Admin = require("./models/Admin");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function resetPassword() {
  try {
    const username = await new Promise((resolve) =>
      rl.question("Enter existing admin username: ", resolve)
    );

    const password = await new Promise((resolve) =>
      rl.question("Enter new password (minimum 12 characters): ", resolve)
    );

    if (password.length < 12) {
      throw new Error("Password must be at least 12 characters.");
    }

    await mongoose.connect(process.env.MONGO_URI);

    const admin = await Admin.findOne({ username: username.trim() });

    if (!admin) {
      throw new Error("Admin username not found.");
    }

    admin.password = await bcrypt.hash(password, 12);
    await admin.save();

    console.log("Admin password updated successfully!");
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await mongoose.disconnect().catch(() => {});
    rl.close();
  }
}

resetPassword();