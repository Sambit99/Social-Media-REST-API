import { NextFunction, Request, Response } from 'express';
import { AsyncHandler } from '../util/AsyncHandler';
import { loginSchema, signUpSchema } from '../schema/auth.schema';
import ApiError from '../util/ApiError';
import statusCodes from '../constant/statusCodes';
import responseMessage from '../constant/responseMessage';
import { User } from '../model/user.model';
import ApiResponse from '../util/ApiResponse';
const cookieOptions = {
  httpOnly: true,
  secure: true
};
const generateAccessAndRefreshTokens = async (_id: string) => {
  const user = await User.findById(_id);

  if (!user) return;

  const accessToken = user?.generateAccessToken();
  const refreshToken = user?.generateRefreshToken();

  user.refreshToken = refreshToken;
  // Note: We use validateBeforeSave to false to stop validation from our model.
  // Note: As we have marked multiple fields required in the model but only updating with one value
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

const signUp = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const validation = signUpSchema.safeParse(req.body);
  if (!validation.success)
    return ApiError(next, validation.error.errors, req, statusCodes.BAD_REQUEST, responseMessage.BAD_REQUEST);

  const { username, fullname, email, password } = validation.data;

  const isUserExists = await User.findOne({ $or: [{ username }, { email }] });
  if (isUserExists)
    return ApiError(
      next,
      new Error('User with username/email already exists. Please login'),
      req,
      statusCodes.UNAUTHENTICATED
    );

  const newUser = await User.create({ username, fullname, email, password });
  const tokens = await generateAccessAndRefreshTokens(newUser._id);
  let accessToken, refreshToken;
  if (tokens) {
    accessToken = tokens.accessToken;
    refreshToken = tokens.refreshToken;
  }

  res.cookie('accessToken', accessToken, cookieOptions);
  res.cookie('refreshToken', refreshToken, cookieOptions);

  if (!newUser)
    return ApiError(next, new Error('Error while creating new user'), req, statusCodes.INTERNAL_SERVER_ERROR);

  return ApiResponse(req, res, statusCodes.CREATED, responseMessage.SUCCESS, newUser);
});

const login = AsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success)
      return ApiError(next, validation.error.errors, req, statusCodes.UNAUTHENTICATED, responseMessage.UNAUTHENTICATED);

    const { username, email, password } = validation.data;

    const existingUser = await User.findOne({ $or: [{ username }, { email }] }).select('+password -__v');
    if (!existingUser) return ApiError(next, new Error(`User doesn't exist`), req, statusCodes.BAD_REQUEST);

    const isValidPassword = await existingUser.validatePassword(password);
    if (!isValidPassword)
      return ApiError(next, new Error(`Invalid Username/Email/Password`), req, statusCodes.BAD_REQUEST);

    existingUser.password = '';
    const tokens = await generateAccessAndRefreshTokens(existingUser._id);
    let accessToken, refreshToken;
    if (tokens) {
      accessToken = tokens.accessToken;
      refreshToken = tokens.refreshToken;
    }

    res.cookie('accessToken', accessToken, cookieOptions);
    res.cookie('refreshToken', refreshToken, cookieOptions);

    return ApiResponse(req, res, statusCodes.OK, responseMessage.SUCCESS, existingUser);
  } catch (error) {
    return ApiError(next, error, req);
  }
});

export { signUp, login };
