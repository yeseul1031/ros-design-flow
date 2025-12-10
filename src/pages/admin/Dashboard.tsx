import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronRight, Bell } from "lucide-react";
import { DesignerDashboard } from "@/components/admin/DesignerDashboard";
import { UserRoleManagement } from "@/components/admin/UserRoleManagement";
import { PaymentRequestManager } from "@/components/admin/PaymentRequestManager";
import { CustomerManagement } from "@/components/admin/CustomerManagement";
import AdminLeads from "@/pages/admin/Leads";
import AdminProjects from "@/pages/admin/Projects";
import AdminDesigners from "@/pages/admin/Designers";
import { AnnouncementManager } from "@/components/admin/AnnouncementManager";
import { EmailTemplateManager } from "@/components/admin/EmailTemplateManager";
import { NotificationDetail } from "@/components/admin/NotificationDetail";
import { toast } from "@/hooks/use-toast";
import logo from "@/assets/logo.jpeg";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<'admin' | 'manager' | 'designer' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalLeads: 0,
    activeProjects: 0,
    totalRevenue: 0,
    pendingPayments: 0,
  });
  const [tab, setTab] = useState<string>('overview');
  const [notificationTab, setNotificationTab] = useState<string>('newLeads');
  const [notifications, setNotifications] = useState({
    newLeads: 0,
    inquiries: 0,
    holdingRequests: 0,
    vacationRequests: 0,
  });

  useEffect(() => {
    checkAdminAccess();
    loadStats();
    loadNotifications();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/auth");
      return;
    }

    const [isAdmin, isManager, isDesigner] = await Promise.all([
      supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' }),
      supabase.rpc('has_role', { _user_id: user.id, _role: 'manager' }),
      supabase.rpc('has_role', { _user_id: user.id, _role: 'designer' }),
    ]);

    if (!(isAdmin.data || isManager.data || isDesigner.data)) {
      navigate("/dashboard");
      return;
    }

    if (isAdmin.data === true) {
      setUserRole('admin');
    } else if (isManager.data === true) {
      setUserRole('manager');
    } else if (isDesigner.data === true) {
      setUserRole('designer');
    }

    setIsLoading(false);
  };

  const loadStats = async () => {
    try {
      const [leadsCount, matchingCount, projectsCount, pendingPaymentRequestsCount] = await Promise.all([
        supabase.from("leads").select("*", { count: "exact", head: true }),
        supabase.from("matching_requests").select("*", { count: "exact", head: true }),
        supabase.from("projects").select("*", { count: "exact", head: true }).in("status", ["active", "paused"]),
        supabase.from("payment_requests").select("*", { count: "exact", head: true }).is("sent_at", null),
      ]);

      const monthlyRevenue = 18000000;

      setStats({
        totalLeads: (leadsCount.count || 0) + (matchingCount.count || 0),
        activeProjects: projectsCount.count || 0,
        totalRevenue: monthlyRevenue,
        pendingPayments: pendingPaymentRequestsCount.count || 0,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const loadNotifications = async () => {
    try {
      const [newLeadsCount, matchingRequestsCount, holdingRequestsCount, vacationRequestsCount] = await Promise.all([
        supabase.from("leads").select("*", { count: "exact", head: true }).eq("status", "new"),
        supabase.from("matching_requests").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("project_pause_requests").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("vacation_requests").select("*", { count: "exact", head: true }).eq("status", "pending"),
      ]);

      setNotifications({
        newLeads: newLeadsCount.count || 0,
        inquiries: matchingRequestsCount.count || 0,
        holdingRequests: holdingRequestsCount.count || 0,
        vacationRequests: vacationRequestsCount.count || 0,
      });
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  };

  const handleSendExpiringNotifications = async () => {
    try {
      toast({
        title: "이메일 발송 중...",
        description: "만료 예정 고객에게 알림을 발송하고 있습니다.",
      });

      const { data, error } = await supabase.functions.invoke('send-expiring-notifications');
      
      if (error) throw error;
      
      toast({
        title: "발송 완료",
        description: data.message || `총 ${data.sentCount}건의 이메일이 발송되었습니다.`,
      });
    } catch (error) {
      toast({
        title: "발송 실패",
        description: error instanceof Error ? error.message : "이메일 발송 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleNotificationClick = (type: string) => {
    setNotificationTab(type);
    setTab('notifications');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-pulse text-lg">로딩 중...</div>
      </div>
    );
  }

  if (!userRole) {
    return null;
  }

  if (userRole === 'designer') {
    return <DesignerDashboard />;
  }

  const currentMonth = new Date().getMonth() + 1;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/">
            <img src={logo} alt="R*S" className="h-16 object-contain" />
          </Link>
          <button className="p-2 hover:bg-muted rounded-full transition-colors">
            <Bell className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={tab} onValueChange={setTab} className="space-y-6">
          <TabsList className="bg-transparent rounded-none w-full justify-start gap-1 p-0 h-auto">
            <TabsTrigger 
              value="overview" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 text-muted-foreground data-[state=active]:text-primary font-medium"
            >
              대시보드
            </TabsTrigger>
            <TabsTrigger 
              value="announcements"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 text-muted-foreground data-[state=active]:text-primary font-medium"
            >
              공지사항
            </TabsTrigger>
            <TabsTrigger 
              value="designers"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 text-muted-foreground data-[state=active]:text-primary font-medium"
            >
              디자이너
            </TabsTrigger>
            <TabsTrigger 
              value="leads"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 text-muted-foreground data-[state=active]:text-primary font-medium"
            >
              상담관리
            </TabsTrigger>
            <TabsTrigger 
              value="payments"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 text-muted-foreground data-[state=active]:text-primary font-medium"
            >
              결제관리
            </TabsTrigger>
            <TabsTrigger 
              value="customers"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 text-muted-foreground data-[state=active]:text-primary font-medium"
            >
              고객관리
            </TabsTrigger>
            <TabsTrigger 
              value="projects"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 text-muted-foreground data-[state=active]:text-primary font-medium"
            >
              프로젝트
            </TabsTrigger>
            <TabsTrigger 
              value="emails"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 text-muted-foreground data-[state=active]:text-primary font-medium"
            >
              이메일
            </TabsTrigger>
            <TabsTrigger 
              value="roles"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 text-muted-foreground data-[state=active]:text-primary font-medium"
            >
              권한
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card 
                onClick={() => setTab('leads')} 
                className="cursor-pointer hover:shadow-md transition-shadow bg-card border-0 shadow-sm"
              >
                <CardContent className="p-5">
                  <p className="text-sm text-muted-foreground mb-2">{currentMonth}월 전체 상담</p>
                  <p className="text-2xl font-semibold">{stats.totalLeads}</p>
                </CardContent>
              </Card>

              <Card 
                onClick={() => setTab('projects')} 
                className="cursor-pointer hover:shadow-md transition-shadow bg-card border-0 shadow-sm"
              >
                <CardContent className="p-5">
                  <p className="text-sm text-muted-foreground mb-2">진행 중인 프로젝트</p>
                  <p className="text-2xl font-semibold">{stats.activeProjects}</p>
                </CardContent>
              </Card>

              <Card 
                onClick={() => setTab('payments')} 
                className="cursor-pointer hover:shadow-md transition-shadow bg-card border-0 shadow-sm"
              >
                <CardContent className="p-5">
                  <p className="text-sm text-muted-foreground mb-2">결제 대기</p>
                  <p className="text-2xl font-semibold">{stats.pendingPayments}</p>
                </CardContent>
              </Card>

              <Card 
                onClick={() => setTab('payments')} 
                className="cursor-pointer hover:shadow-md transition-shadow bg-card border-0 shadow-sm"
              >
                <CardContent className="p-5">
                  <p className="text-sm text-muted-foreground mb-2">총 매출 (₩)</p>
                  <p className="text-2xl font-semibold">{stats.totalRevenue.toLocaleString()}</p>
                </CardContent>
              </Card>
            </div>

            {/* Notifications Card */}
            <Card className="bg-card border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">알림</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <button 
                  onClick={() => handleNotificationClick('newLeads')}
                  className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-muted/50 transition-colors"
                >
                  <span className="text-sm">
                    신규상담 
                    {notifications.newLeads > 0 && (
                      <span className="text-primary ml-1">+{notifications.newLeads}</span>
                    )}
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
                <button 
                  onClick={() => handleNotificationClick('inquiries')}
                  className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-muted/50 transition-colors"
                >
                  <span className="text-sm">
                    문의요청 
                    {notifications.inquiries > 0 && (
                      <span className="text-primary ml-1">+{notifications.inquiries}</span>
                    )}
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
                <button 
                  onClick={() => handleNotificationClick('holdingRequests')}
                  className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-muted/50 transition-colors"
                >
                  <span className="text-sm">
                    홀딩요청 
                    {notifications.holdingRequests > 0 && (
                      <span className="text-primary ml-1">+{notifications.holdingRequests}</span>
                    )}
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
                <button 
                  onClick={() => handleNotificationClick('vacationRequests')}
                  className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-muted/50 transition-colors"
                >
                  <span className="text-sm">
                    휴가요청 
                    {notifications.vacationRequests > 0 ? (
                      <span className="text-primary ml-1">+{notifications.vacationRequests}</span>
                    ) : (
                      <span className="text-muted-foreground ml-1">+0</span>
                    )}
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              </CardContent>
            </Card>

            {/* Expiring Customers Card */}
            <Card className="bg-card border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">만료 예정 고객 알림</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <button 
                  onClick={() => setTab('emails')}
                  className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-muted/50 transition-colors"
                >
                  <span className="text-sm text-muted-foreground">
                    계약 만료 예정(7일 이내) 고객에게 재계약 안내와 만족도 조사 링크를 이메일로 발송합니다.
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 ml-4" />
                </button>
              </CardContent>
            </Card>

            {/* Account Card */}
            <Card className="bg-card border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">계정</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Link 
                  to="/"
                  className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-muted/50 transition-colors"
                >
                  <span className="text-sm font-medium">메인으로 돌아가기</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-muted/50 transition-colors"
                >
                  <span className="text-sm font-medium">로그아웃</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="mt-6">
            <NotificationDetail 
              activeTab={notificationTab} 
              onTabChange={setNotificationTab} 
            />
          </TabsContent>

          <TabsContent value="announcements">
            <AnnouncementManager />
          </TabsContent>

          <TabsContent value="designers">
            <AdminDesigners />
          </TabsContent>

          <TabsContent value="leads">
            <AdminLeads />
          </TabsContent>

          <TabsContent value="payments">
            <PaymentRequestManager />
          </TabsContent>

          <TabsContent value="customers">
            <CustomerManagement />
          </TabsContent>

          <TabsContent value="projects">
            <AdminProjects />
          </TabsContent>

          <TabsContent value="emails">
            <EmailTemplateManager />
          </TabsContent>

          <TabsContent value="roles">
            <UserRoleManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
