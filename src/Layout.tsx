import { Outlet } from "react-router-dom";

import { TopNav, LeftNav, type LeftNavItem } from "./components/Navigation";

// Global Layout for the dashboard
export const GlobalLayout = ({ navList }: { navList: LeftNavItem[] }) => (
  <div className="rootLayout">
    <aside className="leftNavWrapper">
      <LeftNav navList={navList} />
    </aside>
    <div className="wrapper">
      <div className="topNavWrapper">
        <TopNav />
      </div>
      <div className="contentWrapper">
        {/* To Render Child Routes */}
        <Outlet />
      </div>
    </div>
  </div>
);
