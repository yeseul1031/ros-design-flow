import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  CalendarDays, 
  Megaphone, 
  Bell, 
  FolderKanban, 
  UserCircle, 
  Home,
  LogOut 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface DashboardSidebarProps {
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

export const DashboardSidebar = ({ 
  profile, 
  annualLeave = { used: 12, total: 15 },
  joinDate,
  notificationCount = 0,
  projectCount = 0
}: DashboardSidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "로그아웃 실패",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "로그아웃 완료",
        description: "안전하게 로그아웃되었습니다.",
      });
      navigate("/");
    }
  };

  const menuItems = [
    { 
      icon: LayoutDashboard, 
      label: "대시보드", 
      path: "/dashboard",
      badge: null 
    },
    { 
      icon: CalendarDays, 
      label: "휴가 관리", 
      path: "/dashboard/vacation",
      badge: null 
    },
    { 
      icon: Megaphone, 
      label: "공지사항", 
      path: "/dashboard/announcements",
      badge: notificationCount > 0 ? `+${notificationCount}` : null 
    },
    { 
      icon: FolderKanban, 
      label: "프로젝트", 
      path: "/dashboard/projects",
      badge: projectCount > 0 ? `+${projectCount}` : null 
    },
    { 
      icon: Bell, 
      label: "알림", 
      path: "/dashboard/notifications",
      badge: null 
    },
    { 
      icon: UserCircle, 
      label: "계정", 
      path: "/dashboard/account",
      badge: null 
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col sticky top-0">
      {/* User Profile Section */}
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback className="bg-accent text-accent-foreground">
              {profile?.name?.[0] || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-sidebar-foreground truncate">
              {profile?.name || "사용자"}님
            </p>
            <p className="text-xs text-sidebar-foreground/60">
              연차 {annualLeave.used}/{annualLeave.total}
            </p>
          </div>
        </div>
        {joinDate && (
          <p className="text-xs text-sidebar-foreground/60">
            입사일 {new Date(joinDate).toLocaleDateString('ko-KR', { 
              year: 'numeric', 
              month: '2-digit', 
              day: '2-digit' 
            })}
          </p>
        )}
      </div>

      <Separator className="bg-sidebar-border" />

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                "hover:bg-[#F7F7FB]/45",
                active 
                  ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                  : "text-sidebar-foreground/80 hover:text-sidebar-foreground"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-xs font-semibold text-accent">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <Separator className="bg-sidebar-border" />

      {/* Bottom Actions */}
      <div className="p-4 space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-[#F7F7FB]/45"
          asChild
        >
          <Link to="/">
            <Home className="h-4 w-4 mr-3" />
            메인으로 돌아가기
          </Link>
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-[#F7F7FB]/45"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-3" />
          로그아웃
        </Button>
      </div>
    </aside>
  );
};
