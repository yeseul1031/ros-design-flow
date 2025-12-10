import { ReactNode } from "react";
import { DashboardSidebar } from "./DashboardSidebar";

interface DashboardLayoutProps {
  children: ReactNode;
  profile?: {
    name?: string;
    company?: string;
    avatar_url?: string;
  };
  annualLeave?: {
    used: number;
    total: number;
  };
  joinDate?: string;
  notificationCount?: number;
  projectCount?: number;
}

export const DashboardLayout = ({ 
  children, 
  profile,
  annualLeave,
  joinDate,
  notificationCount,
  projectCount
}: DashboardLayoutProps) => {
  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar 
        profile={profile}
        annualLeave={annualLeave}
        joinDate={joinDate}
        notificationCount={notificationCount}
        projectCount={projectCount}
      />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};
