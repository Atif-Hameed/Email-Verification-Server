import express from 'express'
import { emailVerifyController, getUserController, logInController, logOutController, signUpController } from '../controllers/appController.js'
import { isAuthentic } from '../middlewares/userAuthentic.js'

const router = express.Router()

//signUp
router.post('/signUp', signUpController)

//Login
router.post('/logIn', logInController)

//logOut
router.get('/logout', isAuthentic, logOutController)

//emailVerify
router.get('/verifyMail', emailVerifyController)

//getUser
router.get('/getUser/:id', getUserController)

export default router;