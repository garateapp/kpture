import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    estado_id: number | null;
    [key: string]: unknown; // This allows for additional properties...
}
export interface UserData {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    estado_id: number | null;
}

export interface RoleData {
    id: number;
    title: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export interface EstadoData {
    id: number;
    nombre: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export interface PaginatedData<T> {
    current_page: number;
    data: T[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

// Puedes definir el tipo para las props de autenticación si usas Jetstream/Breeze
export interface AuthProps {
    user: {
        id: number;
        name: string;
        email: string;
        // Agrega otras propiedades del usuario si las necesitas en el frontend
    };
}
