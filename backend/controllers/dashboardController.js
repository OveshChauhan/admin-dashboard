// Uses MongoDB aggregation pipelines to calculate dashboard KPIs and role/event analytics server-side.
const User = require("../models/User");
const Event = require("../models/Event");

async function getStats(req, res, next) {
  try {
    const userMatch = req.user.role === "tenant"
      ? { _id: req.user._id }
      : {};

    const eventMatch = req.user.role === "tenant"
      ? { tenant: req.user._id }
      : {};

    const [
      userSummary,
      roleDistribution,
      eventSummary,
      eventTrend
    ] = await Promise.all([
      User.aggregate([
        { $match: userMatch },
        {
          $group: {
            _id: null,
            totalUsers: { $sum: 1 },
            activeUsers: {
              $sum: { $cond: ["$isActive", 1, 0] }
            }
          }
        }
      ]),
      User.aggregate([
        { $match: userMatch },
        {
          $group: {
            _id: "$role",
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]),
      Event.aggregate([
        { $match: eventMatch },
        {
          $group: {
            _id: null,
            totalEvents: { $sum: 1 },
            scheduled: {
              $sum: { $cond: [{ $eq: ["$status", "scheduled"] }, 1, 0] }
            },
            completed: {
              $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
            },
            cancelled: {
              $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] }
            }
          }
        }
      ]),
      Event.aggregate([
        { $match: eventMatch },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$eventDate"
              }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id": 1 } },
        { $limit: 30 }
      ])
    ]);

    const users = userSummary[0] || { totalUsers: 0, activeUsers: 0 };
    const events = eventSummary[0] || {
      totalEvents: 0,
      scheduled: 0,
      completed: 0,
      cancelled: 0
    };

    res.status(200).json({
      success: true,
      data: {
        users,
        events,
        roleDistribution,
        eventTrend: eventTrend.map(function (item) {
          return {
            date: item._id,
            count: item.count
          };
        })
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getStats };
