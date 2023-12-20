import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import JWT from 'jsonwebtoken'


const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        require: [true, 'Please Enter full name']
    },
    email: {
        type: String,
        require: [true, 'Please Enter Email']
    },
    password: {
        type: String,
        require: [true, 'Please enter Password']
    },
    confirmPass: {
        type: String,
        require: [true, 'The Password Must match']
    },
    isVerify : {
        type : Boolean,
        default : false
    }
})

userSchema.pre('save', async function (next) {
    if(!this.isModified('password')) return next() //prevent double encryption of password when the user profile updated
    this.password = await bcrypt.hash(this.password, 10)
})

userSchema.methods.comparePass = async function (plainPass) {
    return await bcrypt.compare(plainPass, this.password)
}

userSchema.methods.tokenGenerate = async function () {
    return JWT.sign({ _id: this._id }, process.env.JWT_KEY, { expiresIn: '7d' })
}

export const userModel = mongoose.model("users", userSchema)