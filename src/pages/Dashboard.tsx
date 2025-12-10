import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@supabase/supabase-js";
import { ChevronRight } from "lucide-react";
import { SupportTickets } from "@/components/dashboard/SupportTickets";
import { ProfileEdit } from "@/components/dashboard/ProfileEdit";
import { PaymentInfo } from "@/components/dashboard/PaymentInfo";

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showProfileEdit, setShowProfileEdit] = useState(false);

  const activeTab = searchParams.get("tab") || "dashboard";

  const setActiveTab = (tab: string) => {
    setSearchParams({ tab });
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      } else {
        loadProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadProfile = async (userId: string) => {
    try {
      const [isAdmin, isManager, isDesigner] = await Promise.all([
        supabase.rpc('has_role', { _user_id: userId, _role: 'admin' }),
        supabase.rpc('has_role', { _user_id: userId, _role: 'manager' }),
        supabase.rpc('has_role', { _user_id: userId, _role: 'designer' }),
      ]);

      if (isAdmin.data === true || isManager.data === true || isDesigner.data === true) {
        navigate('/admin');
        return;
      }
      
      const [profileResult, projectsResult, notificationsResult, supportTicketsResult, paymentsResult] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).single(),
        supabase.from("projects").select("*, designers(name)").eq("user_id", userId),
        supabase.from("notifications").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
        supabase.from("support_tickets").select("*").eq("user_id", userId),
        supabase.from("payments").select("*").eq("user_id", userId).eq("status", "pending"),
      ]);

      if (profileResult.error) throw profileResult.error;
      setProfile(profileResult.data);
      setProjects(projectsResult.data || []);
      setNotifications(notificationsResult.data || []);
      setSupportTickets(supportTicketsResult.data || []);
      setPendingPayments(paymentsResult.data || []);
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  // Count notifications
  const answeredTickets = supportTickets.filter(t => t.response).length;
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const pendingPaymentCount = pendingPayments.length;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Header />
      <main className="flex-1 pt-20">
        <div className="container max-w-5xl mx-auto px-4 py-8">
          {/* Tab Navigation */}
          <div className="flex gap-6 mb-8 border-b border-border">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`pb-3 text-sm font-medium transition-colors relative ${
                activeTab === "dashboard" 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              대시보드
              {activeTab === "dashboard" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("inquiries")}
              className={`pb-3 text-sm font-medium transition-colors relative ${
                activeTab === "inquiries" 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              문의사항
              {activeTab === "inquiries" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("payments")}
              className={`pb-3 text-sm font-medium transition-colors relative ${
                activeTab === "payments" 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              결제정보
              {activeTab === "payments" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          </div>

          {activeTab === "dashboard" && (
            <>
              {/* Profile and Notifications Grid */}
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                {/* Profile Card */}
                <Card className="bg-card">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold mb-1">
                      {profile?.name}님
                    </h2>
                    <p className="text-sm text-muted-foreground mb-1">
                      {profile?.company || "-"}
                    </p>
                    <p className="text-sm text-muted-foreground mb-6">
                      가입일 {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\. /g, '. ') : "-"}
                    </p>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setShowProfileEdit(true)}
                    >
                      프로필 수정
                    </Button>
                  </CardContent>
                </Card>

                {/* Notifications Card */}
                <Card className="bg-card">
                  <CardContent className="p-6">
                    <h3 className="font-bold mb-4">알림</h3>
                    <div className="space-y-3">
                      <button 
                        onClick={() => setActiveTab("inquiries")}
                        className="w-full flex items-center justify-between py-2 hover:bg-muted/50 rounded-lg px-2 -mx-2 transition-colors"
                      >
                        <span className="text-sm">
                          문의답변 
                          {answeredTickets > 0 && (
                            <span className="text-primary ml-1">+{answeredTickets}</span>
                          )}
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </button>
                      <button 
                        onClick={() => setActiveTab("dashboard")}
                        className="w-full flex items-center justify-between py-2 hover:bg-muted/50 rounded-lg px-2 -mx-2 transition-colors"
                      >
                        <span className="text-sm">
                          프로젝트 
                          {activeProjects > 0 && (
                            <span className="text-primary ml-1">+{activeProjects}</span>
                          )}
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </button>
                      <button 
                        onClick={() => setActiveTab("payments")}
                        className="w-full flex items-center justify-between py-2 hover:bg-muted/50 rounded-lg px-2 -mx-2 transition-colors"
                      >
                        <span className="text-sm">
                          결제요청 
                          {pendingPaymentCount > 0 && (
                            <span className="text-primary ml-1">+{pendingPaymentCount}</span>
                          )}
                          {pendingPaymentCount === 0 && (
                            <span className="text-muted-foreground ml-1">+0</span>
                          )}
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Projects Card */}
              <Card className="bg-card mb-4">
                <CardContent className="p-6">
                  <h3 className="font-bold mb-4">프로젝트</h3>
                  <button 
                    className="w-full flex items-center justify-between py-2 hover:bg-muted/50 rounded-lg px-2 -mx-2 transition-colors"
                  >
                    <span className="text-sm">진행 중 {activeProjects}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                </CardContent>
              </Card>

              {/* Account Card */}
              <Card className="bg-card">
                <CardContent className="p-6">
                  <h3 className="font-bold mb-4">계정</h3>
                  <div className="space-y-1">
                    <button 
                      onClick={() => navigate("/")}
                      className="w-full flex items-center justify-between py-2 hover:bg-muted/50 rounded-lg px-2 -mx-2 transition-colors"
                    >
                      <span className="text-sm">메인으로 돌아가기</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center justify-between py-2 hover:bg-muted/50 rounded-lg px-2 -mx-2 transition-colors"
                    >
                      <span className="text-sm">로그아웃</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                </CardContent>
              </Card>

              {/* Profile Edit Modal */}
              {showProfileEdit && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-card rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold">프로필 수정</h2>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setShowProfileEdit(false)}
                        >
                          닫기
                        </Button>
                      </div>
                      <ProfileEdit 
                        profile={profile} 
                        onProfileUpdate={() => {
                          loadProfile(user!.id);
                          setShowProfileEdit(false);
                        }} 
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === "inquiries" && (
            <SupportTickets />
          )}

          {activeTab === "payments" && (
            <PaymentInfo />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;