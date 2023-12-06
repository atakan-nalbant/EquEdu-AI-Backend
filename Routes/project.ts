import express from "express"

import prepareProject from "../Jobs/mainJob"
import { ProjectInfo, getProjectStatus, getDownloadableFile, mapBodyToProjectInfo, ProjectSummary } from "../Model/ProjectInfo"
import authUser from "../Middleware/AuthUser"

import { addProjectSummaryToUserInDB, createProjectInDB, getProjectFromDB, updateProjectInDB } from "../Model/AzureDBModel"

const router = express.Router()


// MARK : GET - PROJECT INFO : READ
router.get("/project/:projectId", authUser, (req, res) => {
    let pInfo = res.locals.projectInfo as ProjectInfo
    pInfo.processStatus = getProjectStatus(pInfo, false)
    res.json(pInfo)
})


// Don't ask for auth, because user creates new project, so no project will match up.
router.post("/project", (req, res) => {
    let userId = req.headers["user-id"]
    if (userId === undefined) { res.sendStatus(400) }
    let uid = userId as String

    let pInfo = mapBodyToProjectInfo(uid, req.body)
    if (pInfo === null) {
        res.statusCode = 400
        res.json({ "error": "One of the body param does not exist: projectName, descriptions" })
    } else {
        createProjectInDB(userId as string, pInfo).then(project => {
            res.json(project)
        }).catch(() => res.sendStatus(400) )
    }
})


// MARK : PUT - PROJECT INFO : UPDATE
router.put("/project/:projectId", authUser, (req, res) => {
    let userId = res.locals.userId
    // Web app will put the last information so don't use the version in the db.
    let pInfo = mapBodyToProjectInfo(userId, req.body)
    if (pInfo === null) {
        res.statusCode = 400
        res.json({ "error": "One of the body param does not exist: projectId, projectName, descriptions" })
    } else {
        updateProjectInDB(userId as string, pInfo).then(status => {
            status ? res.json(pInfo) : res.sendStatus(400)
        }).catch(() => res.sendStatus(400))
    }
})

// ----

// MARK : PROCESS
router.post('/process/:projectId', authUser, (req, res) => {
    let userId = res.locals.userId
    // Web app can send latest information with Process request so don't use the version in the db.
    let pInfo = mapBodyToProjectInfo(userId, req.body)
    if (pInfo === null) {
        res.statusCode = 400
        res.json({ "error": "One of the body param does not exist: projectId, projectName, descriptions" })
    } else {
        updateProjectInDB(userId, pInfo).then(status => {
            if (status) { res.json({ message: "Started to process" }) }
            else { res.sendStatus(400) }
        })
        prepareProject(userId, pInfo)
    }
});



export default router