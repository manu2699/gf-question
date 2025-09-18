import { NavLink } from "react-router-dom";

import styles from "./style.module.css";

export const LeftNav = ({ navList }: { navList: LeftNavItem[] }) => (
  <nav className={styles.leftNav}>
    {navList.map((nav) => (
      <NavLink
        to={nav.path}
        key={nav.label}
        className={({ isActive }) =>
          `${styles.leftNavItem} ${isActive ? styles.active : ""}`
        }
      >
        {nav.icon ? nav.icon : null}
        {nav.label}
      </NavLink>
    ))}
  </nav>
);

export interface LeftNavItem {
  path: string;
  label: string;
  icon?: React.ReactNode;
}
