// Provides server-side user listing, lookup, creation, updating, and admin-only deletion.
const bcrypt = require("bcryptjs");
const User = require("../models/User");

function sanitize(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

function getPagination(req) {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
  return { page, limit, skip: (page - 1) * limit };
}

async function getUsers(req, res, next) {
  try {
    const { page, limit, skip } = getPagination(req);
    const search = String(req.query.search || "").trim();
    const role = String(req.query.role || "").trim();
    const sortField = ["name", "createdAt", "email"].includes(req.query.sort)
      ? req.query.sort
      : "createdAt";
    const direction = req.query.order === "asc" ? 1 : -1;

    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    if (["admin", "manager", "tenant"].includes(role)) {
      filter.role = role;
    }

    const [items, total] = await Promise.all([
      User.find(filter)
        .select("-passwordHash -refreshTokenHash")
        .sort({ [sortField]: direction })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      data: {
        items: items.map(sanitize),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

async function getUserById(req, res, next) {
  try {
    const user = await User.findById(req.params.id)
      .select("-passwordHash -refreshTokenHash")
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    res.status(200).json({
      success: true,
      data: { user: sanitize(user) }
    });
  } catch (error) {
    next(error);
  }
}

async function createUser(req, res, next) {
  try {
    const { name, email, password, role, isActive } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password, and role are required."
      });
    }

    if (!["admin", "manager", "tenant"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role."
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters."
      });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered."
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      passwordHash,
      role,
      isActive: isActive !== false
    });

    res.status(201).json({
      success: true,
      data: { user: sanitize(user) }
    });
  } catch (error) {
    next(error);
  }
}

async function updateUser(req, res, next) {
  try {
    const { name, email, password, role, isActive } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email.toLowerCase().trim();
    if (role !== undefined) {
      if (!["admin", "manager", "tenant"].includes(role)) {
        return res.status(400).json({
          success: false,
          message: "Invalid role."
        });
      }
      user.role = role;
    }
    if (isActive !== undefined) user.isActive = Boolean(isActive);

    if (password) {
      if (password.length < 8) {
        return res.status(400).json({
          success: false,
          message: "Password must contain at least 8 characters."
        });
      }
      user.passwordHash = await bcrypt.hash(password, 12);
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: { user: sanitize(user) }
    });
  } catch (error) {
    next(error);
  }
}

async function deleteUser(req, res, next) {
  try {
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account."
      });
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};
