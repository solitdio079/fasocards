import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import session from 'express-session'
import MongoStore from 'connect-mongo'
import passport from 'passport'
import authRouter from './src/routes/auth.mjs'
import businessRouter from './src/routes/business.mjs'


//Connect to database
try {
  await mongoose.connect(process.env.MONGO_URI)
  console.log('Connected to database')
  
} catch (error) {
  console.log(error);
}
// Instantiating the express app
const app = express()

const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200,
}

app.use(cors(corsOptions))
app.use(cookieParser("secret"))
app.use(express.json())
app.use(
  session({
    secret: 'ready',
    resave: false,
    saveUninitialized: false,
    cooki: {
      secure:true
    },
    store: MongoStore.create({
      client: mongoose.connection.getClient(),
      dbName: 'fasocards',
    }),
  })
)
app.use(passport.initialize())
app.use(passport.session())

app.use("/auth", authRouter)
app.use("/business", businessRouter)

const port = process.env.PORT || 3000


app.get("/", (req, res) => {
    res.send({homeMsg: "This is the homepage" }) 
})


app.listen(port, () => {
    console.log(`Listening to port ${port}`);
})