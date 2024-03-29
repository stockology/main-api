import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import { User } from "../models/User.js";
import { Contact } from "../models/Contact.js";
import { sendToken } from "../utils/sendToken.js";
import { sendEmail } from "../utils/sendEmail.js";
import crypto from "crypto";
import { Course } from "../models/Course.js";
import cloudinary from "cloudinary";
import getDataUri from "../utils/dataUri.js";
import { Stats } from "../models/Stats.js";
import { Webinar } from "../models/Webinar.js";
import { Notification } from "../models/Notification.js";
import { Partners } from "../models/Partners.js";
import { subscribeNow } from "../models/subscribeNow.js";

export const register = catchAsyncError(async (req, res, next) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !phone || !password)
    return next(new ErrorHandler("Please enter all field", 400));

  let user = await User.findOne({ email });

  if (user) return next(new ErrorHandler("User Already Exist", 409));
  user = await User.create({
    name,
    email,
    phone,
    password,
  });
  sendToken(res, user, "Registered Successfully", 201);
});
export const partnersregister = catchAsyncError(async (req, res, next) => {
  const { firstName, lastname, phone, email, referralId, password } = req.body;

  if (!firstName || !lastname || !phone || !email || !password)
    return next(new ErrorHandler("Please enter all field", 400));

  let partner = await Partners.findOne({ phone });

  if (partner) return next(new ErrorHandler("User Already Exist", 409));
  partner = await Partners.create({
    firstName,
    lastname,
    phone,
    email,
    referralId,
    password,
  });
  res.status(200).json({
    success: true,
    message: "Register Successfully",
    partner,
  });
});
export const contact = catchAsyncError(async (req, res, next) => {
  const { name, email, phone, message } = req.body;

  if (!name || !phone)
    return next(new ErrorHandler("Please enter all field", 400));

  let contact = Contact;

  // if (user) return next(new ErrorHandler("User Already Exist", 409));
  contact = await Contact.create({
    name,
    phone,
    email,
    message,
  });

  res.status(200).json({
    success: true,
    message: "Message Send Successfully",
    contact,
  });
});

export const subscribenow = catchAsyncError(async (req, res, next) => {
  const { phone } = req.body;

  if (!phone) return next(new ErrorHandler("Please enter Phone Number", 400));

  let subscribenow = subscribeNow;

  // if (user) return next(new ErrorHandler("User Already Exist", 409));
  subscribenow = await subscribeNow.create({
    phone,
  });

  res.status(200).json({
    success: true,
    message: "Message Send Successfully",
    subscribenow,
  });
});

export const webinar = catchAsyncError(async (req, res, next) => {
  const { name, email, phone, message } = req.body;

  if (!name || !phone)
    return next(new ErrorHandler("Please enter all field", 400));

  let webinar = Webinar;

  // if (user) return next(new ErrorHandler("User Already Exist", 409));
  webinar = await Webinar.create({
    name,
    phone,
    message,
    email,
  });

  res.status(200).json({
    success: true,
    message: "Message send Successfully",
    webinar,
  });
});

export const login = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new ErrorHandler("Please enter all field", 400));

  const user = await User.findOne({ email }).select("+password");

  if (!user) return next(new ErrorHandler("Incorrect Email or Password", 401));

  const isMatch = await user.comparePassword(password);

  if (!isMatch)
    return next(new ErrorHandler("Incorrect Email or Password", 401));

  sendToken(res, user, `Welcome back, ${user.name}`, 200);
});

export const logout = catchAsyncError(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
      secure: true,
      sameSite: "none",
    })
    .json({
      success: true,
      message: "Logged Out Successfully",
    });
});

export const getMyProfile = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  res.status(200).json({
    success: true,
    user,
  });
});

export const changePassword = catchAsyncError(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword)
    return next(new ErrorHandler("Please enter all field", 400));

  const user = await User.findById(req.user._id).select("+password");

  const isMatch = await user.comparePassword(oldPassword);

  if (!isMatch) return next(new ErrorHandler("Incorrect Old Password", 400));

  user.password = newPassword;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Password Changed Successfully",
  });
});

export const updateProfile = catchAsyncError(async (req, res, next) => {
  const { name, email } = req.body;

  const user = await User.findById(req.user._id);

  if (name) user.name = name;
  if (email) user.email = email;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Profile Updated Successfully",
  });
});

export const updateprofilepicture = catchAsyncError(async (req, res, next) => {
  const file = req.file;

  const user = await User.findById(req.user._id);

  const fileUri = getDataUri(file);
  const mycloud = await cloudinary.v2.uploader.upload(fileUri.content);

  await cloudinary.v2.uploader.destroy(user.avatar.public_id);

  user.avatar = {
    public_id: mycloud.public_id,
    url: mycloud.secure_url,
  };

  await user.save();

  res.status(200).json({
    success: true,
    message: "Profile Picture Updated Successfully",
  });
});

export const forgetPassword = catchAsyncError(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) return next(new ErrorHandler("User not found", 400));

  const resetToken = await user.getResetToken();

  await user.save();

  const url = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;

  const message = `Click on the link to reset your password. ${url}. If you have not request then please ignore.`;

  // Send token via email
  await sendEmail(user.email, "CourseBundler Reset Password", message);

  res.status(200).json({
    success: true,
    message: `Reset Token has been sent to ${user.email}`,
  });
});

export const resetPassword = catchAsyncError(async (req, res, next) => {
  const { token } = req.params;

  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: {
      $gt: Date.now(),
    },
  });

  if (!user)
    return next(new ErrorHandler("Token is invalid or has been expired", 401));

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Password Changed Successfully",
  });
});

export const addToPlaylist = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  const course = await Course.findById(req.body.id);

  if (!course) return next(new ErrorHandler("Invalid Course Id", 404));

  const itemExist = user.playlist.find((item) => {
    if (item.course.toString() === course._id.toString()) return true;
  });

  if (itemExist) return next(new ErrorHandler("Item Already Exist", 409));

  user.playlist.push({
    course: course._id,
    poster: course.poster.url,
  });

  await user.save();

  res.status(200).json({
    success: true,
    message: "Added to playlist",
  });
});

export const removeFromPlaylist = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const course = await Course.findById(req.query.id);
  if (!course) return next(new ErrorHandler("Invalid Course Id", 404));

  const newPlaylist = user.playlist.filter((item) => {
    if (item.course.toString() !== course._id.toString()) return item;
  });

  user.playlist = newPlaylist;
  await user.save();
  res.status(200).json({
    success: true,
    message: "Removed From Playlist",
  });
});

// Admin Controllers

export const getAllUsers = catchAsyncError(async (req, res, next) => {
  const users = await User.find({});

  res.status(200).json({
    success: true,
    users,
  });
});
export const getAllWebinar = catchAsyncError(async (req, res, next) => {
  const webinars = await Webinar.find({});

  res.status(200).json({
    success: true,
    webinars,
  });
});
export const getAllContacts = catchAsyncError(async (req, res, next) => {
  const contacts = await Contact.find({});

  res.status(200).json({
    success: true,
    contacts,
  });
});
export const createNotification = catchAsyncError(async (req, res, next) => {
  const { title, description, subheading } = req.body;

  if (!title || !description)
    return next(new ErrorHandler("Please add all fields", 400));

  const file = req.file;

  const fileUri = getDataUri(file);

  const mycloud = await cloudinary.v2.uploader.upload(fileUri.content);

  await Notification.create({
    title,
    description,
    subheading,
    poster: {
      public_id: mycloud.public_id,
      url: mycloud.secure_url,
    },
  });

  res.status(201).json({
    success: true,
    message: "notification created Successfully.",
  });
});

export const getAllNotification = catchAsyncError(async (req, res, next) => {
  const notification = await Notification.find({});

  res.status(200).json({
    success: true,
    notification,
  });
});
export const updateUserRole = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) return next(new ErrorHandler("User not found", 404));

  if (user.role === "user") user.role = "admin";
  else user.role = "user";

  await user.save();

  res.status(200).json({
    success: true,
    message: "Role Updated",
  });
});

export const deleteUser = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) return next(new ErrorHandler("User not found", 404));

  await cloudinary.v2.uploader.destroy(user.avatar.public_id);

  // Cancel Subscription

  await user.remove();

  res.status(200).json({
    success: true,
    message: "User Deleted Successfully",
  });
});

export const deleteMyProfile = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  await cloudinary.v2.uploader.destroy(user.avatar.public_id);

  // Cancel Subscription

  await user.remove();

  res
    .status(200)
    .cookie("token", null, {
      expires: new Date(Date.now()),
    })
    .json({
      success: true,
      message: "User Deleted Successfully",
    });
});

User.watch().on("change", async () => {
  const stats = await Stats.find({}).sort({ createdAt: "desc" }).limit(1);

  const subscription = await User.find({ "subscription.status": "active" });
  stats[0].users = await User.countDocuments();
  stats[0].subscription = subscription.length;
  stats[0].createdAt = new Date(Date.now());

  await stats[0].save();
});
