import { Outlet } from "react-router-dom"
import AdminHeader from "./AdminHeader"

export default function AdminMaster(){
  return(
    <div className="d-flex flex-column min-vh-100">
        <AdminHeader/>
        <main className="flex-grow-1 page-content-offset">
          <Outlet/>
        </main>
    </div>
  )
}