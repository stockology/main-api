import mongoose from "mongoose";
import validator from "validator";

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your name"],
  },
  phone: {
    type: Number,
    // required: ["Please enter your phone number"],
    required: true,
  },
  email: {
    type: String,
    required: [true, "Please enter your email"],
    unique: false,
    validate: validator.isEmail,
  },
});

export const Webinar = mongoose.model("Webinar", schema);
