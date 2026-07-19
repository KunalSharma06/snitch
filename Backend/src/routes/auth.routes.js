import { Router } from 'express';
import { validateLogin, validateRegister } from '../validators/auth.validator.js';
import { getMe, googleCallback, loginUser, registerUser, logoutUser } from '../controllers/auth.controller.js';
import passport from 'passport';
import { authenticateUser } from '../middlewares/auth.middleware.js';

const authRouter = Router();

authRouter.post('/register', validateRegister, registerUser)
authRouter.post('/login', validateLogin, loginUser)
authRouter.post('/logout', logoutUser)
authRouter.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))
authRouter.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: 'http://localhost:5173/login' }), googleCallback);
authRouter.get("/me", authenticateUser, getMe);
export default authRouter;