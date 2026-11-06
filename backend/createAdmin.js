const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const readline = require("readline");
require("dotenv").config();

const Admin = require("./models/Admin");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function createAdmin() {
  try {
    const username = await new Promise((resolve) =>
      rl.question("Enter admin username: ", resolve)
    );

    const password = await new Promise((resolve) =>
      rl.question("Enter admin password: ", resolve)
    );

    if (!username.trim() || password.length < 12) {
      throw new Error("Username is required; password must be at least 12 characters.");
    }

    await mongoose.connect(process.env.MONGO_URI);

    const existingAdmin = await Admin.findOne({ username: username.trim() });

    if (existingAdmin) {
      throw new Error("This admin username already exists.");
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await Admin.create({
      username: username.trim(),
      password: hashedPassword,
    });

    console.log("Admin account created successfully!");
  } catch (error) {
    console.error("Admin setup failed:", error.message);
  } finally {
    await mongoose.disconnect().catch(() => {});
    rl.close();
  }
}

createAdmin();