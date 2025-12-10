import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, DollarSign, Briefcase, Calendar, Mail } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { DesignerDashboard } from "@/components/admin/DesignerDashboard";

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
  const [userEmail, setUserEmail] = useState<string>("");
  const [pendingCount, setPendingCount] = useState({
    vacation: 0,
    holding: 0,
    inquiry: 0,
    mail: 0,
  });

  useEffect(() => {
    checkAdminAccess();
    loadStats();
    loadPendingCounts();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/auth");
      return;
    }

    setUserEmail(user.email || "");

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
      const [leadsCount, matchingCount, projectsCount, pendingPaymentRequestsCount] = await Promise.all([
        supabase.from("leads").select("*", { count: "exact", head: true }),
        supabase.from("matching_requests").select("*", { count: "exact", head: true }),
        supabase.from("projects").select("*", { count: "exact", head: true }).in("status", ["active", "paused"]),
        supabase.from("payment_requests").select("*", { count: "exact", head: true }).is("sent_at", null),
      ]);

      // 임시 데이터: 현재 월 매출 18,000,000원
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

  const loadPendingCounts = async () => {
    try {
      // Mock data for pending requests
      setPendingCount({
        vacation: 3,
        holding: 2,
        inquiry: 1,
        mail: 0,
      });
    } catch (error) {
      console.error("Error loading pending counts:", error);
    }
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
    <AdminLayout userEmail={userEmail} pendingCount={pendingCount}>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">관리자 대시보드</h1>
          <p className="text-gray-600 mt-2">시스템 전체 현황을 확인하세요</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Link to="/admin/leads">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">가입 인원 수</CardTitle>
                <Users className="h-5 w-5 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{stats.totalLeads}</div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/projects">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">수주 중인 프로젝트</CardTitle>
                <Briefcase className="h-5 w-5 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{stats.activeProjects}</div>
              </CardContent>
            </Card>
          </Link>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">결제 승인</CardTitle>
              <FileText className="h-5 w-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.pendingPayments}</div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">이 달의 매출 (원)</CardTitle>
              <DollarSign className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.totalRevenue.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                휴가요청
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">대기 중인 휴가 요청을 확인하세요</p>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/admin/vacation-requests">
                  {pendingCount.vacation > 0 && (
                    <span className="mr-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                      +{pendingCount.vacation}
                    </span>
                  )}
                  휴가요청 관리
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-600" />
                홀딩요청
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">프로젝트 홀딩 요청을 처리하세요</p>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/admin/holding-requests">
                  {pendingCount.holding > 0 && (
                    <span className="mr-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                      +{pendingCount.holding}
                    </span>
                  )}
                  홀딩요청 관리
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-purple-600" />
                문의요청
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">고객 문의사항을 확인하세요</p>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/admin/inquiries">
                  {pendingCount.inquiry > 0 && (
                    <span className="mr-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                      +{pendingCount.inquiry}
                    </span>
                  )}
                  문의요청 관리
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
