import passport from 'passport'
import magicLink    from 'passport-magic-link'
import sendgrid from '@sendgrid/mail'
import User from '../models/users.mjs'
sendgrid.setApiKey(process.env.SENDGRID_API_KEY)

const magicLinkStrategy = magicLink.Strategy

const magicLogin = new magicLinkStrategy(
  {
    secret: 'keyboard cat',
    userFields: ['email'],
    tokenField: 'token',
    verifyUserAfterToken: true,
  },
  function send(user, token) {
    const link = 'http://localhost:3000/auth/login/email/verify?token=' + token
    const msg = {
      to: user.email,
      from: process.env['EMAIL'],
      subject: 'Sign in to App',
      text:
        'Hello! Click the link below to finish signing in to Todos.\r\n\r\n' +
        link,
      html:
        '<h3>Hello!</h3><p>Click the link below to finish signing in to Todos."'+link+'"</p><p><a href="' +
        link +
        '">Sign in</a></p>',
    }
    return sendgrid.send(msg)
  },
  async function verify(user) {
    try {
      const userVerify = await User.findOne({ email: user.email })
      if (!userVerify) {
        const newUser = new User({ email: user.email, fullName: user.fullName })
        await newUser.save()
        return new Promise((resolve, reject) => {
          resolve(newUser)
        })
      }
      return new Promise((resolve, reject) => {
        resolve(userVerify)
      })
    } catch (error) {
      return new Promise((resolve, reject) => {
        reject(error)
      })
    }
  }
)
passport.serializeUser(function (user, cb) {
  console.log('Inside Serializer')
  process.nextTick(function () {
    cb(null, { id: user.id, email: user.email })
  })
})

passport.deserializeUser(function (user, cb) {
  console.log('Inside Deserializer')
  
  process.nextTick(function () {
    return cb(null, user)
  })
})

passport.use(magicLogin)
