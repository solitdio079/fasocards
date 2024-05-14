import express from 'express'
import mongoose from 'mongoose'
import cookieParser from 'cookie-parser'
import session from 'express-session'
import MongoStore from 'connect-mongo'
import passport from 'passport'
import authRouter from './src/routes/auth.mjs'


//Connect to database
mongoose.connect("mongodb://localhost:27017/starter").then(() => {console.log("Connected to database")})


// Instantiating the express app
const app = express()


app.use(cookieParser("secret"))
app.use(express.json())
app.use(
  session({
    secret: 'ready',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      client: mongoose.connection.getClient(),
      dbName: 'starter',
    }),
  })
)
app.use(passport.initialize())
app.use(passport.session())

app.use("/auth", authRouter)

const port = process.env.PORT || 3000


app.get("/", (req, res) => {
    res.send("This is the homepage")
})


app.listen(port, () => {
    console.log(`Listening to port ${port}`);
})