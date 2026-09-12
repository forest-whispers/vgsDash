export interface Client {
    id: string;
    name: string;
    email?: string | null;
    company?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateClientData {
    name: string;
    email?: string;
    company?: string;
}

export interface UpdateClientData {
    name?: string;
    email?: string;
    company?: string;
}
