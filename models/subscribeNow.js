import mongoose from "mongoose";

const schema = new mongoose.Schema({
  phone: {
    type: Number,
    required: ["Please enter your phone number"],
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const subscribeNow = mongoose.model("Sbscribenow", schema);
