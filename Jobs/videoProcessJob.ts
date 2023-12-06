import { exec } from "child_process";
import { ProjectInfo } from "../Model/ProjectInfo";
import { Consumption, addConsumption } from "../Model/UserInfo";
import { findOriginalFile } from "../Utils/FindFile";

export default function processVideo(projectInfo: ProjectInfo): Promise<void> {

    let command = defineVideoProcessJob(projectInfo)

    console.log("FFMPEG COMMAND", command)

    return new Promise((res, rej) => {

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                rej()
                return;
            }
            // Closing STDERR, because, ffmpeg's version number print classified as stderr
            // stderr: ffmpeg version 6.0 Copyright (c) 2000-2023 the FFmpeg developers
            // if (stderr) {
            //     console.log(`stderr: ${stderr}`);
            //     rej()
            //     return;
            // }
            res()
        });
    })
}

function defineVideoProcessJob(projectInfo: ProjectInfo) {

    let pathPrefix = "data/" + projectInfo.projectId + "/"
    let inputFileName = findOriginalFile(projectInfo.projectId)
    let outputFileName = pathPrefix + projectInfo.projectId + "_inprogress.mp4"
    let fileNameToServe = pathPrefix + projectInfo.projectId + "_processed.mp4"

    let renameFileCommand = " && mv " + outputFileName + " " + fileNameToServe

    let descriptions = projectInfo.descriptions
    let ptsCommand = ",setpts=PTS-STARTPTS"
    let aptsCommand = ",asetpts=PTS-STARTPTS"

    // INDEXES for Overridables
    let overridables = descriptions.filter(d => d.dubType === "override")
    let overridableCount = overridables.length
    let p_audioStreamIndexes = [...Array(overridableCount).keys()].map(x => "[a" + (x + 1) + "]").join("")

    // INDEXES for Stop Motion
    let stopMotions = descriptions.filter(d => d.dubType === "stopMotion")
    let stopMotionCount = stopMotions.length //stop motion counts
    let aovCount = stopMotionCount + 1
    let p_aovStreamIndexes = [...Array(aovCount).keys()].map(x => "[aov" + x + "]").join("")

    var command = "ffmpeg -i " + pathPrefix + inputFileName
    command += overridables.map(d => " -i " + pathPrefix + d.ttsFile).join("")
    command += stopMotions.map(d => " -i " + pathPrefix + d.ttsFile).join("")

    command += " -filter_complex \""

    // OVERRIDE OPERATIONS
    command += overridables.map((d, index) => "[" + (Number(index) + 1) + ":a] adelay=" + d.startTime * 1000 + "|" + d.startTime * 1000 + ",volume=3 [a" + (Number(index) + 1) + "]; ").join("")
    command += "[0:a]" + p_audioStreamIndexes + " amix=inputs=" + (overridableCount + 1) + ":duration=longest:dropout_transition=0:normalize=0 [aov]; "
    command += "[aov]asplit=" + aovCount + p_aovStreamIndexes + "; "

    // STOP-MOTION OPERATIONS
    var lastStoppedMoment = 0
    let nThItem = overridableCount + 1
    let aovIndex = 0
    var streamIndexes = ""

    stopMotions.forEach(d => {
        let startTime = d.startTime
        // Main audio and video
        // [0:v]trim=10:15,setpts=PTS-STARTPTS[v0]; [0:a]atrim=10:15,setpts=PTS-STARTPTS[a0]; \
        var indexForBase = (nThItem - 1) * 2
        var indexForDescription = nThItem * 2 - 1

        // Clipping base video
        var streamIndex = "[v" + indexForBase + "]"
        streamIndexes += streamIndex
        command += "[0:v]trim=" + lastStoppedMoment + ":" + startTime + ptsCommand + streamIndex + ";"

        streamIndex = "[a" + indexForBase + "]"
        streamIndexes += streamIndex
        command += "[aov" + aovIndex + "]atrim=" + lastStoppedMoment + ":" + startTime + aptsCommand + streamIndex + "; "

        // Looping the frame
        streamIndex = "[v" + indexForDescription + "]"
        streamIndexes += streamIndex
        command += "[0:v]trim=" + startTime + ":" + startTime + ptsCommand + streamIndex + ";"

        // Copying the sound.
        streamIndex = "[a" + indexForDescription + "]"
        streamIndexes += streamIndex
        command += "[" + (nThItem) + ":a]acopy" + streamIndex + "; "

        //Readiness for next iteration
        lastStoppedMoment = startTime
        nThItem += 1
        aovIndex += 1
    });

    // [0:v]trim=20:25,setpts=PTS-STARTPTS[v2]; [0:a]atrim=20:25,setpts=PTS-STARTPTS[a2];
    // [0:v]trim=20:,setpts=PTS-STARTPTS[v2]; [0:a]atrim=20:,setpts=PTS-STARTPTS[a2]; // Unstated index means the end of the video

    var indexForLastRemainingPortion = (nThItem - 1) * 2

    var streamIndex = "[v" + indexForLastRemainingPortion + "]"
    streamIndexes += streamIndex
    command += "[0:v]trim=" + lastStoppedMoment + ":" + ptsCommand + streamIndex + "; "

    streamIndex = "[a" + indexForLastRemainingPortion + "]"
    streamIndexes += streamIndex
    command += "[aov" + aovIndex + "]atrim=" + lastStoppedMoment + ":" + aptsCommand + streamIndex + "; "

    command += streamIndexes + "concat=n=" + (nThItem * 2 - 2 - (overridableCount * 2) + 1) + ":v=1:a=1[outv][outa]"
    command += "\" -map \"[outv]\" -map \"[outa]\" -y " + outputFileName

    command += renameFileCommand

    return command
}