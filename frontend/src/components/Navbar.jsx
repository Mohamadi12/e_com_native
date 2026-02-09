import { UserButton } from "@clerk/clerk-react";
import { useLocation } from "react-router";

import {
  ClipboardListIcon,
  HomeIcon,
  PanelLeftIcon,
  ShoppingBagIcon,
  UsersIcon,
} from "lucide-react";

// MENU DE NAVIGATION
// eslint-disable-next-line
export const NAVIGATION = [
  {
    name: "Tableau de bord",
    path: "/dashboard",
    icon: <HomeIcon className="size-5" />,
  },
  {
    name: "Produits",
    path: "/products",
    icon: <ShoppingBagIcon className="size-5" />,
  },
  {
    name: "Commandes",
    path: "/orders",
    icon: <ClipboardListIcon className="size-5" />,
  },
  {
    name: "Clients",
    path: "/customers",
    icon: <UsersIcon className="size-5" />,
  },
];

const Navbar = () => {
  const location = useLocation();

  return (
    <div className="navbar w-full bg-base-300">
      {/* Bouton Menu */}
      <label
        htmlFor="my-drawer"
        className="btn btn-square btn-ghost"
        aria-label="open sidebar"
      >
        <PanelLeftIcon className="size-5" />
      </label>

      {/* TITRE PAGE */}
      <div className="flex-1 px-4">
        <h1 className="text-xl font-bold">
          {NAVIGATION.find((item) => item.path === location.pathname)?.name ||
            "Dashboard"}
        </h1>
      </div>

      {/* PROFIL UTILISATEUR */}
      <div className="mr-5">
        <UserButton />
      </div>
    </div>
  );
};

export default Navbar;
