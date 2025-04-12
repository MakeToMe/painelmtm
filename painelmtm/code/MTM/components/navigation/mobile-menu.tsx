"use client";

import { NavLink } from "./nav-link";
import { buttonVariants } from "../ui/button-styles";

interface MobileMenuProps {
  isOpen: boolean;
}

export function MobileMenu({ isOpen }: MobileMenuProps) {
  if (!isOpen) return null;

  return (
    <div className="lg:hidden">
      <div className="px-2 pt-2 pb-3 space-y-1 bg-zinc-900/90 backdrop-blur-sm border-b border-zinc-800">
        <NavLink href="#servicos" mobile>SERVIÇOS</NavLink>
        <NavLink href="#vantagens" mobile>VANTAGENS</NavLink>
        <NavLink href="#hardware" mobile>HARDWARE</NavLink>
        <NavLink href="#backend" mobile>BACKEND NO CODE</NavLink>
        <NavLink href="#planos" mobile>PLANOS</NavLink>
        <NavLink href="#bonus" mobile>API WHATSAPP</NavLink>
        <NavLink href="#duvidas" mobile>DÚVIDAS</NavLink>
        <button className={`w-full text-left ${buttonVariants.nav}`}>
          INICIAR
        </button>
      </div>
    </div>
  );
}