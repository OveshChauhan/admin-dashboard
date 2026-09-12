// Seeds development users and sample events so the dashboard is immediately usable after startup.
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Event = require("../models/Event");

async function seedAdminIfEmpty() {
  const count = await User.countDocuments();

  if (count > 0) {
    return;
  }

  const passwords = {
    admin: await bcrypt.hash("Admin@12345", 12),
    manager: await bcrypt.hash("Manager@12345", 12),
    tenant: await bcrypt.hash("Tenant@12345", 12)
  };

  const users = await User.insertMany([
    {
      name: "System Admin",
      email: "admin@example.com",
      passwordHash: passwords.admin,
      role: "admin",
      isActive: true
    },
    {
      name: "Operations Manager",
      email: "manager@example.com",
      passwordHash: passwords.manager,
      role: "manager",
      isActive: true
    },
    {
      name: "Acme Tenant",
      email: "tenant@example.com",
      passwordHash: passwords.tenant,
      role: "tenant",
      isActive: true
    }
  ]);

  const tenant = users.find(function (user) {
    return user.role === "tenant";
  });

  const manager = users.find(function (user) {
    return user.role === "manager";
  });

  await Event.insertMany([
    {
      title: "Tenant onboarding",
      description: "Initial onboarding and workspace setup.",
      eventDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      status: "scheduled",
      tenant: tenant._id,
      createdBy: manager._id
    },
    {
      title: "Quarterly review",
      description: "Review dashboard usage and operational KPIs.",
      eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: "scheduled",
      tenant: tenant._id,
      createdBy: manager._id
    },
    {
      title: "Completed onboarding",
      description: "Historical completed onboarding event.",
      eventDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      status: "completed",
      tenant: tenant._id,
      createdBy: manager._id
    }
  ]);

  console.log("Development seed data created.");
}

if (require.main === module) {
  require("dotenv").config();
  const mongoose = require("mongoose");

  mongoose
    .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/admin_dashboard")
    .then(async function () {
      await seedAdminIfEmpty();
      await mongoose.disconnect();
      process.exit(0);
    })
    .catch(function (error) {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { seedAdminIfEmpty };
