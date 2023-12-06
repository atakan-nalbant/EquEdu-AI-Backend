import { UserInfo } from './UserInfo';
import { ProjectInfo, ProjectSummary } from './ProjectInfo';



export function signinEmailPassword(email: string, password: string): Promise<UID> {
}

type UID = string

const userCollection = collection(azureDb, "user")

export function getUserFromDB(userId: string, fetchConsumption: Boolean = false): Promise<UserInfo> {

    return new Promise((resolve, reject) => {
    })

}


export function updateUserInDB(user: UserInfo) {
  
}

export function addProjectSummaryToUserInDB(userId: string, project: ProjectSummary): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        
    })
}

export function updateProjectSummaryToUserInDB(userId: string, project: ProjectSummary): Promise<void> {
    return new Promise<void>((resolve, reject) => {
    })
}

// ----------



export function getProjectFromDB(projectId: string): Promise<ProjectInfo> {
    return new Promise((resolve, reject) => {

    })
}



export function updateProjectInDB(userId: string, project: ProjectInfo): Promise<Boolean> {
    let docRef = doc(projectCollection, project.projectId as string)
    return new Promise((res, rej) => {
        
    })
}


export function createProjectInDB(userId: string, project: ProjectInfo): Promise<ProjectInfo> {
    // Undefined cannot be sent to firestore.
    let { projectId, ...remainingProjProps } = project;
    return new Promise<ProjectInfo>((resolve, reject) => {

    })
}
