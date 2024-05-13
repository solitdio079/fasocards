import { Router } from "express"
import passport from "passport"
import MagicLinkStrategy from "passport-magic-link"
import User from "../models/users.mjs"
import sendgrid from '@sendgrid/mail'

sendgrid.setApiKey(process.env['SENDGRID_API_KEY'])
const router = Router()
const magicLogin = new MagicLinkStrategy({
    secret: 'keyboard cat',
    userFields: ['email'],
    tokenField: 'token',
    verifyUserAfterToken: true,
}, function send(user, token) {
    const link = 'http://localhost:3000/login/email/verify?token=' + token
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
}, function verify(user) {
    return new Promise({
        async function(resolve, reject) {
            try {
                const user = await User.findOne({ email: user.email })
                if (!user) {
                    const newUser = new User(user)
                    await newUser.save()
                    return resolve(newUser)
                }
                return resolve(user)
            } catch (error) {
                return reject(error)
            }

        }
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
    res.redirect('/login/email/check')
  }
)
router.get('/login/email/check', function (req, res, next) {
  res.send("Successfully sent!")
})

export default router