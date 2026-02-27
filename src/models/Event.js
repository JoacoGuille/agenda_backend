import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    location: { type: String, default: "" },
    status: {
      type: String,
      enum: ["planned", "cancelled", "done"],
      default: "planned"
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

export default mongoose.model("Event", eventSchema);
