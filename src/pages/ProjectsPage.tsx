import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FolderKanban, User, Calendar, Clock } from "lucide-react";
import type { User as AuthUser } from "@supabase/supabase-js";

interface Project {
  id: string;
  name: string;
  designer_name: string;
  status: 'active' | 'paused' | 'completed';
  progress: number;
  start_date: string;
  end_date: string;
  pause_count: number;
  paused_days: number;
}

const ProjectsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
        loadData(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadData = async (userId: string) => {
    try {
      const [profileResult, projectsResult] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).single(),
        supabase.from("projects").select("*, designers(name)").eq("user_id", userId),
      ]);

      if (profileResult.error) throw profileResult.error;
      setProfile(profileResult.data);

      // Transform projects data
      const transformedProjects = (projectsResult.data || []).map((p: any) => ({
        id: p.id,
        name: `프로젝트 - ${p.designers?.name || '담당자 미정'}`,
        designer_name: p.designers?.name || '담당자 미정',
        status: p.status,
        progress: 45, // Mock progress
        start_date: p.start_date,
        end_date: p.end_date,
        pause_count: p.pause_count || 0,
        paused_days: p.paused_days || 0,
      }));

      setProjects(transformedProjects);

    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">진행 중</Badge>;
      case 'paused':
        return <Badge className="bg-yellow-500">일시 중지</Badge>;
      case 'completed':
        return <Badge className="bg-blue-500">완료</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const calculateDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const today = new Date();
    const diff = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">로딩 중...</div>
      </div>
    );
  }

  const activeProjects = projects.filter(p => p.status === 'active');
  const pausedProjects = projects.filter(p => p.status === 'paused');
  const completedProjects = projects.filter(p => p.status === 'completed');

  return (
    <DashboardLayout 
      profile={profile}
      annualLeave={{ used: 12, total: 15 }}
      joinDate="2025-01-12"
      notificationCount={2}
      projectCount={activeProjects.length}
    >
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">프로젝트</h1>
          <p className="text-muted-foreground">진행 중인 프로젝트를 관리하세요.</p>
        </div>

        {/* Project Stats */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">진행 중</CardTitle>
              <FolderKanban className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{activeProjects.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">일시 중지</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{pausedProjects.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">완료됨</CardTitle>
              <FolderKanban className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{completedProjects.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Active Projects */}
        {activeProjects.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">진행 중 {activeProjects.length}</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {activeProjects.map((project) => (
                <Card 
                  key={project.id}
                  className="cursor-pointer hover:bg-[#F7F7FB]/45 transition-colors"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{project.name}</CardTitle>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="h-4 w-4" />
                          <span>{project.designer_name}님과 진행 중</span>
                        </div>
                      </div>
                      {getStatusBadge(project.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">프로젝트 진행률</span>
                        <span className="font-semibold">{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(project.start_date).toLocaleDateString('ko-KR')} ~ {new Date(project.end_date).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">홀딩 횟수: </span>
                        <span className="font-semibold">{project.pause_count} / 2</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">일시 중지 일수: </span>
                        <span className="font-semibold">{project.paused_days}일</span>
                      </div>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">남은 기간: </span>
                      <span className="font-semibold text-accent">
                        {calculateDaysRemaining(project.end_date)}일
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Other Projects */}
        {(pausedProjects.length > 0 || completedProjects.length > 0) && (
          <div>
            <h2 className="text-2xl font-bold mb-4">기타 프로젝트</h2>
            <div className="space-y-4">
              {[...pausedProjects, ...completedProjects].map((project) => (
                <Card 
                  key={project.id}
                  className="cursor-pointer hover:bg-[#F7F7FB]/45 transition-colors"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{project.name}</CardTitle>
                        <CardDescription>
                          {new Date(project.start_date).toLocaleDateString('ko-KR')} ~ {new Date(project.end_date).toLocaleDateString('ko-KR')}
                        </CardDescription>
                      </div>
                      {getStatusBadge(project.status)}
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        )}

        {projects.length === 0 && (
          <Card>
            <CardContent className="py-12">
              <p className="text-center text-muted-foreground">
                진행 중인 프로젝트가 없습니다.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ProjectsPage;
