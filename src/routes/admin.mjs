import express from "express"
import Users from "../models/users.mjs"
import Business from '../models/business.mjs'


const router = express.Router()
router.use(express.json())


const checkStatus = (req, res, next) => {
    if (!req.user || !req.user.isAdmin)  throw new Error("Vous n'etes pas admin!")
    next()
}

router.use(checkStatus)

router.get("/stats", async (req, res) => {

    const totalUsers = await Users.countDocuments()
    const totalBusiness = await Business.countDocuments()
    const newUsers = totalUsers - 1

    res.send({
        msg: "Stats", data: [
            {
                totalUsers,
                totalBusiness,
                newUsers
        }
    ]})
})

router.get('/users', async (req, res) => {
    try {
        const allUsers = await Users.find({}).sort({ _id: -1 })
        res.send({msg:"All users", data:allUsers})
    } catch (error) {
        res.send({error: error.message})
    }
   

    
})

router.patch('/users/patch/:id', async(req, res) => {
    const { id } = req.params
    const { body } = req
    
    try {
        const checkUser = await Users.findById(id)
        if (!checkUser) return res.status(404).send({ msg: "No User found" })
        console.log(body.isAllowed)
        const email = checkUser.email
        const admin = checkUser.admin
        const isAllowed = !checkUser.isAllowed
        const newUser =  await Users.findByIdAndUpdate(id, {email,admin, isAllowed})
        return res.status(203).send({msg:"User updated", data: newUser})
    } catch (error) {
        return res.send({error:error.message})
    }
})

router.get("/users/filter/:q", async (req, res) => {
    const { q } = req.params
   // console.log(q);
    try {
        const filteredUsers = await Users.find({
          email: { $regex: '.*' + q + '.*' , $options:'i' }
        })
        return res.send({msg:'Matched Users are here!', data: filteredUsers})
    } catch (error) {
        return res.send({error: error.message})
    }
   
})


router.get('/business/list', async (req, res) => {
    try {
        const allBusiness = await Business.find({})
        return res.send({msg: 'All your Businesses', data: allBusiness})
    } catch (error) {
        return res.send({error: error.message})
    }
    
})


router.get('/business/filter/:q', async (req, res) => {
     const {q} = req.params
    try {
        const filteredBusinesses = await Business.find({
          $or: [
            { name: { $regex: '.*' + q + '.*', $options: 'i' } },
            { country: { $regex: '.*' + q + '.*', $options: 'i' } },
          ],
        })
        return res.send({ msg: 'Matched Users are here!', data: filteredBusinesses })
        
    } catch (error) {
        return res.send({ error: error.message })
    }
})
export default router