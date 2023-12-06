import { getUserFromDB, updateUserInDB } from "./AzureDBModel";
import { ProjectInfo, ProjectSummary } from "./ProjectInfo";
import { exec, execSync } from 'child_process'

export type UserInfo = {
    userId: String;
    email: String;
    projects: ProjectSummary[];
    remainingMinutes: number;
    consumptionHistory: Consumption[]
}

export type Consumption = {
    timestamp: String;
    projectId: String;
    duration: number;
    remainingBeforeProcess: number;
    remainingAfterProcess: number;
}

export function addConsumption(userId: string, project: ProjectInfo) {
    getUserFromDB(userId, true).then(user => {
        let u = user
        let projectId = project.projectId
        let duration = calculateDuration(projectId)
        let remainingAfterProcess = user.remainingMinutes - duration

        let consumption: Consumption = {
            timestamp: (new Date()).toISOString(),
            projectId: projectId,
            duration: duration,
            remainingBeforeProcess: user.remainingMinutes,
            remainingAfterProcess: remainingAfterProcess
        }

        if(u.consumptionHistory === undefined){
            u.consumptionHistory = [consumption]
        } else{
            u.consumptionHistory.push(consumption)
        }

        u.remainingMinutes = remainingAfterProcess

        updateUserInDB(user = u)
    })

}


export function calculateDuration(projectId: String): number {
    let command = "ffprobe -i data/"+projectId+"/"+projectId+"_processed.mp4 -show_entries format=duration -v quiet -of csv=\"p=0\""
    try{
        let val = execSync(command).toString()
        let duration = Math.round(Number(val)/60)
        return duration
    } catch(e){
        return 1
    }
}
