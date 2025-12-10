import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  FolderKanban, 
  UserCircle, 
  Bell, 
  Megaphone, 
  FileText,
  Calendar,
  Mail,
  Home,
  LogOut 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  userEmail?: string;
  pendingCount?: {
    vacation: number;
    holding: number;
    inquiry: number;
    mail: number;
  };
}

export const AdminSidebar = ({ 
  userEmail = "admin@example.com",
  pendingCount = { vacation: 0, holding: 0, inquiry: 0, mail: 0 }
}: AdminSidebarProps) => {
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
      path: "/admin",
      badge: null 
    },
    { 
      icon: FileText, 
      label: "상담관리", 
      path: "/admin/leads",
      badge: null 
    },
    { 
      icon: FolderKanban, 
      label: "프로젝트관리", 
      path: "/admin/projects",
      badge: null 
    },
    { 
      icon: Users, 
      label: "디자이너관리", 
      path: "/admin/designers",
      badge: null 
    },
    { 
      icon: Megaphone, 
      label: "공지사항", 
      path: "/admin/announcements",
      badge: null 
    },
    { 
      icon: Bell, 
      label: "알림", 
      path: "/admin/notifications",
      badge: null 
    },
    { 
      icon: Calendar, 
      label: "휴가요청", 
      path: "/admin/vacation-requests",
      badge: pendingCount.vacation > 0 ? `+${pendingCount.vacation}` : null 
    },
    { 
      icon: FileText, 
      label: "홀딩요청", 
      path: "/admin/holding-requests",
      badge: pendingCount.holding > 0 ? `+${pendingCount.holding}` : null 
    },
    { 
      icon: Mail, 
      label: "문의요청", 
      path: "/admin/inquiries",
      badge: pendingCount.inquiry > 0 ? `+${pendingCount.inquiry}` : null 
    },
    { 
      icon: Mail, 
      label: "메일 발송", 
      path: "/admin/mail",
      badge: pendingCount.mail > 0 ? `+${pendingCount.mail}` : null 
    },
    { 
      icon: UserCircle, 
      label: "계정", 
      path: "/admin/account",
      badge: null 
    },
  ];

  const isActive = (path: string) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-200 flex flex-col sticky top-0">
      {/* Logo Section */}
      <div className="p-6">
        <Link to="/admin" className="flex items-center">
          <h1 className="text-2xl font-bold text-gray-900">ROS</h1>
        </Link>
      </div>

      <Separator className="bg-gray-200" />

      {/* User Info Section */}
      <div className="p-4">
        <div className="text-sm text-gray-600">
          <p className="mb-1">이메일: {userEmail}</p>
        </div>
      </div>

      <Separator className="bg-gray-200" />

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
                "hover:bg-gray-100",
                active 
                  ? "bg-gray-900 text-white hover:bg-gray-800" 
                  : "text-gray-700 hover:text-gray-900"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={cn(
                  "text-xs font-semibold",
                  active ? "text-white" : "text-blue-600"
                )}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <Separator className="bg-gray-200" />

      {/* Bottom Actions */}
      <div className="p-4 space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-700 hover:text-gray-900 hover:bg-gray-100"
          asChild
        >
          <Link to="/">
            <Home className="h-4 w-4 mr-3" />
            메인으로 돌아가기
          </Link>
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-700 hover:text-gray-900 hover:bg-gray-100"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-3" />
          로그아웃
        </Button>
      </div>
    </aside>
  );
};
