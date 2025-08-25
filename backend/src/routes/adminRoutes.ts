import { Router } from 'express';

const router = Router();

// Placeholder routes - to be implemented
router.get('/dashboard', (req, res) => {
  res.json({ message: 'Admin dashboard - coming soon' });
});

router.get('/users', (req, res) => {
  res.json({ message: 'Admin users - coming soon' });
});

router.get('/products', (req, res) => {
  res.json({ message: 'Admin products - coming soon' });
});

router.get('/orders', (req, res) => {
  res.json({ message: 'Admin orders - coming soon' });
});

router.get('/analytics', (req, res) => {
  res.json({ message: 'Admin analytics - coming soon' });
});

export default router;
