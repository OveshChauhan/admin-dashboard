// Provides server-side event listing, creation, updating, and deletion with tenant scoping.
const Event = require("../models/Event");
const User = require("../models/User");

function pagination(req) {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
  return { page, limit, skip: (page - 1) * limit };
}

async function getEvents(req, res, next) {
  try {
    const { page, limit, skip } = pagination(req);
    const filter = {};
    const search = String(req.query.search || "").trim();

    if (req.user.role === "tenant") {
      filter.tenant = req.user._id;
    } else if (req.query.tenant) {
      filter.tenant = req.query.tenant;
    }

    if (req.query.status && ["scheduled", "completed", "cancelled"].includes(req.query.status)) {
      filter.status = req.query.status;
    }

    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }

    if (req.query.from || req.query.to) {
      filter.eventDate = {};
      if (req.query.from) filter.eventDate.$gte = new Date(`${req.query.from}T00:00:00.000Z`);
      if (req.query.to) filter.eventDate.$lte = new Date(`${req.query.to}T23:59:59.999Z`);
    }

    const [items, total] = await Promise.all([
      Event.find(filter)
        .populate("tenant", "name email")
        .populate("createdBy", "name email")
        .sort({ eventDate: req.query.order === "asc" ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Event.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      data: {
        items,
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

async function createEvent(req, res, next) {
  try {
    const { title, description, eventDate, status, tenant } = req.body;

    if (!title || !eventDate || !tenant) {
      return res.status(400).json({
        success: false,
        message: "Title, event date, and tenant are required."
      });
    }

    if (!["scheduled", "completed", "cancelled"].includes(status || "scheduled")) {
      return res.status(400).json({
        success: false,
        message: "Invalid event status."
      });
    }

    const tenantUser = await User.findOne({ _id: tenant, role: "tenant" });

    if (!tenantUser) {
      return res.status(400).json({
        success: false,
        message: "A valid tenant user is required."
      });
    }

    const event = await Event.create({
      title,
      description: description || "",
      eventDate: new Date(eventDate),
      status: status || "scheduled",
      tenant,
      createdBy: req.user._id
    });

    const populated = await event.populate([
      { path: "tenant", select: "name email" },
      { path: "createdBy", select: "name email" }
    ]);

    res.status(201).json({
      success: true,
      data: { event: populated }
    });
  } catch (error) {
    next(error);
  }
}

async function updateEvent(req, res, next) {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found."
      });
    }

    const { title, description, eventDate, status, tenant } = req.body;

    if (title !== undefined) event.title = title;
    if (description !== undefined) event.description = description;
    if (eventDate !== undefined) event.eventDate = new Date(eventDate);
    if (status !== undefined) {
      if (!["scheduled", "completed", "cancelled"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid event status."
        });
      }
      event.status = status;
    }

    if (tenant !== undefined) {
      const tenantUser = await User.findOne({ _id: tenant, role: "tenant" });
      if (!tenantUser) {
        return res.status(400).json({
          success: false,
          message: "A valid tenant user is required."
        });
      }
      event.tenant = tenant;
    }

    await event.save();

    const populated = await event.populate([
      { path: "tenant", select: "name email" },
      { path: "createdBy", select: "name email" }
    ]);

    res.status(200).json({
      success: true,
      data: { event: populated }
    });
  } catch (error) {
    next(error);
  }
}

async function deleteEvent(req, res, next) {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found."
      });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent
};
