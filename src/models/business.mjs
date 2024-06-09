import mongoose, { Schema } from 'mongoose'



const businessSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    profilePhoto: {
      type: String,
      required:true
    },
    owner: {
      required: true,
      type: String,
    },
    description: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    country: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    website: {
      type: String,
    },
    facebookLink: {
      type: String,
    },
    twitterLink: {
      type: String,
    },
    tiktokLink: {
      type: String,
    },
    instagramLink: {
      type: String,
    },
    linkedinLink: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.model('Business', businessSchema)