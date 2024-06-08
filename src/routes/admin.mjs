import { Router } from "express"
import Users from "../models/users.mjs"
import Business from '../models/business.mjs'


const router = Router()


const checkStatus = (req, res, next) => {
    if (req.user && req.user.isAdmin) next()
    throw new Error("Vous n'etes pas admin!")
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

export default router