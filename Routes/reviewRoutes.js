const express = require('express');
const authController = require('./../Controller/authController');
const reviewController = require('./../Controller/reviewController');
const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
  .route('/')
  .get(reviewController.getAllReview)
  .post(
    authController.restrict('user'),
    reviewController.setTourUserIds,
    reviewController.createReview
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .delete(authController.restrict('user', 'admin'), reviewController.delete)
  .patch(authController.restrict('user', 'admin'), reviewController.updateReview);

module.exports = router;
