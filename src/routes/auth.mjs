import { Router } from "express"
import 'dotenv/config.js'
import passport from "passport"
import {Strategy} from "passport-magic-link"
import User from "../models/users.mjs"
import sendgrid from '@sendgrid/mail'

console.log(process.env.SENDGRID_API_KEY)
sendgrid.setApiKey(process.env.SENDGRID_API_KEY)
const router = Router()
const magicLogin = new Strategy({
    secret: 'keyboard cat',
    userFields: ['email'],
    tokenField: 'token',
    verifyUserAfterToken: true,
}, function send(user, token) {
    const link = 'http://localhost:3000/auth/login/email/verify?token=' + token
    const msg = {
      to: user.email,
      from: process.env['EMAIL'],
      subject: 'Sign in to App',
      text:
        'Hello! Click the link below to finish signing in to Todos.\r\n\r\n' +
        link,
      html:
        '<h3>Hello!</h3><p>Click the link below to finish signing in to Todos.</p><p><a href="' +
        link +
        '">Sign in</a></p>',
    }
    return sendgrid.send(msg)
}, async function verify(user) {
    console.log(user);
    try {
         const userVerify = await User.findOne({ email: user.email })
         if (!userVerify) {
           const newUser = new User({email:user.email, fullName: user.fullName})
           await newUser.save()
           return  new Promise((resolve, reject) => {resolve(newUser)})
         }
         return new Promise((resolve, reject) => {
           resolve(userVerify)
         })
    } catch (error) {
        return new Promise((resolve, reject) => {reject(error)})
    }

   
    
     
    

})
passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
    cb(null, { id: user.id, email: user.email })
  })
})

passport.deserializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, user)
  })
})

passport.use(magicLogin)

router.post(
  '/login/email',
  passport.authenticate('magiclink', {
    action: 'requestToken',
    failureRedirect: '/',
  }),
  function (req, res, next) {
    res.redirect('/auth/login/email/check')
  }
)
router.get('/login/email/check', function (req, res, next) {
  res.send("Successfully sent!")
})
router.get(
  '/login/email/verify',
  passport.authenticate('magiclink', {
    successReturnToOrRedirect: '/',
    failureRedirect: '/auth/login/email',
  })
)
router.post('/logout', function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err)
    }
    res.redirect('/')
  })
})
export default router