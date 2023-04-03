import mongoose from "mongoose";
import validator from "validator";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";

const schema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "Please enter your firstName"],
  },
  lastname: {
    type: String,
    required: [true, "Please enter your lastname"],
  },
  email: {
    type: String,
    required: [true, "Please enter your email"],
    // validate: validator.isEmail,
  },
  phone: {
    type: Number,
    required: ["Please enter your phone number"],
    required: true,
  },

  referralId: {
    type: String,
    default: "",
    required: false,
  },

  password: {
    type: String,
    required: [true, "Please enter your password"],
    // minLength: [6, "Password must be at least 6 characters"],
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Partners = mongoose.model("Partners", schema);
