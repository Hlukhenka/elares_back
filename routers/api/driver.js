const express = require('express');

const router = express.Router();

const ctrl = require('../../controllers/driver');
const { validateBody, authenticate } = require('../../middlewares');

router.post('/addDriver', authenticate, ctrl.addDriver);
router.put('/updateDriver', authenticate, ctrl.updateDriver);

module.exports = router;
