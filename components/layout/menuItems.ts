import {
  LayoutDashboard,
  Building2,
  CheckSquare,
  Users,
  Bell,
  ClipboardList,
  CalendarDays,
  GraduationCap,
  BarChart3,
  ShieldAlert,
  Bot,
  Clock3,
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