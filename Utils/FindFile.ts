import { exec, execSync } from 'child_process'
import fs from "fs"

export function findOriginalFile(projectId: String): string {
    let command = "find data/" + projectId + " -type f -name \"" + projectId + "_original.*\""
    try{
        let execution = execSync(command)
        let stdout = execution.toString()
        let startIndex = stdout.lastIndexOf(projectId + "_original")
        let endIndex = stdout.lastIndexOf("\n")
        let filename = stdout.substring(startIndex, endIndex)
        return filename
    } catch(e){
        return ""
    }
    
}


export function checkOrCreateFolder(projectId: string) : string {
    let path = "./data/" + projectId   
    if(!fs.existsSync(path)){
        fs.mkdirSync(path, {recursive: true})
        return path
    } else {
        return path
    }
}