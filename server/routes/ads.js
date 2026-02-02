const express = require('express');
const Ad = require('../models/Ad');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const ads = await Ad.find({ isActive: true });
    res.json(ads);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/all', auth, adminAuth, async (req, res) => {
  try {
    const ads = await Ad.find();
    res.json(ads);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const ad = new Ad(req.body);
    await ad.save();
    res.status(201).json(ad);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const ad = await Ad.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(ad);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    await Ad.findByIdAndDelete(req.params.id);
    res.json({ message: '广告已删除' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
