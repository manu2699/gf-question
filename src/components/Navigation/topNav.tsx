import { CircleUserRound } from "lucide-react";

import styles from "./style.module.css";

export const TopNav = () => {
  return (
    <nav className={styles.topNav}>
      <p>Growfin</p>
      <CircleUserRound />
    </nav>
  );
};
