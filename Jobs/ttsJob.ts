import { exec } from "child_process";
import { Description, ProjectInfo } from "../Model/ProjectInfo";
import Queue from "queue-promise";
import { prepareAzureTTSFile } from "../Model/AzureTTSModel";


// Job Object = Descriptions
export default function createTTSfiles(projectInfo: ProjectInfo): Promise<ProjectInfo> {
    let pathPrefix = "data/" + projectInfo.projectId + "/"
    let descriptionsObj: Description[] = []
    let descriptions = projectInfo.descriptions

    const ttsQueue = new Queue({ concurrent: 1, interval: 100 });

    descriptions.forEach((d, i) => {
        ttsQueue.enqueue(() => prepareAzureTTSFile(d.description as string, pathPrefix + (i + 1) + ".mp3", projectInfo.language as string))
        descriptionsObj.push({ ...d, ttsFile: (i + 1) + ".mp3" })
    });

    return new Promise((res, rej) => {
        ttsQueue.on("end", () => {
            var pInfo: ProjectInfo = { ...projectInfo }
            pInfo.descriptions = descriptionsObj
            res(pInfo)
        });

        ttsQueue.on("reject", error => {
            console.log(error);
            rej()
        });
    })
}
