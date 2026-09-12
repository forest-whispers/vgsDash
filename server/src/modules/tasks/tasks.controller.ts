import type { Request, Response } from "express";

import * as tasksService from "./tasks.service.js";

export const createTask = async (req: Request, res: Response) =>
{
    const projectId = req.params.projectId as string;
    const task = await tasksService.createTaskService(
        req.user!,
        projectId,
        req.body
    );
    res.status(201).json({
        task
    });
};

export const getTasks = async (req: Request, res: Response) =>
{
    const projectId = req.params.projectId as string;
    const tasks = await tasksService.getTasksService(
        req.user!,
        projectId,
        req.query
    );
    res.status(200).json({
        tasks
    });
};

export const getTask = async (req: Request, res: Response) =>
{
    const taskId = req.params.taskId as string;
    const task = await tasksService.getTaskService(
        req.user!,
        taskId
    );
    res.status(200).json({
        task
    });
};

export const updateTask = async (req: Request, res: Response) =>
{
    const taskId = req.params.taskId as string;
    const task = await tasksService.updateTaskService(
        req.user!,
        taskId,
        req.body
    );
    res.status(200).json({
        task
    });
};

export const assignTask = async (req: Request, res: Response) =>
{
    const taskId = req.params.taskId as string;
    const task = await tasksService.assignTaskService(
        req.user!,
        taskId,
        req.body
    );
    res.status(200).json({
        task
    });
};

export const updateTaskStatus = async (req: Request, res: Response) => {
    const taskId = req.params.taskId as string;
    const task = await tasksService.updateTaskStatusService(
        req.user!,
        taskId,
        req.body
    );
    res.status(200).json({
        task
    });
};