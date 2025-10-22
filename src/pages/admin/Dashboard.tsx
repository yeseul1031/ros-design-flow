import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, FileText, DollarSign, Briefcase } from "lucide-react";
import { DesignerDashboard } from "@/components/admin/DesignerDashboard";
import { UserRoleManagement } from "@/components/admin/UserRoleManagement";
import { PaymentRequestManager } from "@/components/admin/PaymentRequestManager";
import { CustomerManagement } from "@/components/admin/CustomerManagement";
import AdminLeads from "@/pages/admin/Leads";
import AdminProjects from "@/pages/admin/Projects";
import AdminDesigners from "@/pages/admin/Designers";

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

  useEffect(() => {
    checkAdminAccess();
    loadStats();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/auth");
      return;
    }

    // Use RPC to check roles without being blocked by RLS
    const [isAdmin, isManager, isDesigner] = await Promise.all([
      supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' }),
      supabase.rpc('has_role', { _user_id: user.id, _role: 'manager' }),
      supabase.rpc('has_role', { _user_id: user.id, _role: 'designer' }),
    ]);

    if (!(isAdmin.data || isManager.data || isDesigner.data)) {
      navigate("/dashboard");
      return;
    }

    // Priority: admin > manager > designer
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
      const [leadsCount, projectsCount] = await Promise.all([
        supabase.from("leads").select("*", { count: "exact", head: true }),
        supabase.from("projects").select("*", { count: "exact", head: true }).eq("status", "active"),
      ]);

      setStats({
        totalLeads: leadsCount.count || 0,
        activeProjects: projectsCount.count || 0,
        totalRevenue: 0,
        pendingPayments: 0,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">로딩 중...</div>
      </div>
    );
  }

  if (!userRole) {
    return null;
  }

  // Show designer dashboard for designers
  if (userRole === 'designer') {
    return <DesignerDashboard />;
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">관리자 대시보드</h1>
          <Button variant="outline" onClick={handleLogout}>
            로그아웃
          </Button>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">대시보드</TabsTrigger>
            <TabsTrigger value="roles">디자이너 관리</TabsTrigger>
            <TabsTrigger value="leads">상담관리</TabsTrigger>
            <TabsTrigger value="payments">결제관리</TabsTrigger>
            <TabsTrigger value="customers">고객관리</TabsTrigger>
            <TabsTrigger value="projects">프로젝트</TabsTrigger>
            <TabsTrigger value="designers">디자이너</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">전체 상담</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalLeads}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">진행 중인 프로젝트</CardTitle>
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeProjects}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">총 매출</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₩{stats.totalRevenue.toLocaleString()}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">대기 중인 결제</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pendingPayments}</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>최근 활동</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">최근 활동이 여기에 표시됩니다.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roles">
            <UserRoleManagement />
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

          <TabsContent value="designers">
            <AdminDesigners />
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
