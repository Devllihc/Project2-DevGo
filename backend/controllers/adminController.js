import userModel from "../models/userModel.js";
import Tour from "../models/tour.js";
import bookingModel from "../models/bookingModel.js";

const EMPTY_STATUS_COUNTS = { pending: 0, confirmed: 0, completed: 0, cancelled: 0 };

export const getStats = async (req, res, next) => {
  try {
    const [totalUsers, totalTours, statusCounts, revenueResult, recentBookings, monthlyRevenue] = await Promise.all([
      userModel.estimatedDocumentCount(),
      Tour.estimatedDocumentCount(),
      bookingModel.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      bookingModel.aggregate([
        { $match: { status: { $in: ["confirmed", "completed"] } } },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } },
      ]),
      bookingModel.find().sort({ _id: -1 }).limit(5).select("tourTitle name email status"),
      bookingModel.aggregate([
        { $match: { status: { $in: ["confirmed", "completed"] } } },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            total: { $sum: "$totalPrice" },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),
    ]);

    const bookingsByStatus = { ...EMPTY_STATUS_COUNTS };
    statusCounts.forEach(({ _id, count }) => {
      if (_id in bookingsByStatus) bookingsByStatus[_id] = count;
    });

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedMonthlyRevenue = monthlyRevenue.map(item => ({
      name: `${months[item._id.month - 1]} ${item._id.year}`,
      revenue: item.total
    }));

    res.json({
      totalUsers,
      totalTours,
      bookingsByStatus,
      totalRevenue: revenueResult[0]?.total || 0,
      recentBookings,
      monthlyRevenue: formattedMonthlyRevenue,
    });
  } catch (error) {
    next(error);
  }
};
