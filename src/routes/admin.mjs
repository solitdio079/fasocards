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
        console.log(checkUser)
        const email = checkUser.email
        const admin = checkUser.admin
        const newUser =  await Users.findByIdAndUpdate(id, {email,admin, isAllowed:body.isAllowed})
        return res.status(203).send({msg:"User updated", data: newUser})
    } catch (error) {
        return res.send({error:error.message})
    }
})
export default router