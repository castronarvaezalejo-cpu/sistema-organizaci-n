export type EmpresaOption = {
  id: string;
  nombre: string;
};

export type Trabajador = {
  id: string;
  empresa_id: string;
  nombre: string;
  cargo?: string | null;
  estado?: string | null;
  correo?: string | null;
  telefono?: string | null;
  fecha_ingreso?: string | null;
  fecha_nacimiento?: string | null;
  foto_url?: string | null;
  empresas?: {
    nombre?: string | null;
  } | null;
};
