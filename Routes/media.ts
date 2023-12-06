import express from "express"

import authUser from "../Middleware/AuthUser"
import upload from "../Middleware/Upload"
import { ProjectInfo, getDownloadableFile } from "../Model/ProjectInfo"
import { getProjectFromDB } from "../Model/AzureDBModel"


const router = express.Router()


// MARK : UPLOAD
router.post("/upload/:projectId", authUser, upload.single('file'), (req, res) => {
    // Comes here after file creation success. Else auth midlleware returns 401: Unauthorized
    //TODO - Test fail in file create situation.
    res.sendStatus(200)
})


// MARK : DOWNLOAD
router.get("/download/:projectId/:secret", (req, res) => {
    let projectId = req.params.projectId
    let secret = req.params.secret
    
    getProjectFromDB(projectId).then(project => {
        let requiredSecret = (project as ProjectInfo).processStatus?.secret
        if (requiredSecret !== undefined && secret === (requiredSecret as string)) {
            let downloadableFile = getDownloadableFile(projectId)
            if (downloadableFile !== null) {
                res.download(downloadableFile)
            } else {
                res.sendStatus(204) // 204 No Content
            }
        } else {
            res.sendStatus(401) // 401 Unauthorized
        }
    }).catch(()=>res.sendStatus(400))

    
})


export default router;
