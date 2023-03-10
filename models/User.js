import mongoose from "mongoose";
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    date_of_birth: {
      type: Date,
    },
    avatar: {
      type: String,
    },
    address: {
      type: String,
    },
    phone: {
      type: String,
    },
    friends: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    social: {
      facebook: { type: String },
      instagram: { type: String },
      youtube: { type: String },
    },
    website: {
      type: String,
    },
    bio: {
      type: String
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);
