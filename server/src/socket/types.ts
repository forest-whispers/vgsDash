import type { Socket } from "socket.io";

import type { AuthContext } from "../modules/auth/auth.types.js";
import type { UserRole } from "@prisma/client";

export type AuthenticatedSocket = Socket & {
    user: AuthContext;
};

export interface PresenceUser {
    id: string;
    role: UserRole;
    online: boolean;
}

export interface PresenceUpdate {
    users: PresenceUser[];
}