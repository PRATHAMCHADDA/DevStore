import { Notification } from '../models/index.js';

export const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    // Admins see admin notices, custom users see their own
    const query = req.user.role === 'admin' 
      ? { $or: [{ userId }, { userId: 'admin' }] } 
      : { userId };

    const list = await Notification.find(query);
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.status(200).json(list);
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found.' });
    }

    if (notification.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const updated = await Notification.findByIdAndUpdate(id, { read: true }, { new: true });
    res.status(200).json({ message: 'Notification read.', notification: updated });
  } catch (error) {
    next(error);
  }
};

export const markAllRead = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const list = await Notification.find({ userId, read: false });

    for (const item of list) {
      await Notification.findByIdAndUpdate(item._id, { read: true });
    }

    res.status(200).json({ message: 'All notifications marked as read.' });
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found.' });
    }

    if (notification.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied.' });
    }

    await Notification.findByIdAndDelete(id);
    res.status(200).json({ message: 'Notification removed.' });
  } catch (error) {
    next(error);
  }
};
