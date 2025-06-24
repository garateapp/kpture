import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import {
    BookOpen,
    ChevronDown,
    CogIcon,
    Folder,
    FormInput,
    FormInputIcon,
    GroupIcon,
    LayoutGrid,
    Lightbulb,
    LockIcon,
    LockKeyholeOpenIcon,
    NotebookPenIcon,
    TypeIcon,
    Users,
} from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
];
const mainSeguridadNavItems: NavItem[] = [
    {
        title: 'Gestión de Usuarios',
        href: '/users',
        icon: Users,
    },
    {
        title: 'Roles',
        href: '/roles',
        icon: LockIcon,
    },
    {
        title: 'Permisos',
        href: '/permissions',
        icon: LockKeyholeOpenIcon,
    },

    {
        title: 'Estados',
        href: '/estados',
        icon: Lightbulb,
    },
];

const mainConfiguracionNavItems: NavItem[] = [
    {
        title: 'Grupos',
        href: '/grupos',
        icon: GroupIcon,
    },


    {
        title: 'Configuración',
        href: '/settings',
        icon: CogIcon,
    },
];
const mainDiseñadorFormulariosNavItems: NavItem[] = [
    {
        title: 'Formularios',
        href: '/formularios',
        icon: FormInput,
    },
  {
        title: 'Tipo de Formulario',
        href: '/tipoformulario',
        icon: TypeIcon,
    },

    {
        title: 'Datos Auxiliares',
        href: '/form-lists',
        icon: NotebookPenIcon,
    },
];
const mainFormulariosNavItems: NavItem[] = [
    {
        title: 'Formularios',
        href: '/formularios/responder',
        icon: FormInput,
    },
    {
        title: 'Ver Mis Respuestas',
        href: '/formularios/mis-respuestas',
        icon: NotebookPenIcon,
    },

];

const footerNavItems: NavItem[] = [
    // {
    //     title: 'Repository',
    //     href: 'https://github.com/laravel/react-starter-kit',
    //     icon: Folder,
    // },
    // {
    //     title: 'Documentation',
    //     href: 'https://laravel.com/docs/starter-kits#react',
    //     icon: BookOpen,
    // },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={mainNavItems} />
                <Collapsible  className="group/collapsible">
                    <SidebarGroup>
                        <SidebarGroupLabel asChild>
                            <CollapsibleTrigger>
                                Gestión de Usuarios
                                <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                            </CollapsibleTrigger>
                        </SidebarGroupLabel>
                        <CollapsibleContent>
                            <SidebarGroupContent>
                                <NavMain items={mainSeguridadNavItems}></NavMain>
                            </SidebarGroupContent>
                        </CollapsibleContent>
                    </SidebarGroup>
                </Collapsible>
                 <Collapsible  className="group/collapsible">
                    <SidebarGroup>
                        <SidebarGroupLabel asChild>
                            <CollapsibleTrigger>
                                Configuración
                                <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                            </CollapsibleTrigger>
                        </SidebarGroupLabel>
                        <CollapsibleContent>
                            <SidebarGroupContent>
                                <NavMain items={mainConfiguracionNavItems}></NavMain>
                            </SidebarGroupContent>
                        </CollapsibleContent>
                    </SidebarGroup>
                </Collapsible>
                 <Collapsible  className="group/collapsible">
                    <SidebarGroup>
                        <SidebarGroupLabel asChild>
                            <CollapsibleTrigger>
                                Diseñador de Formularios
                                <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                            </CollapsibleTrigger>
                        </SidebarGroupLabel>
                        <CollapsibleContent>
                            <SidebarGroupContent>
                                <NavMain items={mainDiseñadorFormulariosNavItems}></NavMain>
                            </SidebarGroupContent>
                        </CollapsibleContent>
                    </SidebarGroup>
                </Collapsible>
                 <Collapsible  className="group/collapsible">
                    <SidebarGroup>
                        <SidebarGroupLabel asChild>
                            <CollapsibleTrigger>
                                Mis Formularios
                                <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                            </CollapsibleTrigger>
                        </SidebarGroupLabel>
                        <CollapsibleContent>
                            <SidebarGroupContent>
                                <NavMain items={mainFormulariosNavItems}></NavMain>
                            </SidebarGroupContent>
                        </CollapsibleContent>
                    </SidebarGroup>
                </Collapsible>
            </SidebarContent>
            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
