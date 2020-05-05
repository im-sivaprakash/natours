const catchAsync = require('../utils/catcherr');
const AppErr = require('../utils/appError');
const ApiFeatures = require('./../utils/apiFeatures');

exports.deleteOne = Model =>
  catchAsync(async (req, res) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return new AppErr('NO  doc found with this ID', 404);
    }
    res.status(201).json({
      status: 'successfully Deleted',
      data: null
    });
  });

exports.updateOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!doc) {
      return next(new AppErr('No Document found ', 404));
    }

    res.status(201).json({
      status: 'success',
      data: { doc }
    });
  });

exports.createOne = Model =>
  catchAsync(async (req, res, next) => {
    const newData = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        tour: newData
      }
    });
  });

exports.getOne = (Model, popOption) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);

    if (popOption) query = query.populate(popOption);

    const doc = await query;

    if (!doc) {
      return next(new AppErr('NO doc found with this ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: doc
    });
  });

exports.getAll = Model =>
  catchAsync(async (req, res) => {
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    const features = new ApiFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limit()
      .paginate();
    const doc = await features.query;

    res.status(200).json({
      status: 'success',
      result: doc.length,
      data: doc
    });
  });
