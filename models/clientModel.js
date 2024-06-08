const mongoose = require("mongoose");
const validator = require("validator");


const clientSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your FullName"],
    maxLength: [30, "Your name cannot exceed 30 characters"],
  },
  mobileNumber: {
    type: Number,
    required: [true, "Please enter your Mobile Number"],
    minlength: [11, "Your Mobile Number must not be longer than 11 digits"],
  },
  companyId: {
    type: String,
    required: [true, "Please enter your Company Id Number"],
  },
  email: {
    type: String,
    required: [true, "Please enter your email"],
    unique: true,
    validate: [validator.isEmail, "Please enter valid email address"],
  },
  password: {
    type: String,
    required: [true, "Please enter your password"],
    minlength: [6, "Your password must be longer than 6 characters"],
    select: false,
  },
  role: {
    type: String,
    default: "employee",
  },
  avatar: {
    public_id: {
      type: String,
    },
    url: {
      type: String,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },

});


export const Client = mongoose.model("ClientModel", clientSchema);
