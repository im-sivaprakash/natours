module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'fail';

  if (err.message === 'No tour found !') {
    res.status(200).render('error', {
      title: '404 Not found',
      msg: 'No tour found with this Name',
    });
  } else {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
};
