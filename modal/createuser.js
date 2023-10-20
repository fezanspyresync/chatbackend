const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    require: true,
  },
  messages: {
    type: [],
    require: true,
  },
  isLive: {
    type: Boolean,
    require: true,
  },
  image: {
    type: String,
    require: true,
  },
});

const UserModal = mongoose.model("users", userSchema);
module.exports = UserModal;
