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

    unique: false,
    validate: validator.isEmail,
  },

  message: {
    type: String,
    require: false,
    default: "",
  },
});

export const Contact = mongoose.model("Contact", schema);
