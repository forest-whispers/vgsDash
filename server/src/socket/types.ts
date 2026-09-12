import type { Socket } from "socket.io";

import type { AuthContext } from "../modules/auth/auth.types.js";

export type AuthenticatedSocket = Socket & {
    user: AuthContext;
};