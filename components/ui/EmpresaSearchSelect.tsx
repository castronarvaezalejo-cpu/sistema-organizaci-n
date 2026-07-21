"use client";

import {
  KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ChevronDown, Search } from "lucide-react";

type Empresa = {
  id: string;
  nombre: string;
};

type EmpresaSearchSelectProps = {
  empresas: Empresa[];
  value: string | null;
  onChange: (id: string) => void;
  placeholder?: string;
  emptyLabel?: string;
  className?: string;
};

function normalizarTexto(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export default function EmpresaSearchSelect({
  empresas,
  value,
  onChange,
  placeholder = "Seleccionar empresa",
  emptyLabel = "No se encontraron empresas",
  className = "",
}: EmpresaSearchSelectProps) {
  const contenedorRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [abierto, setAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [indiceActivo, setIndiceActivo] = useState(0);

  const empresaSeleccionada = empresas.find(
    (empresa) => empresa.id === value
  );

  const empresasFiltradas = useMemo(() => {
    const texto = normalizarTexto(busqueda);

    if (!texto) return empresas;

    return empresas.filter((empresa) =>
      normalizarTexto(empresa.nombre).includes(texto)
    );
  }, [busqueda, empresas]);

  useEffect(() => {
    function cerrarSiClickFuera(event: MouseEvent) {
      if (
        contenedorRef.current &&
        !contenedorRef.current.contains(event.target as Node)
      ) {
        setAbierto(false);
      }
    }

    document.addEventListener("mousedown", cerrarSiClickFuera);

    return () => {
      document.removeEventListener("mousedown", cerrarSiClickFuera);
    };
  }, []);

  useEffect(() => {
    if (abierto) {
      setBusqueda("");
      setIndiceActivo(0);
      window.setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [abierto]);

  function seleccionarEmpresa(id: string) {
    onChange(id);
    setAbierto(false);
  }

  function manejarTeclado(
    event: KeyboardEvent<HTMLInputElement>
  ) {
    if (event.key === "Escape") {
      setAbierto(false);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setIndiceActivo((actual) =>
        Math.min(actual + 1, empresasFiltradas.length - 1)
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setIndiceActivo((actual) => Math.max(actual - 1, 0));
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const empresa = empresasFiltradas[indiceActivo];

      if (empresa) {
        seleccionarEmpresa(empresa.id);
      }
    }
  }

  return (
    <div
      ref={contenedorRef}
      className={`relative ${className}`}
    >
      <button
        type="button"
        onClick={() => setAbierto((actual) => !actual)}
        className="
          flex
          w-full
          items-center
          justify-between
          gap-3
          rounded-xl
          border
          border-slate-200
          bg-white
          px-4
          py-2.5
          text-left
          text-sm
          text-slate-800
          shadow-sm
          outline-none
          transition
          hover:bg-slate-50
          focus:border-blue-500
        "
      >
        <span className="truncate">
          {empresaSeleccionada?.nombre || placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-slate-400 transition ${
            abierto ? "rotate-180" : ""
          }`}
        />
      </button>

      {abierto && (
        <div
          className="
            absolute
            z-50
            mt-2
            w-full
            overflow-hidden
            rounded-2xl
            border
            border-slate-200
            bg-white
            shadow-xl
          "
        >
          <div className="flex items-center gap-2 border-b border-slate-200 px-3 py-2">
            <Search size={15} className="text-slate-400" />
            <input
              ref={inputRef}
              value={busqueda}
              onChange={(event) => {
                setBusqueda(event.target.value);
                setIndiceActivo(0);
              }}
              onKeyDown={manejarTeclado}
              placeholder="Buscar empresa..."
              className="w-full bg-transparent py-1.5 text-sm text-slate-800 outline-none placeholder:text-slate-400"
            />
          </div>

          <div className="max-h-64 overflow-y-auto py-1">
            {empresasFiltradas.length === 0 ? (
              <div className="px-4 py-4 text-center text-sm text-slate-500">
                {emptyLabel}
              </div>
            ) : (
              empresasFiltradas.map((empresa, index) => (
                <button
                  key={empresa.id}
                  type="button"
                  onMouseEnter={() => setIndiceActivo(index)}
                  onClick={() => seleccionarEmpresa(empresa.id)}
                  className={`
                    block
                    w-full
                    px-4
                    py-2.5
                    text-left
                    text-sm
                    transition
                    ${
                      index === indiceActivo
                        ? "bg-blue-50 text-[#0B4A92]"
                        : "text-slate-700 hover:bg-slate-50"
                    }
                  `}
                >
                  {empresa.nombre}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
