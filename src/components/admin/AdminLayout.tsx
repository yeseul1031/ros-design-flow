import { ReactNode } from "react";
import { AdminSidebar } from "./AdminSidebar";

interface AdminLayoutProps {
  children: ReactNode;
  userEmail?: string;
  pendingCount?: {
    vacation: number;
    holding: number;
    inquiry: number;
    mail: number;
  };
}

export const AdminLayout = ({ 
  children, 
  userEmail,
  pendingCount
}: AdminLayoutProps) => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar 
        userEmail={userEmail}
        pendingCount={pendingCount}
      />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};
