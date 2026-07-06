import Notification from '../models/Notification.js';
import { getIo } from '../utils/socket.js';

export const createAndSendNotification = async ({ recipientId, actorId, type, title, body, actionUrl }) => {
  try {
    // Save to DB
    const notification = new Notification({
      recipientId,
      actorId,
      type,
      title,
      body,
      actionUrl
    });
    await notification.save();

    // Emit real-time via Socket.IO
    const io = getIo();
    io.to(`user_${recipientId}`).emit('new_notification', notification);

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};
