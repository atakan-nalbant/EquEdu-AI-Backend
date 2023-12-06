import express from "express"

import { getUserFromDB, signinEmailPassword } from "../Model/AzureDBModel"


const router = express.Router()

// MARK : GET - PROJECT INFO : READ
router.post("/login", (req, res) => {
    let email = req.headers.email as string
    let password = req.headers.password as string

    signinEmailPassword(email, password)
        .then(uid => {
            getUserFromDB(uid).then(userInfo => {
                res.json(userInfo)
            }).catch(() => res.sendStatus(400))
        })
        .catch(() => { res.sendStatus(400) })

})


router.get("/me", (req, res) => {
    let uid = req.headers["user-id"] as string
    getUserFromDB(uid).then(userInfo => {
        res.json(userInfo)
    }).catch(() => res.sendStatus(400))
})


export default router;