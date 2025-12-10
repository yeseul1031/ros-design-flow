import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@supabase/supabase-js";
import { Bell, Briefcase, Megaphone, CalendarDays, TrendingUp } from "lucide-react";
import { ProjectPauseDialog } from "@/components/dashboard/ProjectPauseDialog";
import { SupportTickets } from "@/components/dashboard/SupportTickets";
import { ProfileEdit } from "@/components/dashboard/ProfileEdit";
import { PaymentInfo } from "@/components/dashboard/PaymentInfo";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [pauseRequests, setPauseRequests] = useState<any[]>([]);

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
      // Use RPC to bypass RLS and accurately detect roles
      const [isAdmin, isManager, isDesigner] = await Promise.all([
        supabase.rpc('has_role', { _user_id: userId, _role: 'admin' }),
        supabase.rpc('has_role', { _user_id: userId, _role: 'manager' }),
        supabase.rpc('has_role', { _user_id: userId, _role: 'designer' }),
      ]);

      if (isAdmin.data === true || isManager.data === true || isDesigner.data === true) {
        navigate('/admin');
        return;
      }
      const [profileResult, projectsResult, notificationsResult, pauseRequestsResult] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).single(),
        supabase.from("projects").select("*, designers(name)").eq("user_id", userId),
        supabase.from("notifications").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
        supabase.from("project_pause_requests").select("*").eq("user_id", userId).eq("status", "approved"),
      ]);

      if (profileResult.error) throw profileResult.error;
      setProfile(profileResult.data);
      setProjects(projectsResult.data || []);
      setNotifications(notificationsResult.data || []);
      setPauseRequests(pauseRequestsResult.data || []);
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationClick = async (notification: any) => {
    setSelectedNotification(notification);
    
    if (!notification.is_read) {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notification.id);
      
      if (!error) {
        setNotifications(notifications.map(n => 
          n.id === notification.id ? { ...n, is_read: true } : n
        ));
      }
    }
  };

  const getProjectStatus = (project: any) => {
    const activePause = pauseRequests.find(
      pr => pr.project_id === project.id && pr.status === 'approved'
    );
    
    if (activePause) {
      return {
        text: `${new Date(activePause.start_date).toLocaleDateString('ko-KR')} ~ ${new Date(activePause.end_date).toLocaleDateString('ko-KR')} 홀딩중`,
        isPaused: true
      };
    }
    
    return {
      text: `${project.designers?.name ? `${project.designers.name}님과 진행 중` : '프로젝트'}`,
      isPaused: false
    };
  };


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">로딩 중...</div>
      </div>
    );
  }

  return (
    <DashboardLayout
      profile={profile}
      annualLeave={{ used: 12, total: 15 }}
      joinDate={profile?.created_at}
      notificationCount={2}
      projectCount={projects.filter(p => p.status === 'active').length}
    >
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">대시보드</h1>
          <p className="text-muted-foreground">
            {profile?.company && profile?.name 
              ? `${profile.company}-${profile.name}` 
              : profile?.name || user?.email}님, 환영합니다!
          </p>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Link to="/dashboard/projects">
            <Card className="cursor-pointer hover:bg-[#F7F7FB]/45 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">진행 중</CardTitle>
                <Briefcase className="h-5 w-5 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-accent">
                  {projects.filter(p => p.status === 'active').length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">프로젝트</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/dashboard/notifications">
            <Card className="cursor-pointer hover:bg-[#F7F7FB]/45 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">알림</CardTitle>
                <Bell className="h-5 w-5 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {notifications.filter(n => !n.is_read).length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">읽지 않은 알림</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/dashboard/announcements">
            <Card className="cursor-pointer hover:bg-[#F7F7FB]/45 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">공지사항</CardTitle>
                <Megaphone className="h-5 w-5 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">2</div>
                <p className="text-xs text-muted-foreground mt-1">새 공지사항</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/dashboard/vacation">
            <Card className="cursor-pointer hover:bg-[#F7F7FB]/45 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">연차</CardTitle>
                <CalendarDays className="h-5 w-5 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">3</div>
                <p className="text-xs text-muted-foreground mt-1">남은 연차</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Projects */}
        {projects.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">진행 중인 프로젝트</CardTitle>
                  <CardDescription className="mt-1">최근 프로젝트 현황을 확인하세요</CardDescription>
                </div>
                <Button variant="outline" asChild>
                  <Link to="/dashboard/projects">전체 보기</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projects.slice(0, 3).map((project) => {
                  const projectStatus = getProjectStatus(project);
                  return (
                    <div 
                      key={project.id}
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-[#F7F7FB]/45 transition-colors cursor-pointer"
                    >
                      <div className="flex-1">
                        <p className="font-semibold mb-1">{projectStatus.text}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(project.start_date).toLocaleDateString('ko-KR')} ~ {new Date(project.end_date).toLocaleDateString('ko-KR')}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">홀딩</p>
                          <p className="font-semibold">{project.pause_count} / 2</p>
                        </div>
                        {project.status === 'active' && !projectStatus.isPaused && (
                          <ProjectPauseDialog 
                            projectId={project.id}
                            pauseCount={project.pause_count}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Notifications */}
        {notifications.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">최근 알림</CardTitle>
                  <CardDescription className="mt-1">읽지 않은 알림을 확인하세요</CardDescription>
                </div>
                <Button variant="outline" asChild>
                  <Link to="/dashboard/notifications">전체 보기</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...notifications].sort((a, b) => {
                  const getPriority = (title: string) => {
                    if (title.includes('프로젝트') && title.includes('시작')) return 1;
                    if (title.includes('결제') && title.includes('완료')) return 2;
                    if (title.includes('견적서')) return 3;
                    return 4;
                  };
                  return getPriority(a.title) - getPriority(b.title);
                }).slice(0, 5).map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors hover:bg-[#F7F7FB]/45 ${
                      notification.is_read ? 'bg-background border-border' : 'bg-accent/5 border-accent/30'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{notification.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(notification.created_at).toLocaleDateString('ko-KR')} {new Date(notification.created_at).toLocaleTimeString('ko-KR')}
                        </p>
                      </div>
                      {!notification.is_read && (
                        <Badge variant="default" className="ml-2">New</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <SupportTickets />
          <PaymentInfo />
        </div>

        <Dialog open={!!selectedNotification} onOpenChange={() => setSelectedNotification(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedNotification?.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{selectedNotification?.message}</p>
              <p className="text-xs text-muted-foreground">
                {selectedNotification && new Date(selectedNotification.created_at).toLocaleDateString('ko-KR')} {selectedNotification && new Date(selectedNotification.created_at).toLocaleTimeString('ko-KR')}
              </p>
            </div>
          </DialogContent>
        </Dialog>

        <div className="mt-8">
          <ProfileEdit profile={profile} onProfileUpdate={() => loadProfile(user!.id)} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
