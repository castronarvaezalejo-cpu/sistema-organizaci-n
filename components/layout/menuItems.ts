import {
  LayoutDashboard,
  Building2,
  CheckSquare,
  Users,
  Bell,
  Cake,
  ClipboardList,
  CalendarDays,
  CalendarClock,
  GraduationCap,
  BarChart3,
  ShieldAlert,
  Bot,
  Clock3,
  FileText,
  UserRound,
} from "lucide-react";

export const menuItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Empresas",
    href: "/empresas",
    icon: Building2,
  },

  {
  title: "Trabajadores",
  href: "/trabajadores",
  icon: Users,
},

  {
    title: "Cumpleaños",
    href: "/cumpleanos",
    icon: Cake,
  },

  {
    title: "Tareas",
    href: "/tareas",
    icon: CheckSquare,
  },
  {
    title: "Calendario",
    href: "/calendario",
    icon: CalendarDays,
  },
  {
    title: "Planeación",
    href: "/planeacion",
    icon: CalendarClock,
  },
  {
    title: "Capacitaciones",
    href: "/capacitaciones",
    icon: GraduationCap,
  },
  {
    title: "Horas",
    href: "/horas",
    icon: Clock3,
  },
  {
    title: "Alertas",
    href: "/alertas",
    icon: Bell,
  },
  {
    title: "Extintores",
    href: "/extintores",
    icon: ShieldAlert,
  },
  {
    title: "ChatBot",
    href: "/chatbot",
    icon: Bot,
  },
];

export const adminMenuItems = [
  {
    title: "Colaboradores",
    href: "/colaboradores",
    icon: Users,
  },
  {
    title: "Actividades",
    href: "/actividades",
    icon: ClipboardList,
  },
  {
    title: "Reportes",
    href: "/reportes",
    icon: BarChart3,
  },
];

export const trabajadorMenuItems = [
  {
    title: "Mi Perfil",
    href: "/mi-perfil",
    icon: UserRound,
  },
  {
    title: "Mis Capacitaciones",
    href: "/mis-capacitaciones",
    icon: GraduationCap,
  },
  {
    title: "Mis Actividades",
    href: "/mis-actividades",
    icon: ClipboardList,
  },
  {
    title: "Mis Documentos",
    href: "/mis-documentos",
    icon: FileText,
  },
];
