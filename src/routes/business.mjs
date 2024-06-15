import express from 'express'
import { validationResult, matchedData, checkSchema, param } from 'express-validator'
import businessSchema from '../validators/businessValidator.mjs'
import Business from '../models/business.mjs'
import mongoose from 'mongoose'
import path from 'node:path'
import QRCode from 'qrcode'
import { PassThrough } from 'stream'

import multer from 'multer'

const __dirname=path.resolve()
// Business photos storage setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '/uploads/businesses'))
  },
  filename: function (req, file, cb) {
    const uniqueSuffix =
      Date.now() +
      '-' +
      Math.round(Math.random() * 1e9) +
      '.' +
      file.mimetype.split('/')[1]
    cb(null, file.fieldname + '-' + uniqueSuffix)
  },
})

const upload = multer({ storage: storage })




const checkLogin = (req, res, next) => {
  if (!req.user) return res.send('Please Login!')
  next()
}


const router = express.Router()

router.get('/:name', async (req, res) => {
  const { name } = req.params
  try {
    const checkBusiness = await Business.findOne({ name })
    if (!checkBusiness) return res.send({ data: [] })

    return res.send({ data: checkBusiness })
  } catch (error) {
    return res.send({ error })
  }
})
router.use(checkLogin)

router.get('/', async (req, res) => {
  try {
    const allBusiness = await Business.find()
    if (!allBusiness)
      return res.status(404).send({
        data: [],
      })
    return res.status(200).send({
      data: allBusiness,
    })
  } catch (error) {
    return res.send({ error })
  }
})
router.post("/", upload.single('profilePhoto'), checkSchema(businessSchema), async (req, res) => {
    // Checking whether the validation has errors or not
    const result = validationResult(req)
    if (!result.isEmpty()) {
        return res.send(req.body)
    }

    //const data = matchedData(req)

    // Generate QR Code
    
    // Creating a new business 
    const { body } = req
  const owner = req.user.email
  const profilePhoto = `https://api.fasocard.com/static/businesses/${req.file.filename}`
   body.name= body.name.trim()
    const newBusiness = new Business({...body, owner, profilePhoto})
    try {
        await newBusiness.save()
        return res.status(201).send(newBusiness)
    } catch (error) {
        return res.send(error.message)
    }
})
router.put(
  '/update/:name',

  param('name')
    .notEmpty()
    .withMessage('Please enter the name of your business!'),
  upload.single('profilePhoto'),
  checkSchema(businessSchema),
  async (req, res) => {
    // Checking whether the validation has errors or not
    const result = validationResult(req)
    if (!result.isEmpty()) {
      return res.send(result.array())
    }

    //const data = matchedData(req)

    // Creating a new business
    const { body } = req
    const { name } = req.params
    const owner = req.user.email
    const profilePhoto = `https://api.fasocard.com/static/businesses/${req.file.filename}`

    try {
      //Verify if business exists
      const checkBusiness = await Business.findOne({ name })
      if (!checkBusiness)
        return res.status(404).send({ error: 'No record found!' })
      await Business.findOneAndReplace(
        { name },
        { ...body, owner, profilePhoto }
      )
      res.send({ message: 'Here is your updated record', data: body })
    } catch (error) {
      return res.send({ error })
    }
  }
)

router.patch(
  '/patch/:name',

  param('name')
    .notEmpty()
    .withMessage('Please enter the name of your business!'),
  upload.none(), (req, res, next) => {
    console.log(req.body)
    next()
  },
  checkSchema(businessSchema),
  async (req, res) => {
    // Checking whether the validation has errors or not
    const result = validationResult(req)
    if (!result.isEmpty()) {
      return res.send(result.array())
    }

    //const data = matchedData(req)

    // Creating a new business
    const { body } = req
    const { name } = req.params
    //const owner = req.user.email

    try {
      //Verify if business exists
      const checkBusiness = await Business.findOne({ name })
      if (!checkBusiness)
        return res.status(404).send({ error: 'No record found!' })
      await Business.findOneAndReplace({ name }, {...checkBusiness,...body })
      res.send({ message: 'Here is your updated record', data: body })
    } catch (error) {
      return res.send({ error:error.message })
    }
  }
)
router.use(express.json())

router.get("/list/:owner", param('owner').isEmail().withMessage('The owner should be an email'), async(req,res) => {
    const result = validationResult(req)
    if (!result.isEmpty()) return res.send(result.array())
    
    const owner = matchedData(req).owner


    // cHECK İF logged in user is the owner
    if(owner !== req.user.email) res.status(403).send({error: "This is not your account!"})

    try {
        const allBusiness = await Business.find({ owner })
        if (!allBusiness) return res.send([])
        
        return res.send(allBusiness)
        
    } catch (error) {
        return res.send(error.message)
    }

    
})
router.get(
  '/getLink/:name',
  param('name').notEmpty().withMessage('Please enter the business name!'),
    (req, res) => {
        const result = validationResult(req)
          if (!result.isEmpty()) return res.send(result.array())
        const data = matchedData(req)
        const businessUrl = 'http//fasocard.com/business/' + data.name

        return res.send({link: businessUrl})
        
         
  }
)

router.get("/getQRcode/:name", param('name').notEmpty().withMessage("Please enter the business name!"), async(req, res) => {

    // Validate the url param
    const result = validationResult(req)
    if (!result.isEmpty()) return res.send(result.array())
    const data = matchedData(req)
    
    // Check if business exist
    try {
      const checkBusiness = await Business.findOne({ name: data.name })
      if (!checkBusiness)
          return res.status(404).send({ error: 'This business does not exist!' })
        
        // Check if user is the owner of business
        if(checkBusiness.owner !== req.user.email) return res.status(403).send({ error: 'This business is not yours!' })

      // Generate QR code and send it to user
        const businessUrl = encodeURI('http//fasocard.com/business/' + data.name)
        const qrStream = new PassThrough()
        const result = await QRCode.toFileStream(qrStream, businessUrl, {
          type: 'png',
          width: 200,
          errorCorrectionLevel: 'H',
        })
        qrStream.pipe(res)
    } catch (error) {
        return res.status(500).send({error})
    }
})






router.delete("/delete/:id", async (req, res) => {
    const { id } = req.params
    
    try {
      //Verify if business exists
      const checkBusiness = await Business.findById(id)
      if (!checkBusiness)
        return res.status(404).send({ error: 'No record found!' })
      await Business.findByIdAndDelete(id)
      return res.send({
        successMessage: `Record with ID:${id} deleted successfully`,
      })
    } catch (error) {
        return res.send({error})
    }
    
})





export default router