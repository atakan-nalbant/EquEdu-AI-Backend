import multer from "multer"
import fs from 'fs'
import { checkOrCreateFolder } from "../Utils/FindFile";

// Set up storage for uploaded files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let projectId = req.params.projectId;
        let path = checkOrCreateFolder(projectId)
        cb(null, path);
    },
    filename: (req, file, cb) => {
        let projectId = req.params.projectId;
        // console.log("MULTER_FILE", file)
        let n = file.originalname
        let extension = n.substring(n.lastIndexOf("."))
        let f = projectId + "_original" + extension
        cb(null, f);
    }
})
// Create the multer instance
const upload = multer({ storage: storage, /*limits: {fileSize: 100000000, files: 1}*/ })

export default upload;