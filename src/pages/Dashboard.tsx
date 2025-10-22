import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@supabase/supabase-js";
import { Bell, Briefcase } from "lucide-react";
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-20 px-4">
        <div className="container max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold">대시보드</h1>
            <Button variant="outline" onClick={handleLogout}>
              로그아웃
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">환영합니다!</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {profile?.name || user?.email}님의 대시보드입니다.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">진행 중인 프로젝트</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-accent">
                  {projects.filter(p => p.status === 'active').length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">알림</CardTitle>
                <div className="relative">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  {notifications.filter(n => !n.is_read).length > 0 && (
                    <span className="absolute -top-1 -right-1 h-2 w-2 bg-destructive rounded-full" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-accent">
                  {notifications.filter(n => !n.is_read).length}
                </div>
              </CardContent>
            </Card>
          </div>

          {projects.length > 0 && (
            <div className="mt-8 bg-card p-8 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-6">진행 중인 프로젝트</h2>
              <div className="space-y-4">
                {projects.map((project) => {
                  const projectStatus = getProjectStatus(project);
                  return (
                    <Card key={project.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">
                            {projectStatus.text}
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            {project.status === 'active' && !projectStatus.isPaused && (
                              <ProjectPauseDialog 
                                projectId={project.id}
                                pauseCount={project.pause_count}
                              />
                            )}
                          </div>
                        </div>
                        <CardDescription>
                          {new Date(project.start_date).toLocaleDateString('ko-KR')} ~ {new Date(project.end_date).toLocaleDateString('ko-KR')}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <span>홀딩 횟수: {project.pause_count} / 2</span>
                          <span>일시 중지 일수: {project.paused_days}일</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-8">
            <SupportTickets />
          </div>

          {notifications.length > 0 && (
            <div className="mt-8 bg-card p-8 rounded-lg border border-border">
              <h2 className="text-2xl font-bold mb-6">알림</h2>
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors hover:border-accent ${
                      notification.is_read ? 'bg-background border-border' : 'bg-accent/5 border-accent/30'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold mb-1">{notification.title}</h3>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
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
            </div>
          )}

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

          <div className="mt-8">
            <PaymentInfo />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
