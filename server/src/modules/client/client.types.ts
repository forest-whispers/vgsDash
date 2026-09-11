export interface CreateClientDto
{
    name: string;
    email?: string;
    company?: string;
}

export interface UpdateClientDto
{
    name?: string;
    email?: string;
    company?: string;
}