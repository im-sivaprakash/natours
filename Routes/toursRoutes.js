const express = require('express');
const tourController = require('./../Controller/tourController');
const authController = require('./../Controller/authController');
const reviewRouter = require('./../Routes/reviewRoutes');
const router = express.Router();

router.use('/:tourId/review', reviewRouter);

router.route('/top-5-cheap').get(tourController.aliesTour, tourController.getAlltour);

router.route('/tour-stage').get(tourController.tourStatus);

router
  .route('/tour-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getLocation);
//tour-within/400/center/34.010528,-118.334336/unit/mi

router.route('/distance/:latlng/:unit').get(tourController.getDistance);
// /distance/34.010528,-118.334336/mi

router
  .route('/monthlyPlan/:year')
  .get(
    authController.protect,
    authController.restrict('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyplan
  );

router
  .route('/')
  .get(tourController.getAlltour)
  .post(
    authController.protect,
    authController.restrict('admin', 'lead-guide'),
    tourController.addTour
  );
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrict('admin', 'lead-guide'),
    tourController.uploadTourImages,
    tourController.resizeTourImgs,
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrict('admin', 'lead-guide'),
    tourController.deleteTour
  );

// router
//   .route('/:tourId/review')
//   .post(
//     authController.protect,
//     authController.restrict('user'),
//     reviewController.createReview
//   );

module.exports = router;
