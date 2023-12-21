import JWT from 'jsonwebtoken'
import { userModel } from '../models/userModel.js'

export const isAuthentic = async (req, resp, next) => {
    const { token } = req.cookies
    if (!token) {
        return resp.status(404).send({
            success: false,
            message: 'Unauthorized User'
        })
    }
    const decode = JWT.verify(token, process.env.JWT_KEY)
    req.user = await userModel.findById(decode._id)
    // const {isVerify} = user
    // if(!isVerify){
    //     return resp.status(404).send({
    //         success: false,
    //         message: 'Email not verified, please verify your email'
    //     })
    // }
    next()
}