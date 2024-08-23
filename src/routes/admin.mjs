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

router.put('/users/put/:id', async(req, res) => {
    const { id } = req.params
    const { isAdmin, isAllowed } = req.body
    
    try {
        const checkUser = await Users.findById(id)
        if (!checkUser) return res.status(404).send({ msg: "No User found" })
        console.log(isAdmin ,isAllowed)
        console.log(JSON.stringify(req))
        const email = checkUser.email
        const admin = isAdmin !== undefined ? isAdmin : false
        const allowed = isAllowed !== undefined ? isAllowed: false
        const newUser =  await Users.findByIdAndUpdate(id, {email,admin, isAllowed:allowed})
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