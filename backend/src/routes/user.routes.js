import express from "express"
import { app } from "../app.js"
import { loginuser, register,logoutuser, getAllUsers, getUserById} from "../controllers/user.controller.js"
import { asyncHandler } from "../utils/asynchandler.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"
const router = express.Router()

router.route("/register").post(register)
router.route("/loginuser").post(loginuser)
router.route("/logoutuser").post(verifyJWT,logoutuser)
router.route("/getAllUsers").get(getAllUsers)
router.route("/getUserById/:id").get(getUserById)

router.route("/checkForVerifyJWT").get(verifyJWT,async (req, res) => {
    return res.status(200).json({
        message: "You have access to this protected route!",
        user: req.user, // The authenticated user data will be available here
    });
})

export default router