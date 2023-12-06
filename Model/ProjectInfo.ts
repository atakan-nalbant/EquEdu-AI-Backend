import fs from 'fs'
import { createSecret } from '../Utils/Secret'
import { findOriginalFile } from '../Utils/FindFile'

export function mapBodyToProjectInfo(userId: String, body: any): ProjectInfo | null {
    let projectId = "projectId" in body ? body.projectId : "new"
    if ("projectName" in body && "descriptions" in body) {
        let pInfo: ProjectInfo = {
            projectId: body.projectId,
            projectName: body.projectName,
            authorizedUIDs: [userId],
            language: body.language ? body.language : "tr",
            descriptions: body.descriptions,
            processStatus: getProjectStatus(body as ProjectInfo, true),
        }
        return pInfo
    } else {
        return null
    }
}


export function getProjectStatus(pProj: ProjectInfo, shouldGenerateSecret: Boolean = false): ProcessStatus {
    let path = "./data/" + pProj.projectId + "/"
    let outputFilePath = path + pProj.projectId + "_processed.mp4"

    console.log("pProj", pProj)
    let inputFileName = findOriginalFile(pProj.projectId)
    let inputFileExists = (inputFileName !== "") // True if not empty
    let processedFileExists = fs.existsSync(outputFilePath)
    //TODO also check the duration

    let pSecret = pProj.processStatus?.secret

    let obj: ProcessStatus = {
        inputFileExists: inputFileExists,
        processedFileExists: processedFileExists,
        secret: shouldGenerateSecret ? createSecret() : pSecret
    }

    if (processedFileExists) {
        obj.downloadLink = "/download/" + pProj.projectId + "/" + obj.secret
    }

    return obj;
}

export function getDownloadableFile(projectId: String) {
    let path = "./data/" + projectId + "/"
    let outputFilePath = path + projectId + "_processed.mp4"
    let processedFileExists = fs.existsSync(outputFilePath)
    return processedFileExists ? outputFilePath : null
}


export type ProjectSummary = {
    projectId: String;
    projectName: String;
    language?: "en" | "tr";
}


export type ProjectInfo = {
    projectId: String;
    projectName: String;
    language?: "en" | "tr";
    authorizedUIDs: String[];
    duration?: number;
    descriptions: Description[];
    processStatus?: ProcessStatus
}


export type Description = {
    description: String;
    startTime: number;
    dubType: "override" | "stopMotion";
    ttsFile?: String;
}

export type ProcessStatus = {
    inputFileExists: Boolean;
    processedFileExists: Boolean;
    downloadLink?: String;
    secret?: String;
}
