import { generateToken } from "../../utils/jwtTokens.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import { User } from "../models/userSchema.js";
import { v2 as cloudinary } from "cloudinary";

export const register = catchAsyncError(async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler("Avatar and Resume are required", 400));
  }

  const { avatar, resume } = req.files;

  if (!avatar || !resume) {
    return next(new ErrorHandler("Avatar and Resume are required", 400));
  }

  const cloudinaryResponseForAvatar = await cloudinary.uploader.upload(
    avatar.tempFilePath,
    { folder: "AVATARS" }
  );

  if (!cloudinaryResponseForAvatar || cloudinaryResponseForAvatar.error) {
    return next(new ErrorHandler("Failed to upload avatar to Cloudinary", 500));
  }

  const cloudinaryResponseForResume = await cloudinary.uploader.upload(
    resume.tempFilePath,
    { folder: "RESUMES", resource_type: "raw" }
  );

  if (!cloudinaryResponseForResume || cloudinaryResponseForResume.error) {
    return next(new ErrorHandler("Failed to upload resume to Cloudinary", 500));
  }

  const {
    fullName, email, phone, aboutMe, password,
    portfolioURL, githubURL, instagramURL,
    twitterURL, facebookURL, linkedInURL,
  } = req.body;

  const user = await User.create({
    fullName, email, phone, aboutMe, password,
    portfolioURL, githubURL, instagramURL,
    twitterURL, facebookURL, linkedInURL,
    avatar: {
      public_id: cloudinaryResponseForAvatar.public_id,
      url: cloudinaryResponseForAvatar.secure_url,
    },
    resume: {
      public_id: cloudinaryResponseForResume.public_id,
      url: cloudinaryResponseForResume.secure_url,
    },
  });

  generateToken(user , "userRegistered!" , 201 ,res)
  
});

export const login = catchAsyncError(async (req, res, next) => {

  console.log(req.body);
  const { email, password } = req.body || {};

  if (!email || !password) {
    return next(
      new ErrorHandler("Email and Password are required", 400)
    );
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(
      new ErrorHandler("Invalid Email or Password", 401)
    );
  }

  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return next(
      new ErrorHandler("Invalid Email or Password", 401)
    );
  }

  generateToken(user, "Logged In Successfully", 200, res);
});