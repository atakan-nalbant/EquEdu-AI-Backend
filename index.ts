import express, { Express, Request, Response, Application } from 'express';
import cors from "cors"


import mediaRoute from "./Routes/media"
import projectRoute from "./Routes/project"
import userRoute from "./Routes/user"


const app: Application = express();
// const port = 3000; //PROD
const port = 3000;

app.use(express.json())
app.use(cors())

app.use(mediaRoute)
app.use(projectRoute)
app.use(userRoute)

app.get('/', (req: Request, res: Response) => {
    res.sendStatus(200)
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

