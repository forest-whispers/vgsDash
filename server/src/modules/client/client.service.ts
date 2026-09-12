import { Prisma } from "@prisma/client";
import { prisma } from "../../shared/config/prisma.js";

import { ConflictError, NotFoundError } from "../../shared/errors/errors.js";
import type { CreateClientDto, UpdateClientDto } from "./client.types.js";

export const createClientService = async (data: CreateClientDto) =>
{
    if(data.email)
    {
        const existingClient = await prisma.client.findUnique({
            where: { email: data.email }
        });
        if (existingClient)
        {
            throw new ConflictError("A client with this email already exists");
        }
    }

    return prisma.client.create({
        data: {
            name: data.name,
            ...(data.email !== undefined && { email: data.email }),
            ...(data.company !== undefined && { company: data.company })
        }
    });
};

export const getClientsService = async () =>
{
    return prisma.client.findMany({
        orderBy: {
            createdAt: "desc"
        }
    });
};

export const getClientService = async (clientId: string) =>
{
    const client = await prisma.client.findUnique({
        where: { id: clientId }
    });
    if (!client)
    {
        throw new NotFoundError("Client not found");
    }
    return client;
};

export const updateClientService = async ( clientId: string, data: UpdateClientDto) =>
{
    const client = await prisma.client.findUnique({
        where: { id: clientId }
    });
    if (!client)
    {
        throw new NotFoundError("Client not found");
    }

    return prisma.client.update({
        where: { id: clientId },
        data
    });
};

export const deleteClientService = async (clientId: string) =>
{
    const client = await prisma.client.findUnique({
        where: { id: clientId }
    });
    if (!client) {
        throw new NotFoundError("Client not found");
    }

    const projectsCount = await prisma.project.count({
        where: { clientId }
    });
    if (projectsCount > 0) {
        throw new ConflictError(
            "Cannot delete client because they are associated with existing projects."
        );
    }

    return prisma.client.delete({
        where: { id: clientId }
    });
};