const express = require('express');
const morgan = require('morgan');
const path = require('path');
const helmet = require('helmet');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const tourRouter = require('./Routes/toursRoutes');
const userRouter = require('./Routes/userRoutes');
const viewRouter = require('./Routes/viewRoutes');
const bookingRouter = require('./Routes/bookingRoutes');
const reviewRouter = require('./Routes/reviewRoutes');
const AppError = require('./utils/appError');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const ErrorController = require('./Controller/ErrorController');

const app = express();

app.use(cors());
app.use(cookieParser());

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(helmet());

app.use(morgan('dev'));

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this IP, try again later',
});

app.use('/api', limiter);

app.use(express.json({ limit: '10kb' }));

//No SQL -qurrey injection
app.use(mongoSanitize());

//Data Sanitization  XSS
app.use(xss());

//Prevent Parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

app.use((req, res, next) => {
  //console.log(req.cookies);
  next();
});

//============================================Routers==============================
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

//============================================Error handler=========================
app.use(express.static(path.join(__dirname, 'public')));

app.all('*', (req, res, next) => {
  const err = new AppError(`Can't Find the ${req.url} URL in sever`);
  next(err);
});

app.use(ErrorController);

module.exports = app;
