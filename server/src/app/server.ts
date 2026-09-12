import { env } from "../shared/config/env.js";
import http from "http";

import app from "./app.js";

import { initializeSocket } from "../socket/index.js";
import { startOverdueTaskCron } from "../cron/overdueTask.cron.js";

const server=http.createServer(app);

initializeSocket(server);
startOverdueTaskCron();

server.listen(env.PORT, ()=>{
    console.log(`Server is running on port ${env.PORT}`);
});