/**
 * Database Seed Script
 * ====================
 * 
 * Demo Credentials:
 * ----------------------------------------------------
 * Role             Email               Password
 * ----------------------------------------------------
 * Admin            admin@demo.com      Password123!
 * 
 * Project Manager  pm1@demo.com        Password123!
 * Project Manager  pm2@demo.com        Password123!
 * 
 * Developer        dev1@demo.com       Password123!
 * Developer        dev2@demo.com       Password123!
 * Developer        dev3@demo.com       Password123!
 * Developer        dev4@demo.com       Password123!
 * ----------------------------------------------------
 */

import "dotenv/config";
import {
  PrismaClient,
  UserRole,
  ProjectStatus,
  TaskStatus,
  TaskPriority,
  ActivityType,
  NotificationType,
} from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // 1. Clean up existing records in reverse dependency order for safe, idempotent re-runs
  console.log("🧹 Flushing existing records...");
  await prisma.$transaction([
    prisma.notification.deleteMany(),
    prisma.activity.deleteMany(),
    prisma.task.deleteMany(),
    prisma.project.deleteMany(),
    prisma.refreshToken.deleteMany(),
    prisma.client.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  // 2. Hash default password using application's bcrypt standard (SALT_ROUNDS = 10)
  const passwordHash = await bcrypt.hash("Password123!", 10);

  // 3. Seed Users (1 Admin, 2 PMs, 4 Developers)
  console.log("👤 Creating demo users...");
  const admin = await prisma.user.create({
    data: {
      name: "Alice Admin",
      email: "admin@demo.com",
      passwordHash,
      role: UserRole.ADMIN,
    },
  });

  const pm1 = await prisma.user.create({
    data: {
      name: "Bob Miller",
      email: "pm1@demo.com",
      passwordHash,
      role: UserRole.PROJECT_MANAGER,
    },
  });

  const pm2 = await prisma.user.create({
    data: {
      name: "Carol Vance",
      email: "pm2@demo.com",
      passwordHash,
      role: UserRole.PROJECT_MANAGER,
    },
  });

  const dev1 = await prisma.user.create({
    data: {
      name: "David Kim",
      email: "dev1@demo.com",
      passwordHash,
      role: UserRole.DEVELOPER,
    },
  });

  const dev2 = await prisma.user.create({
    data: {
      name: "Emma Watson",
      email: "dev2@demo.com",
      passwordHash,
      role: UserRole.DEVELOPER,
    },
  });

  const dev3 = await prisma.user.create({
    data: {
      name: "Frank Wright",
      email: "dev3@demo.com",
      passwordHash,
      role: UserRole.DEVELOPER,
    },
  });

  const dev4 = await prisma.user.create({
    data: {
      name: "Grace Hopper",
      email: "dev4@demo.com",
      passwordHash,
      role: UserRole.DEVELOPER,
    },
  });

  // 4. Seed Clients
  console.log("🏢 Creating clients...");
  const clientAcme = await prisma.client.create({
    data: {
      name: "Acme Innovations",
      email: "contact@acme.com",
      company: "Acme Corp",
    },
  });

  const clientNexus = await prisma.client.create({
    data: {
      name: "Nexus Healthcare",
      email: "info@nexushealth.com",
      company: "Nexus Systems",
    },
  });

  const clientApex = await prisma.client.create({
    data: {
      name: "Apex Financial",
      email: "support@apexfin.com",
      company: "Apex Global",
    },
  });

  // 5. Seed Projects (Distributed between PMs; visible to Admin; RBAC compliant)
  console.log("📁 Creating projects...");
  const now = new Date();
  const pastDays = (d: number) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000);
  const futureDays = (d: number) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000);
  const pastHours = (h: number) => new Date(now.getTime() - h * 60 * 60 * 1000);

  const project1 = await prisma.project.create({
    data: {
      name: "E-Commerce Mobile Platform",
      description: "Cross-platform mobile application with real-time checkout and inventory syncing.",
      status: ProjectStatus.ACTIVE,
      clientId: clientAcme.id,
      createdById: admin.id,
      managerId: pm1.id,
      createdAt: pastDays(14),
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: "Patient Health Portal",
      description: "HIPAA-compliant telehealth dashboard with electronic health record management.",
      status: ProjectStatus.ACTIVE,
      clientId: clientNexus.id,
      createdById: admin.id,
      managerId: pm2.id,
      createdAt: pastDays(10),
    },
  });

  const project3 = await prisma.project.create({
    data: {
      name: "Fintech Wealth Suite",
      description: "Algorithmic portfolio rebalancing and automated tax-loss harvesting platform.",
      status: ProjectStatus.ACTIVE,
      clientId: clientApex.id,
      createdById: admin.id,
      managerId: pm2.id,
      createdAt: pastDays(8),
    },
  });

  // 6. Seed Tasks (6 tasks per project = 18 total; full status spread; >= 2 overdue)
  console.log("📝 Creating tasks...");

  // --- Project 1 Tasks (Manager: PM1) ---
  const task1_1 = await prisma.task.create({
    data: {
      title: "Design responsive product catalog UI",
      description: "Implement modern grid and list views with infinite scrolling and filter facets.",
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      dueDate: futureDays(4),
      isOverdue: false,
      projectId: project1.id,
      assignedDeveloperId: dev1.id,
      createdById: pm1.id,
      createdAt: pastDays(12),
    },
  });

  const task1_2 = await prisma.task.create({
    data: {
      title: "Implement shopping cart state management",
      description: "Persist client cart state and sync with backend cart session service.",
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      dueDate: futureDays(2),
      isOverdue: false,
      projectId: project1.id,
      assignedDeveloperId: dev2.id,
      createdById: pm1.id,
      createdAt: pastDays(11),
    },
  });

  const task1_3 = await prisma.task.create({
    data: {
      title: "Implement OAuth2 social authentication",
      description: "Add Google and GitHub OAuth providers with JWT token exchange.",
      status: TaskStatus.IN_REVIEW,
      priority: TaskPriority.CRITICAL,
      dueDate: futureDays(1),
      isOverdue: false,
      projectId: project1.id,
      assignedDeveloperId: dev1.id,
      createdById: pm1.id,
      createdAt: pastDays(10),
    },
  });

  const task1_4 = await prisma.task.create({
    data: {
      title: "Setup PostgreSQL database migration scripts",
      description: "Configure Prisma schema, database indexes, and connection pooler.",
      status: TaskStatus.DONE,
      priority: TaskPriority.LOW,
      dueDate: pastDays(6),
      isOverdue: false,
      projectId: project1.id,
      assignedDeveloperId: dev2.id,
      createdById: pm1.id,
      createdAt: pastDays(13),
    },
  });

  // Overdue Task 1: Past due date, status NOT DONE, isOverdue = true
  const task1_5 = await prisma.task.create({
    data: {
      title: "Integrate Stripe payment gateway webhooks",
      description: "Handle asynchronous charge events, refunds, and failed checkout retries.",
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      dueDate: pastDays(5),
      isOverdue: true,
      projectId: project1.id,
      assignedDeveloperId: dev3.id,
      createdById: pm1.id,
      createdAt: pastDays(9),
    },
  });

  const task1_6 = await prisma.task.create({
    data: {
      title: "Write end-to-end checkout flow tests",
      description: "Cover user checkout journey with Cypress/Playwright integration tests.",
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      dueDate: futureDays(7),
      isOverdue: false,
      projectId: project1.id,
      assignedDeveloperId: dev4.id,
      createdById: pm1.id,
      createdAt: pastDays(8),
    },
  });

  // --- Project 2 Tasks (Manager: PM2) ---
  const task2_1 = await prisma.task.create({
    data: {
      title: "Configure HL7 FHIR patient data connectors",
      description: "Integrate electronic health records using standardized HL7 FHIR RESTful APIs.",
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.CRITICAL,
      dueDate: futureDays(2),
      isOverdue: false,
      projectId: project2.id,
      assignedDeveloperId: dev3.id,
      createdById: pm2.id,
      createdAt: pastDays(9),
    },
  });

  const task2_2 = await prisma.task.create({
    data: {
      title: "Build doctor appointment scheduling calendar",
      description: "Interactive weekly view with provider availability slots and conflict validation.",
      status: TaskStatus.IN_REVIEW,
      priority: TaskPriority.HIGH,
      dueDate: futureDays(3),
      isOverdue: false,
      projectId: project2.id,
      assignedDeveloperId: dev4.id,
      createdById: pm2.id,
      createdAt: pastDays(8),
    },
  });

  const task2_3 = await prisma.task.create({
    data: {
      title: "Implement WebRTC video consultation room",
      description: "Peer-to-peer encrypted video and audio channel with fallback TURN servers.",
      status: TaskStatus.TODO,
      priority: TaskPriority.HIGH,
      dueDate: futureDays(5),
      isOverdue: false,
      projectId: project2.id,
      assignedDeveloperId: dev2.id,
      createdById: pm2.id,
      createdAt: pastDays(7),
    },
  });

  const task2_4 = await prisma.task.create({
    data: {
      title: "Setup Redis session store and rate limiting",
      description: "Protect API endpoints against brute force attempts with sliding window rate limiting.",
      status: TaskStatus.DONE,
      priority: TaskPriority.MEDIUM,
      dueDate: pastDays(4),
      isOverdue: false,
      projectId: project2.id,
      assignedDeveloperId: dev1.id,
      createdById: pm2.id,
      createdAt: pastDays(10),
    },
  });

  // Overdue Task 2: Past due date, status NOT DONE, isOverdue = true
  const task2_5 = await prisma.task.create({
    data: {
      title: "HIPAA audit log export and archival script",
      description: "Scheduled daily export of encrypted audit trails to immutable cold storage.",
      status: TaskStatus.TODO,
      priority: TaskPriority.CRITICAL,
      dueDate: pastDays(3),
      isOverdue: true,
      projectId: project2.id,
      assignedDeveloperId: dev4.id,
      createdById: pm2.id,
      createdAt: pastDays(7),
    },
  });

  const task2_6 = await prisma.task.create({
    data: {
      title: "Create patient intake questionnaire forms",
      description: "Dynamic multi-step medical history form with input sanitization and draft auto-save.",
      status: TaskStatus.DONE,
      priority: TaskPriority.LOW,
      dueDate: pastDays(2),
      isOverdue: false,
      projectId: project2.id,
      assignedDeveloperId: dev3.id,
      createdById: pm2.id,
      createdAt: pastDays(8),
    },
  });

  // --- Project 3 Tasks (Manager: PM2) ---
  // Overdue Task 3: Past due date, status NOT DONE, isOverdue = true
  const task3_1 = await prisma.task.create({
    data: {
      title: "Develop portfolio rebalancing calculation engine",
      description: "Core algorithm calculating target asset weights and optimal trade orders.",
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.CRITICAL,
      dueDate: pastDays(2),
      isOverdue: true,
      projectId: project3.id,
      assignedDeveloperId: dev1.id,
      createdById: pm2.id,
      createdAt: pastDays(8),
    },
  });

  const task3_2 = await prisma.task.create({
    data: {
      title: "Build real-time stock ticker WebSocket service",
      description: "Stream sub-second market data updates to connected dashboard clients.",
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      dueDate: futureDays(1),
      isOverdue: false,
      projectId: project3.id,
      assignedDeveloperId: dev2.id,
      createdById: pm2.id,
      createdAt: pastDays(7),
    },
  });

  const task3_3 = await prisma.task.create({
    data: {
      title: "Create interactive asset allocation pie chart",
      description: "Data visualization component showcasing current vs target portfolio distribution.",
      status: TaskStatus.IN_REVIEW,
      priority: TaskPriority.MEDIUM,
      dueDate: futureDays(4),
      isOverdue: false,
      projectId: project3.id,
      assignedDeveloperId: dev2.id,
      createdById: pm2.id,
      createdAt: pastDays(6),
    },
  });

  const task3_4 = await prisma.task.create({
    data: {
      title: "Design KYC identity verification workflow",
      description: "Document upload and verification webhook integration with third-party KYC vendor.",
      status: TaskStatus.TODO,
      priority: TaskPriority.LOW,
      dueDate: futureDays(6),
      isOverdue: false,
      projectId: project3.id,
      assignedDeveloperId: dev3.id,
      createdById: pm2.id,
      createdAt: pastDays(5),
    },
  });

  const task3_5 = await prisma.task.create({
    data: {
      title: "Implement automated daily account statement PDF generator",
      description: "Worker job generating formatted PDF statements and emailing to account holders.",
      status: TaskStatus.DONE,
      priority: TaskPriority.MEDIUM,
      dueDate: pastDays(3),
      isOverdue: false,
      projectId: project3.id,
      assignedDeveloperId: dev4.id,
      createdById: pm2.id,
      createdAt: pastDays(7),
    },
  });

  const task3_6 = await prisma.task.create({
    data: {
      title: "Benchmark order routing latency under peak load",
      description: "Stress test execution pipeline with simulated market open spike of 10k orders/sec.",
      status: TaskStatus.TODO,
      priority: TaskPriority.HIGH,
      dueDate: futureDays(8),
      isOverdue: false,
      projectId: project3.id,
      assignedDeveloperId: dev1.id,
      createdById: pm2.id,
      createdAt: pastDays(4),
    },
  });

  // 7. Seed Activities (Populates feeds immediately; valid actor/project/task relations; RBAC compliant)
  console.log("📊 Creating activities...");
  await prisma.activity.createMany({
    data: [
      // Project creation activities
      {
        type: ActivityType.PROJECT_CREATED,
        actorId: admin.id,
        projectId: project1.id,
        createdAt: pastDays(14),
      },
      {
        type: ActivityType.PROJECT_CREATED,
        actorId: admin.id,
        projectId: project2.id,
        createdAt: pastDays(10),
      },
      {
        type: ActivityType.PROJECT_CREATED,
        actorId: admin.id,
        projectId: project3.id,
        createdAt: pastDays(8),
      },

      // Project update activities
      {
        type: ActivityType.PROJECT_UPDATED,
        actorId: pm1.id,
        projectId: project1.id,
        metadata: { fields: ["description"] },
        createdAt: pastDays(11),
      },
      {
        type: ActivityType.PROJECT_UPDATED,
        actorId: pm2.id,
        projectId: project2.id,
        metadata: { fields: ["description"] },
        createdAt: pastDays(7),
      },

      // Project 1 Task Activities (Visible to Admin, PM1, and respective assigned Devs)
      {
        type: ActivityType.TASK_CREATED,
        actorId: pm1.id,
        projectId: project1.id,
        taskId: task1_1.id,
        createdAt: pastDays(12),
      },
      {
        type: ActivityType.TASK_ASSIGNED,
        actorId: pm1.id,
        projectId: project1.id,
        taskId: task1_1.id,
        metadata: { fromDeveloperId: null, toDeveloperId: dev1.id },
        createdAt: pastDays(12),
      },
      {
        type: ActivityType.TASK_CREATED,
        actorId: pm1.id,
        projectId: project1.id,
        taskId: task1_2.id,
        createdAt: pastDays(11),
      },
      {
        type: ActivityType.TASK_ASSIGNED,
        actorId: pm1.id,
        projectId: project1.id,
        taskId: task1_2.id,
        metadata: { fromDeveloperId: null, toDeveloperId: dev2.id },
        createdAt: pastDays(11),
      },
      {
        type: ActivityType.TASK_STATUS_CHANGED,
        actorId: dev2.id,
        projectId: project1.id,
        taskId: task1_2.id,
        metadata: { from: TaskStatus.TODO, to: TaskStatus.IN_PROGRESS },
        createdAt: pastDays(9),
      },
      {
        type: ActivityType.TASK_CREATED,
        actorId: pm1.id,
        projectId: project1.id,
        taskId: task1_3.id,
        createdAt: pastDays(10),
      },
      {
        type: ActivityType.TASK_ASSIGNED,
        actorId: pm1.id,
        projectId: project1.id,
        taskId: task1_3.id,
        metadata: { fromDeveloperId: null, toDeveloperId: dev1.id },
        createdAt: pastDays(10),
      },
      {
        type: ActivityType.TASK_STATUS_CHANGED,
        actorId: dev1.id,
        projectId: project1.id,
        taskId: task1_3.id,
        metadata: { from: TaskStatus.IN_PROGRESS, to: TaskStatus.IN_REVIEW },
        createdAt: pastHours(26),
      },
      {
        type: ActivityType.TASK_STATUS_CHANGED,
        actorId: dev2.id,
        projectId: project1.id,
        taskId: task1_4.id,
        metadata: { from: TaskStatus.IN_REVIEW, to: TaskStatus.DONE },
        createdAt: pastDays(6),
      },
      {
        type: ActivityType.TASK_UPDATED,
        actorId: pm1.id,
        projectId: project1.id,
        taskId: task1_5.id,
        metadata: { fields: ["priority", "dueDate"] },
        createdAt: pastDays(4),
      },
      {
        type: ActivityType.TASK_ASSIGNED,
        actorId: pm1.id,
        projectId: project1.id,
        taskId: task1_6.id,
        metadata: { fromDeveloperId: null, toDeveloperId: dev4.id },
        createdAt: pastDays(8),
      },

      // Project 2 Task Activities (Visible to Admin, PM2, and respective assigned Devs)
      {
        type: ActivityType.TASK_CREATED,
        actorId: pm2.id,
        projectId: project2.id,
        taskId: task2_1.id,
        createdAt: pastDays(9),
      },
      {
        type: ActivityType.TASK_ASSIGNED,
        actorId: pm2.id,
        projectId: project2.id,
        taskId: task2_1.id,
        metadata: { fromDeveloperId: null, toDeveloperId: dev3.id },
        createdAt: pastDays(9),
      },
      {
        type: ActivityType.TASK_STATUS_CHANGED,
        actorId: dev3.id,
        projectId: project2.id,
        taskId: task2_1.id,
        metadata: { from: TaskStatus.TODO, to: TaskStatus.IN_PROGRESS },
        createdAt: pastDays(5),
      },
      {
        type: ActivityType.TASK_CREATED,
        actorId: pm2.id,
        projectId: project2.id,
        taskId: task2_2.id,
        createdAt: pastDays(8),
      },
      {
        type: ActivityType.TASK_ASSIGNED,
        actorId: pm2.id,
        projectId: project2.id,
        taskId: task2_2.id,
        metadata: { fromDeveloperId: null, toDeveloperId: dev4.id },
        createdAt: pastDays(8),
      },
      {
        type: ActivityType.TASK_STATUS_CHANGED,
        actorId: dev4.id,
        projectId: project2.id,
        taskId: task2_2.id,
        metadata: { from: TaskStatus.IN_PROGRESS, to: TaskStatus.IN_REVIEW },
        createdAt: pastHours(18),
      },
      {
        type: ActivityType.TASK_ASSIGNED,
        actorId: pm2.id,
        projectId: project2.id,
        taskId: task2_3.id,
        metadata: { fromDeveloperId: null, toDeveloperId: dev2.id },
        createdAt: pastDays(7),
      },
      {
        type: ActivityType.TASK_STATUS_CHANGED,
        actorId: dev1.id,
        projectId: project2.id,
        taskId: task2_4.id,
        metadata: { from: TaskStatus.IN_REVIEW, to: TaskStatus.DONE },
        createdAt: pastDays(4),
      },
      {
        type: ActivityType.TASK_UPDATED,
        actorId: pm2.id,
        projectId: project2.id,
        taskId: task2_5.id,
        metadata: { fields: ["priority"] },
        createdAt: pastDays(3),
      },
      {
        type: ActivityType.TASK_STATUS_CHANGED,
        actorId: dev3.id,
        projectId: project2.id,
        taskId: task2_6.id,
        metadata: { from: TaskStatus.IN_REVIEW, to: TaskStatus.DONE },
        createdAt: pastDays(2),
      },

      // Project 3 Task Activities (Visible to Admin, PM2, and respective assigned Devs)
      {
        type: ActivityType.TASK_CREATED,
        actorId: pm2.id,
        projectId: project3.id,
        taskId: task3_1.id,
        createdAt: pastDays(8),
      },
      {
        type: ActivityType.TASK_ASSIGNED,
        actorId: pm2.id,
        projectId: project3.id,
        taskId: task3_1.id,
        metadata: { fromDeveloperId: null, toDeveloperId: dev1.id },
        createdAt: pastDays(8),
      },
      {
        type: ActivityType.TASK_STATUS_CHANGED,
        actorId: dev1.id,
        projectId: project3.id,
        taskId: task3_1.id,
        metadata: { from: TaskStatus.TODO, to: TaskStatus.IN_PROGRESS },
        createdAt: pastDays(4),
      },
      {
        type: ActivityType.TASK_CREATED,
        actorId: pm2.id,
        projectId: project3.id,
        taskId: task3_2.id,
        createdAt: pastDays(7),
      },
      {
        type: ActivityType.TASK_ASSIGNED,
        actorId: pm2.id,
        projectId: project3.id,
        taskId: task3_2.id,
        metadata: { fromDeveloperId: null, toDeveloperId: dev2.id },
        createdAt: pastDays(7),
      },
      {
        type: ActivityType.TASK_STATUS_CHANGED,
        actorId: dev2.id,
        projectId: project3.id,
        taskId: task3_2.id,
        metadata: { from: TaskStatus.TODO, to: TaskStatus.IN_PROGRESS },
        createdAt: pastHours(20),
      },
      {
        type: ActivityType.TASK_STATUS_CHANGED,
        actorId: dev2.id,
        projectId: project3.id,
        taskId: task3_3.id,
        metadata: { from: TaskStatus.IN_PROGRESS, to: TaskStatus.IN_REVIEW },
        createdAt: pastHours(12),
      },
      {
        type: ActivityType.TASK_ASSIGNED,
        actorId: pm2.id,
        projectId: project3.id,
        taskId: task3_4.id,
        metadata: { fromDeveloperId: null, toDeveloperId: dev3.id },
        createdAt: pastDays(5),
      },
      {
        type: ActivityType.TASK_STATUS_CHANGED,
        actorId: dev4.id,
        projectId: project3.id,
        taskId: task3_5.id,
        metadata: { from: TaskStatus.IN_REVIEW, to: TaskStatus.DONE },
        createdAt: pastDays(3),
      },
      {
        type: ActivityType.TASK_ASSIGNED,
        actorId: pm2.id,
        projectId: project3.id,
        taskId: task3_6.id,
        metadata: { fromDeveloperId: null, toDeveloperId: dev1.id },
        createdAt: pastDays(4),
      },
    ],
  });

  // 8. Seed Notifications (Consistent with current database enum values: PROJECT_ASSIGNED, TASK_ASSIGNED, TASK_IN_REVIEW)
  console.log("🔔 Creating notifications...");
  await prisma.notification.createMany({
    data: [
      // PM1 Notifications
      {
        type: NotificationType.PROJECT_ASSIGNED,
        recipientId: pm1.id,
        projectId: project1.id,
        metadata: { projectName: project1.name },
        readAt: pastDays(13),
        createdAt: pastDays(14),
      },
      {
        type: NotificationType.TASK_IN_REVIEW,
        recipientId: pm1.id,
        projectId: project1.id,
        taskId: task1_3.id,
        metadata: { taskTitle: task1_3.title },
        readAt: null, // Unread
        createdAt: pastHours(26),
      },

      // PM2 Notifications
      {
        type: NotificationType.PROJECT_ASSIGNED,
        recipientId: pm2.id,
        projectId: project2.id,
        metadata: { projectName: project2.name },
        readAt: pastDays(9),
        createdAt: pastDays(10),
      },
      {
        type: NotificationType.TASK_IN_REVIEW,
        recipientId: pm2.id,
        projectId: project2.id,
        taskId: task2_2.id,
        metadata: { taskTitle: task2_2.title },
        readAt: null, // Unread
        createdAt: pastHours(18),
      },
      {
        type: NotificationType.TASK_IN_REVIEW,
        recipientId: pm2.id,
        projectId: project3.id,
        taskId: task3_3.id,
        metadata: { taskTitle: task3_3.title },
        readAt: null, // Unread
        createdAt: pastHours(12),
      },

      // Developer Notifications
      {
        type: NotificationType.TASK_ASSIGNED,
        recipientId: dev1.id,
        projectId: project1.id,
        taskId: task1_1.id,
        metadata: { taskTitle: task1_1.title },
        readAt: null, // Unread
        createdAt: pastDays(12),
      },
      {
        type: NotificationType.TASK_ASSIGNED,
        recipientId: dev1.id,
        projectId: project3.id,
        taskId: task3_1.id,
        metadata: { taskTitle: task3_1.title },
        readAt: null, // Unread
        createdAt: pastDays(8),
      },
      {
        type: NotificationType.TASK_ASSIGNED,
        recipientId: dev2.id,
        projectId: project1.id,
        taskId: task1_2.id,
        metadata: { taskTitle: task1_2.title },
        readAt: pastDays(4),
        createdAt: pastDays(11),
      },
      {
        type: NotificationType.TASK_ASSIGNED,
        recipientId: dev2.id,
        projectId: project3.id,
        taskId: task3_2.id,
        metadata: { taskTitle: task3_2.title },
        readAt: null, // Unread
        createdAt: pastDays(7),
      },
      {
        type: NotificationType.TASK_ASSIGNED,
        recipientId: dev3.id,
        projectId: project1.id,
        taskId: task1_5.id,
        metadata: { taskTitle: task1_5.title },
        readAt: null, // Unread
        createdAt: pastDays(9),
      },
      {
        type: NotificationType.TASK_ASSIGNED,
        recipientId: dev3.id,
        projectId: project2.id,
        taskId: task2_1.id,
        metadata: { taskTitle: task2_1.title },
        readAt: pastDays(2),
        createdAt: pastDays(9),
      },
      {
        type: NotificationType.TASK_ASSIGNED,
        recipientId: dev4.id,
        projectId: project1.id,
        taskId: task1_6.id,
        metadata: { taskTitle: task1_6.title },
        readAt: null, // Unread
        createdAt: pastDays(8),
      },
      {
        type: NotificationType.TASK_ASSIGNED,
        recipientId: dev4.id,
        projectId: project2.id,
        taskId: task2_5.id,
        metadata: { taskTitle: task2_5.title },
        readAt: null, // Unread
        createdAt: pastDays(7),
      },
    ],
  });

  console.log("✅ Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
