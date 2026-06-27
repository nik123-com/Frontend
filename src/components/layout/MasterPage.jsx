import React from "react"
import UserHeader from "./UserHeader";
import { Outlet } from "react-router-dom";
import UserFooter from "./UserFooter";

const MasterPage = () => {
  return (
    <>
      <UserHeader />
      <Outlet />
      <UserFooter />
    </>
  );
};

export default MasterPage;
// Master-Slave Concept
// 1 MAster File + All inside UserPage is slave