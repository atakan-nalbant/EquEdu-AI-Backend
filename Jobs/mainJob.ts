import { ProjectInfo } from "../Model/ProjectInfo"
import { UserInfo, addConsumption } from "../Model/UserInfo"
import { checkOrCreateFolder } from "../Utils/FindFile"
import createTTSfiles from "./ttsJob"
import processVideo from "./videoProcessJob"


export default async function prepareProject(userId: string, projectInfo: ProjectInfo) {

    checkOrCreateFolder(projectInfo.projectId as string)

    // Jobs 1: Create TTS Files
    let projectInfoWithTts = createTTSfiles(projectInfo)
        .then(pInfoWithTTS => {
            console.log(pInfoWithTTS)
            // Job 2: Process Video
            processVideo(pInfoWithTTS).then(() => {
                addConsumption(userId = userId, projectInfo)
            }).catch((e) => console.log(e, "video process job process problem"))
        })

    // Job 3: Return process started info with a request later info.
}