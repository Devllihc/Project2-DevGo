import express from 'express';
import { getNotifications, markAsRead, markAllAsRead } from '../controllers/notificationController.js';
import { createAndSendNotification } from '../services/notificationService.js';

const router = express.Router();

// Mock auth middleware for demonstration in plan. In actual execution, use the real one.
// Replace this with your actual auth middleware `protect` from your app
const protect = (req, res, next) => {
  // Try to use req.user if it exists, otherwise provide a mock
  if (!req.user) {
    req.user = { _id: '60d21b4667d0d8992e610c85' }; // Mock ObjectId for testing
  }
  next();
};

router.use(protect); // Require auth for all notification routes
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
