import { prisma } from "../config/prisma.js";

export const flushDatabase = async () => {
    console.log("Flushing database...");
    await prisma.$transaction([
        prisma.notification.deleteMany(),
        prisma.activity.deleteMany(),
        prisma.task.deleteMany(),
        prisma.project.deleteMany(),
        prisma.refreshToken.deleteMany(),
        prisma.client.deleteMany(),
        prisma.user.deleteMany(),
    ]);
    console.log("Database flushed successfully.");
};

if (process.argv[1]?.includes("flushDb")) {
    flushDatabase()
        .then(() => {
            process.exit(0);
        })
        .catch((err) => {
            console.error("Failed to flush database:", err);
            process.exit(1);
        });
}
