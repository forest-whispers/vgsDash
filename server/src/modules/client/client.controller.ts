import type { Request, Response } from "express";

import * as clientsService from "./client.service.js";

export const createClient = async (req: Request, res: Response) =>
{
    const client = await clientsService.createClientService(req.body);
    res.status(201).json({
        client
    });
};

export const getClients = async (req: Request, res: Response) =>
{
    const clients = await clientsService.getClientsService();
    res.status(200).json({
        clients
    });
};

export const getClient = async (req: Request, res: Response) =>
{
    const clientId = req.params.clientId as string;
    const client = await clientsService.getClientService(clientId);
    res.status(200).json({
        client
    });
};

export const updateClient = async (req: Request, res: Response) => {
    const clientId = req.params.clientId as string;
    const client = await clientsService.updateClientService(
        clientId,
        req.body
    );
    res.status(200).json({
        client
    });
};

export const deleteClient = async (req: Request, res: Response) => {
    const clientId = req.params.clientId as string;
    await clientsService.deleteClientService(
        clientId
    );
    res.status(200).json({
        message: "Client deleted successfully."
    });
};