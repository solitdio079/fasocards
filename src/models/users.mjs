import mongoose, { Schema } from "mongoose"

const userSchema = new Schema({
    email: {
        type: String,
        unique: true,
        required: true
    },
    fullName: {
        type: String,
        required: true
        
    },
    admin: {
        type: Boolean,
        default: false
    }
})


export default mongoose.model('User', userSchema)
