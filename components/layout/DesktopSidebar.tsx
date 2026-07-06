"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { menuItems, adminMenuItems } from "./menuItems";

type Props = {
  esAdmin: boolean;
};

export default function DesktopSidebar({
  esAdmin,
}: Props) {

  const pathname = usePathname();

  function Item({
    title,
    href,
    Icon,
  }: {
    title: string;
    href: string;
    Icon: any;
  }) {

    const activo =
      pathname === href;

    return (

      <Link
        href={href}
        className={`
          flex
          items-center
          gap-2.5
          px-3
          py-2.5
          rounded-xl
          transition-all
          duration-200

          ${
           activo
  ? `
      bg-white
      text-[#0B4A92]
      shadow-lg
      shadow-black/10
    `
  : `
      text-blue-100
      hover:bg-white/10
      hover:text-white
    `
          }
        `}
      >

        <Icon size={17} strokeWidth={2.2} />

        <span className="text-[13px] font-medium tracking-wide">

          {title}

        </span>

      </Link>

    );

  }

  return (

    <nav
      className="
        flex
        flex-col
        gap-1.5
        px-3
py-4
      "
    >

      {menuItems.map((item) => (

        <Item
          key={item.href}
          title={item.title}
          href={item.href}
          Icon={item.icon}
        />

      ))}

      {esAdmin &&
        adminMenuItems.map((item) => (

          <Item
            key={item.href}
            title={item.title}
            href={item.href}
            Icon={item.icon}
          />

        ))}

    </nav>

  );

}
