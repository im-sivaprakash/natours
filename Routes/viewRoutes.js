const express = require('express');
const viewController = require('../Controller/viewController');
const authController = require('../Controller/authController');

const router = express.Router();

router.get('/', authController.isLoggedIn, viewController.getOverview);

router.get('/tour/:slug', authController.isLoggedIn, viewController.getTour);

router.get('/login', authController.isLoggedIn, viewController.login);

router.get('/me', authController.protect, viewController.getAccout);

router.get('/my-tours', authController.protect, viewController.getMyTours);

module.exports = router;
