import { Request, Response, NextFunction } from "express"
import { ProjectInfo } from "../Model/ProjectInfo"
import { getProjectFromDB } from "../Model/AzureDBModel"

export default function authUser(req: Request, res: Response, next: NextFunction) {
    let projectId = req.params.projectId
    let userId = req.headers["user-id"]

    if (userId !== undefined) {
        let uid = userId as String

        getProjectFromDB(projectId).then(project => {
            let authorized = project.authorizedUIDs.includes(uid)
            res.locals.authorized = authorized
            res.locals.userId = userId
            project.projectId = projectId
            res.locals.projectInfo = project

            if (authorized) {
                return next()
            } else {
                res.sendStatus(401) // 401 Unauthorized
            }

        }).catch(() => res.sendStatus(400))
    } else {
        res.sendStatus(401) // 401 Unauthorized
    }

}
