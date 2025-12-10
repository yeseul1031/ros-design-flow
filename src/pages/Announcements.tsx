import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Megaphone, Calendar } from "lucide-react";
import type { User } from "@supabase/supabase-js";

interface Announcement {
  id: string;
  title: string;
  content: string;
  category: 'all' | 'announcement' | 'vacation' | 'project';
  created_at: string;
  is_important: boolean;
}

const Announcements = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("all");

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
      const [profileResult] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).single(),
      ]);

      if (profileResult.error) throw profileResult.error;
      setProfile(profileResult.data);

      // Mock announcements data
      setAnnouncements([
        {
          id: "1",
          title: "[안내] 12월 25일은 휴무입니다.",
          content: `프로젝트의 방향성과는 크게 상관없지만, 현재 페이지 구성과 흐름을 살펴보기 위해 임시 텍스트를 배치합니다. 이 문장은 실제 서비스와 무관하며 레이아웃 테스트를 위한 더미 콘텐츠로 활용되고 있습니다. 

섹션의 분위기와 길이를 확인하기 위해 다양한 문장을 이어붙이고 있으니, 최종 디자인 확정 후 적절한 카피로 교체될 예정입니다. 사용자가 읽게 되는 실제 문구는 이후 브랜드 톤과 목적에 맞게 조정될 계획이며, 지금은 전체적인 페이지 밸런스를 확인하기 위한 가벼운 예시일 뿐입니다. 

화면 구성의 흐름, 가독성, 여백 등을 확인하기 위해 작성된 것이니 참고만 부탁드립니다.`,
          category: "announcement",
          created_at: "2025-12-25",
          is_important: true
        },
        {
          id: "2",
          title: "[공지] 2025년 1월 정기 점검 안내",
          content: "시스템 정기 점검이 예정되어 있습니다. 점검 시간 동안 서비스 이용에 제한이 있을 수 있습니다.",
          category: "announcement",
          created_at: "2025-01-05",
          is_important: false
        },
        {
          id: "3",
          title: "[프로젝트] 신규 프로젝트 매칭 완료",
          content: "새로운 프로젝트가 매칭되었습니다. 대시보드에서 확인해주세요.",
          category: "project",
          created_at: "2025-01-10",
          is_important: true
        },
        {
          id: "4",
          title: "[휴가] 연차 사용 관련 안내",
          content: "2025년 연차 사용 기한은 12월 31일까지입니다.",
          category: "vacation",
          created_at: "2025-01-03",
          is_important: false
        }
      ]);

    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAnnouncements = activeTab === "all" 
    ? announcements 
    : announcements.filter(a => a.category === activeTab);

  const handleAnnouncementClick = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
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
      joinDate="2025-01-12"
      notificationCount={2}
      projectCount={4}
    >
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">공지사항</h1>
          <p className="text-muted-foreground">중요한 공지사항을 확인하세요.</p>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">전체</TabsTrigger>
            <TabsTrigger value="announcement">공지사항</TabsTrigger>
            <TabsTrigger value="vacation">휴가처리</TabsTrigger>
            <TabsTrigger value="project">프로젝트</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            <div className="space-y-4">
              {filteredAnnouncements.map((announcement) => (
                <Card
                  key={announcement.id}
                  className="cursor-pointer hover:bg-[#F7F7FB]/45 transition-colors"
                  onClick={() => handleAnnouncementClick(announcement)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2 mb-2">
                          {announcement.is_important && (
                            <Megaphone className="h-5 w-5 text-accent" />
                          )}
                          {announcement.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-2">
                          {announcement.content}
                        </CardDescription>
                      </div>
                      {announcement.is_important && (
                        <Badge variant="destructive" className="ml-2">중요</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(announcement.created_at).toLocaleDateString('ko-KR')}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredAnnouncements.length === 0 && (
                <Card>
                  <CardContent className="py-12">
                    <p className="text-center text-muted-foreground">
                      공지사항이 없습니다.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Announcement Detail Dialog */}
        <Dialog open={!!selectedAnnouncement} onOpenChange={() => setSelectedAnnouncement(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedAnnouncement?.is_important && (
                  <Megaphone className="h-5 w-5 text-accent" />
                )}
                {selectedAnnouncement?.title}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  {selectedAnnouncement && new Date(selectedAnnouncement.created_at).toLocaleDateString('ko-KR')}
                </span>
              </div>
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap">{selectedAnnouncement?.content}</p>
              </div>
              <div className="text-xs text-muted-foreground border-t pt-4">
                <p>※ 클릭 가능한 컴포넌트 Hover 시 BG를 #F7F7FB 불투명도 45%로 표시합니다.</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Announcements;
