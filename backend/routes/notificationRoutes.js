import express from 'express';
import { getNotifications, markAsRead, markAllAsRead } from '../controllers/notificationController.js';
import { createAndSendNotification } from '../services/notificationService.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyToken); // Require auth for all notification routes
router.get('/', getNotifications);
router.put('/read-all', markAllAsRead);
router.put('/:id/read', markAsRead);

// TEST ROUTE TO TRIGGER A NOTIFICATION
router.post('/test', async (req, res) => {
  try {
    const notification = await createAndSendNotification({
      recipientId: req.user._id,
      type: 'SUCCESS',
      title: 'Hệ thống đã kết nối!',
      body: 'Đây là thông báo test để kiểm tra tính năng realtime.',
    });
    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
