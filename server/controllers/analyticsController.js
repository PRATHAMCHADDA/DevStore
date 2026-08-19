import { Revenue, Analytics, Payment } from '../models/index.js';
import { Op } from 'sequelize';

export const getSalesAnalytics = async (req, res, next) => {
  try {
    // If request user is not admin, deny
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied.' });
    }

    // Fetch last 7 days of revenue entries
    const today = new Date();
    const pastDate = new Date();
    pastDate.setDate(today.getDate() - 7);

    const revenueRecords = await Revenue.findAll({
      where: {
        date: {
          [Op.gte]: pastDate.toISOString().split('T')[0]
        }
      },
      order: [['date', 'ASC']]
    });

    // Event view trends
    const viewsCount = await Analytics.count({
      where: { eventType: 'view_item' }
    });

    const searchesCount = await Analytics.count({
      where: { eventType: 'search' }
    });

    // Format analytics response
    res.status(200).json({
      revenueRecords: revenueRecords.map(r => ({
        date: r.date,
        orders: r.ordersCount,
        gross: parseFloat(r.grossRevenue),
        net: parseFloat(r.netRevenue),
        discounts: parseFloat(r.discountsApplied)
      })),
      clicks: {
        viewItem: viewsCount,
        searchQuery: searchesCount
      }
    });
  } catch (error) {
    next(error);
  }
};
