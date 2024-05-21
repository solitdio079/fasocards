import { Router } from "express"
import 'dotenv/config.js'
import passport from "passport"
import '../loginStrategies/email-link.mjs'

const router = Router()
router.post(
  '/login/email',
  passport.authenticate('magiclink', {
    action: 'requestToken',
    failureRedirect: '/',
  }),
  function (req, res, next) {
    res.send({msg: "email sent"})
  }
)
router.get('/login/email/check', function (req, res, next) {
  res.send("Successfully sent!")
})
router.get(
  '/login/email/verify',
  passport.authenticate('magiclink', {
    action: 'acceptToken',
  }),
  (req, res) => {
    req.login(req.user, function (err) {
      if (err) {
        return next(err)
      }
      res.redirect('https://fasocard.com/')
    })
  }
)
router.post('/logout', function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err)
    }
    res.redirect('/')
  })
})
router.get('/status', (req, res) => {
  if (req.user) return res.send(req.user)
  return res.send({status: 404})
})
export default router