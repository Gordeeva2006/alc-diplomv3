// src/app/config.ts
import { FaBox, FaListUl, FaUser } from 'react-icons/fa';

export const HEADER_LINKS = {
  home: "/",
  cart: "/cart",
  logout: "/auth/logout",
  menuItems: [
    { icon: "FaUser", text: "Профиль", href: "/profile" },
    { icon: "FaBox", text: "Продукция", href: "/products" },
    { icon: "FaListUl", text: "Заявки", href: "/orders" }
  ]
};