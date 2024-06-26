import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import session from 'express-session'
import MongoStore from 'connect-mongo'
import passport from 'passport'
import authRouter from './src/routes/auth.mjs'
import businessRouter from './src/routes/business.mjs'
import adminRouter from './src/routes/admin.mjs'
import path from 'node:path'



//Connect to database
try {
  await mongoose.connect(process.env.MONGO_URI)
  console.log('Connected to database')
  
} catch (error) {
  console.log(error);
}
// Instantiating the express app
const __dirname = path.resolve()
const app = express()
app.use('/static', express.static('./uploads'))

const corsOptions = {
    origin: ['https://fasocard.com', 'https://www.fasocard.com','http://localhost:5173'],
    credentials: true,
    optionsSuccessStatus: 200,
  }


app.use(cors(corsOptions))
app.use(cookieParser("secret"))

app.use(
  session({
    secret: 'ready',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true,
      sameSite: 'lax',
      domain:"fasocard.com"
    },
    store: MongoStore.create({
      client: mongoose.connection.getClient(),
      dbName: 'fasocards',
    }),
  })
)
app.set('trust proxy',1)
app.use(passport.initialize())
app.use(passport.session())

app.use("/auth", authRouter)
app.use("/business", businessRouter)
app.use("/admin", adminRouter)

const port = process.env.PORT || 3000


app.get("/", (req, res) => {
    res.send({homeMsg: "This is the homepage" }) 
})


app.listen(port, () => {
    console.log(`Listening to port ${port}`);
})