"use client";

import Link from "next/link";
import { X } from "lucide-react";

import {
  adminMenuItems,
  menuItems,
  trabajadorMenuItems,
} from "./menuItems";

type Props = {
  abierto: boolean;
  cerrar: () => void;
  esAdmin: boolean;
  rol?: string | null;
};

export default function MobileSidebar({
  abierto,
  cerrar,
  esAdmin,
  rol,
}: Props) {

  if (!abierto) return null;

  const items =
    rol === "trabajador"
      ? trabajadorMenuItems
      : [
          ...menuItems,
          ...(esAdmin ? adminMenuItems : []),
        ];

  return (

    <div
      className="
        fixed
        inset-0
        z-50
        bg-slate-900/40
        md:hidden
      "
      onClick={cerrar}
    >

      <div
        className="
          w-72
          max-w-[85vw]
          h-full
          bg-[#0B4A92]
          shadow-xl
          overflow-y-auto
        "
        onClick={(event) => event.stopPropagation()}
      >

        <div className="
          p-5
          border-b
          border-white/20
          flex
          items-center
          justify-between
        ">

<img
  src="/logo.png"
  alt="SEITON"
  className="
    w-56
    h-auto
    object-contain
  "
/>

          <button
            type="button"
            onClick={cerrar}
            className="
              rounded-xl
              p-2
              text-white
              hover:bg-white/10
              transition
            "
            aria-label="Cerrar menú"
          >
            <X size={20} />
          </button>

        </div>

        <nav className="
          flex
          flex-col
          gap-2
          p-4
        ">
          {items.map(
            (item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={cerrar}
                  className="
                    flex
                    items-center
                    gap-3
                    rounded-xl
                    px-4
                    py-3
                    text-sm
                    font-medium
                    text-blue-50
                    hover:bg-white/10
                    transition
                  "
                >
                  <Icon size={18} />
                  {item.title}
                </Link>
              );
            }
          )}
        </nav>

      </div>

    </div>

  );

}
