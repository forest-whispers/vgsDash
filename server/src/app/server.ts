import { env } from "../shared/config/env.js";
import http from "http";

import app from "./app.js";

const server=http.createServer(app);

server.listen(env.PORT, ()=>{
    console.log(`Server is running on port ${env.PORT}`);
});