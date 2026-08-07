import React from "react"
import UserHeader from "./UserHeader";
import { Outlet } from "react-router-dom";
import UserFooter from "./UserFooter";
import RewardNotifier from "./RewardNotifier";

const MasterPage = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <RewardNotifier />
      <UserHeader />
      <main className="flex-grow-1 page-content-offset">
        <Outlet />
      </main>
      <UserFooter />
    </div>
  );
};

export default MasterPage;
// Master-Slave Concept
// 1 MAster File + All inside UserPage is slave