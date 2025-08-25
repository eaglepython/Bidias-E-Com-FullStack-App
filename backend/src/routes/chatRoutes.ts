import { Router } from 'express';

const router = Router();

// Placeholder routes - to be implemented
router.post('/message', (req, res) => {
  res.json({ message: 'Chat message - coming soon' });
});

router.get('/history', (req, res) => {
  res.json({ message: 'Chat history - coming soon' });
});

router.get('/suggestions', (req, res) => {
  res.json({ message: 'Chat suggestions - coming soon' });
});

export default router;
