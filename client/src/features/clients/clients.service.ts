import api from "../../lib/axios";
import type { Client, CreateClientData, UpdateClientData } from "./clients.types";

export const getClients = async (): Promise<Client[]> => {
    const response = await api.get<{ clients: Client[] }>("/clients");
    return response.data.clients;
};

export const getClient = async (clientId: string): Promise<Client> => {
    const response = await api.get<{ client: Client }>(`/clients/${clientId}`);
    return response.data.client;
};

export const createClient = async (data: CreateClientData): Promise<Client> => {
    const response = await api.post<{ client: Client }>("/clients", data);
    return response.data.client;
};

export const updateClient = async (
    clientId: string,
    data: UpdateClientData
): Promise<Client> => {
    const response = await api.patch<{ client: Client }>(
        `/clients/${clientId}`,
        data
    );
    return response.data.client;
};

export const deleteClient = async (clientId: string): Promise<void> => {
    await api.delete(`/clients/${clientId}`);
};
