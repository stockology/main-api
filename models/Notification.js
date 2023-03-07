import mongoose from "mongoose";

const schema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please enter your name"],
  },
  subheading: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },

  poster: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: false,
      default: "",
    },
  },

  postAt: {
    type: Date,
    default: Date.now,
  },
});

export const Notification = mongoose.model("Notification", schema);
