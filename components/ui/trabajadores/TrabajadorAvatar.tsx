import { supabase } from "@/lib/supabase";

type TrabajadorAvatarProps = {
  nombre?: string | null;
  fotoUrl?: string | null;
  size?: "sm" | "lg";
};

export default function TrabajadorAvatar({
  nombre,
  fotoUrl,
  size = "sm",
}: TrabajadorAvatarProps) {
  const publicUrl =
    fotoUrl
      ? supabase.storage
          .from("trabajadores")
          .getPublicUrl(fotoUrl).data.publicUrl
      : null;

  const inicial =
    nombre?.trim().charAt(0).toUpperCase() || "T";

  const sizeClass =
    size === "lg"
      ? "h-24 w-24 text-4xl"
      : "h-10 w-10 text-sm";

  return (
    <div
      className={`
        ${sizeClass}
        flex
        items-center
        justify-center
        overflow-hidden
        rounded-full
        border
        border-blue-100
        bg-blue-50
        font-black
        text-[#0B4A92]
      `}
    >
      {publicUrl ? (
        <img
          src={publicUrl}
          alt={nombre || "Trabajador"}
          className="h-full w-full object-cover"
        />
      ) : (
        inicial
      )}
    </div>
  );
}
