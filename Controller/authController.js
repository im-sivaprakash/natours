const User = require('./../Model/userModel');
const catchAsync = require('../utils/catcherr');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const AppErr = require('../utils/appError');
const sendEmail = require('../utils/email');
const crypto = require('crypto');

const sigleToken = (id) => {
  return jwt.sign({ id }, process.env.SEC_STR, {
    expiresIn: process.env.SEC_DUR,
  });
};

const createSendToken = (user, statusCode, res, req) => {
  const token = sigleToken(user._id);
  const cookieOption = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    // secure: req.secure || req.headers['x-forwarded-proto'] === 'https'
  };

  // if (process.env.NODE_ENV === 'production')
  // cookieOption.secure = true;

  res.cookie('jwt', token, cookieOption);

  //remove the password from the output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUSer = await User.create(req.body);
  const url = `${req.protocol}://${req.get('host')}/me`;
  console.log(url);

  await new sendEmail(newUSer, url).setWelcome();
  createSendToken(newUSer, 201, res, req);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //1) check pass and email exist
  if (!email || !password) {
    return next(new AppErr('Enter the Email/password', 400));
  }

  //2)Check if user exits && password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppErr('Incorrect Email or Password', 401));
  }

  //3)if everything ok, send token to client
  createSendToken(user, 200, res, req);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  console.log(req.cookies.jwt);
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    console.log(req.headers.authorization, 'protect');
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  //1) check the token
  if (!token) {
    return next(new AppErr('You must login dood .. do that first'));
  }

  //2)verification token
  const decoded = await promisify(jwt.verify)(token, process.env.SEC_STR);

  //3)check if the user still exist
  const freshUser = await User.findById(decoded.id);

  if (!freshUser) {
    return next(new AppErr('user have been deleted', 401));
  }

  //4)Check if the user change password after the token was issused
  if (freshUser.changePasswordAfter(decoded.iat)) {
    return next(new AppErr('user recently changed Password! log in agin', 401));
  }

  //grant access
  req.user = freshUser;
  res.locals.user = freshUser;

  next();
});

exports.isLoggedIn = async (req, res, next) => {
  const token = req.cookies.jwt;

  if (req.cookies.jwt) {
    try {
      //1)verification token
      const decoded = await promisify(jwt.verify)(token, process.env.SEC_STR);
      console.log(decoded, 'hellooo');
      //2)check if the user still exist
      const freshUser = await User.findById(decoded.id);

      if (!freshUser) {
        return next();
      }
      //4)Check if the user change password after the token was issused
      if (freshUser.changePasswordAfter(decoded.iat)) {
        return next();
      }
      //There is a loggin user
      console.log(freshUser);
      res.locals.user = freshUser;
      console.log(res.locals.user, 'daii');
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

exports.doLogout = (req, res, next) => {
  res.cookie('jwt', 'Logedout', {
    expires: new Date(Date.now + 10000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};

exports.restrict = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppErr('Access denied!!', 403));
    }
    next();
  };
};

exports.forgetPassword = catchAsync(async (req, res, next) => {
  //1)get user based on the POST request

  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppErr(' Email not found', 404));
  }

  //2)Generate random reset token
  const resetToken = user.createPasswordResetToken();

  await user.save({ validateBeforeSave: false });

  //3)sent mail
  const reset = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  // const message = `Forget Your password ? just click the following link  to  change it ${reset}.\nif you remember ignore it`;

  try {
    await new sendEmail(user, reset).sendResetPassword();

    res.status(200).json({
      status: 'success',
      message: 'token sent to email',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new AppErr('there was a error in mail', 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //1) encrypting the token
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  //2)finding the user relavent to the token
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  //3) if token expired or user not found.
  if (!user) {
    return next(new AppErr('Token is invalid or expired', 400));
  }

  //4)update change at property for the user
  console.log(req.body.password, req.body.passwordConfirm);
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetExpires = undefined;
  user.passwordResetToken = undefined;
  user.passwordChangeAt = Date.now() - 1000;
  await user.save();

  //5) log the user in ..
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //1) Get the user from the collection
  const user = await User.findById(req.user.id).select('+password');

  //2)Check if posted current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppErr('Your Current password is wrong', 401));
  }

  //3)if so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  await user.save();

  createSendToken(user, 200, res);
});
