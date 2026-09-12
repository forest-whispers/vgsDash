import type { Request, Response } from "express";

import * as projectsService from "./project.service.js";

export const createProject = async (req: Request, res: Response) =>
{
    const project = await projectsService.createProjectService(
        req.user,
        req.body
    );
    res.status(201).json({
        project
    });
};

export const getProjects = async (req: Request, res: Response) =>
{
    const projects = await projectsService.getProjectsService( req.user );
    res.status(200).json({
        projects
    });
};

export const getProject = async (req: Request, res: Response) =>
{
    const projectId = req.params.projectId as string;
    const project = await projectsService.getProjectService(
        req.user,
        projectId
    );
    res.status(200).json({
        project
    });
};

export const updateProject = async (req: Request, res: Response) =>
{
    const projectId = req.params.projectId as string;
    const project = await projectsService.updateProjectService(
        req.user,
        projectId,
        req.body
    );
    res.status(200).json({
        project
    });
};

export const abandonProject = async (req: Request, res: Response) =>
{
    const projectId = req.params.projectId as string;
    const project = await projectsService.abandonProjectService(
        req.user,
        projectId
    );
    res.status(200).json({
        project
    });
};