import mongoose, { Schema } from "mongoose"

const userSchema = new Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
    },
    admin: {
      type: Boolean,
      default: false,
    },
    isAllowed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)


export default mongoose.model('User', userSchema)
