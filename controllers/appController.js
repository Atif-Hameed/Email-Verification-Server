import nodemailer from 'nodemailer'
import { userModel } from '../models/userModel.js'
import jwt from 'jsonwebtoken'

//Email verification
const sendVerificationEmail = async (email) => {
    try {
        //generate token
        const user = await userModel.findOne({ email })
        const token = await user.tokenGenerate()

        const transporter = nodemailer.createTransport({
            // Your SMTP or other email service configurations here
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER, // Your Gmail email address
                pass: process.env.EMAIL_PASS, // Your Gmail password or an app password
            },
        });

        await transporter.sendMail({
            from: 'atifhameed2002@gmail.com', // Replace with your email address
            to: email,
            subject: 'Email Verification',
            html: `<p>Please click the following link to verify your email: <a href="http://localhost:3000/verifyMail?token=${token}">Verify Email</a></p>`,
        });

        console.log('Verification email sent successfully');
    } catch (error) {
        console.error('Error sending verification email:', error);
        throw error; // Re-throw the error to handle it in the signUpController
    }
};

//signUp 
export const signUpController = async (req, resp) => {
    try {
        const { fullName, email, password, confirmPass } = req.body

        if (!fullName || !email || !password || !confirmPass) {
            return resp.status(401).send({
                success: false,
                message: 'Please provide all the cridentals'
            })
        }
        if (password !== confirmPass) {
            return resp.status(401).send({
                success: false,
                message: 'Confrim Pass not matched'
            })
        }
        const emailExist = await userModel.findOne({ email })
        if (emailExist) {
            return resp.status(409).send({
                success: false,
                message: 'Email Already Exist'
            })
        }
        const user = await userModel.create({
            fullName, email, password
        })

        await sendVerificationEmail(email)

        resp.status(200).send({
            success: true,
            message: 'SignUp successfully, Verification mail sent to your mail adress, please Verify!',
            user
        })

    } catch (error) {
        resp.status(500).send({
            success: false,
            message: 'signUp API Error',
            error
        });
    }

}


//logIn
export const logInController = async (req, resp) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return resp.status(401).send({
                success: false,
                message: 'Please provide all the cridentals'
            })
        }

        const user = await userModel.findOne({ email })
        if (!user) {
            return resp.status(404).send({
                success: false,
                message: 'User not found'
            })
        }
        // const validPass = await user.comparePass(password)
        const validPass = await user.comparePass(password.trim());

        if (!validPass) {
            return resp.status(401).send({
                success: false,
                message: 'Invalid Cridentals'
            })
        }

        const { isVerify } = user
        if (!isVerify) {
            return resp.status(300).send({
                success: 'false',
                message: 'Please Verify your Email'
            })
        }

        const token = await user.tokenGenerate()

        resp.status(200).cookie('token', token, {
            expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
            httpOnly: true,
            secure: true
        }).send({
            success: true,
            message: 'Login Successfully',
            token,
            user
        })

    } catch (error) {
        resp.status(500).send({
            success: false,
            message: 'Login API Error',
            error
        })
    }
}


//logOut
export const logOutController = async (req, resp) => {
    try {
        resp.status(200).cookie('token', '', {
            expires: new Date(Date.now())
        }).send({
            success: true,
            message: 'Logout Successfully'
        })
    } catch (error) {
        resp.status(500).send({
            success: false,
            message: 'Logout API Error',
            error
        })
    }
}


//email Verification
export const emailVerifyController = async (req, resp) => {
    const { token } = req.query;
    if (!token) {
        return resp.status(400).send({
            success: false,
            message: 'Invalid verification token'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        const userId = decoded._id;

        const user = await userModel.findById(userId);
        if (!user) {
            return resp.status(404).send({
                success: false,
                message: 'User not found'
            });
        }

        // Update the user record
        user.isVerify = true;

        await user.save();
        return resp.send({
            success: true,
            message: 'Email verified successfully!'
        });

    } catch (error) {
        return resp.status(500).send({
            success: false,
            message: 'Verification failed',
            error
        });
    }
}


//get Single User
export const getUserController = async (req, resp) => {
    try {
        const user = await userModel.findById(req.params.id)
        if (!user) {
            return resp.status(404).send({
                success: false,
                message: 'User Not Found'
            })
        }
        resp.status(200).send({
            success: true,
            message: 'User Data fetched successfully',
            user
        })
    } catch (error) {
        if (error.name === 'CastError') {
            return resp.status(500).send({
                success: false,
                message: 'Invalid Id'
            })
        }
        resp.status(500).send({
            success: false,
            message: 'getUser API Error',
            error
        })
    }
}


//get ALL user
export const getAllUserController = async (req, resp) => {
    try {
        const users = await userModel.find()
        if (!users) {
            return resp.status(404).send({
                success: false,
                message: 'No User Found'
            })
        }
        resp.status(200).send({
            success: true,
            totalUsers: users.length,
            message: 'All user are fetched successfully',
            users
        })
    } catch (error) {
        resp.status(500).send({
            success: false,
            message: 'getAll User API Error',
            error: error.message
        })
    }
}