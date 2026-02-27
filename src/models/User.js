import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },

    isVerified: { type: Boolean, default: false },
    verificationToken: String,

    resetPasswordToken: String,
    resetPasswordExpires: Date,

    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    role: { type: String, default: "user" }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
