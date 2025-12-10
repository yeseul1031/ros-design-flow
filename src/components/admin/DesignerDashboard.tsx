import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Bell, ChevronRight } from "lucide-react";
import { DateRange } from "react-day-picker";
import { differenceInDays } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import logo from "@/assets/logo.jpeg";

export const DesignerDashboard = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [vacationDialogOpen, setVacationDialogOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [vacationType, setVacationType] = useState<string>("full");
  const [designerInfo, setDesignerInfo] = useState<any>(null);
  const [bookedDates, setBookedDates] = useState<Date[]>([]);
  const [myVacations, setMyVacations] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'announcements'>('dashboard');
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadDesignerData();
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    const { data } = await supabase
      .from("announcements")
      .select("*")
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false });
    setAnnouncements(data || []);
  };

  const loadDesignerData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Load own designer info (may not exist)
    const { data: ownDesigner } = await supabase
      .from("designers")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    setDesignerInfo(ownDesigner);

    // Load a sample designer for display (admin list temporary)
    const { data: sample } = await supabase
      .from("designers")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // Load projects assigned to this designer (fallbacks by profile name/email)
    const { data: myProfile } = await supabase
      .from("profiles")
      .select("id, name, email")
      .eq("id", user.id)
      .maybeSingle();

    let candidateDesignerIds: string[] = [];
    if (ownDesigner?.id) candidateDesignerIds.push(ownDesigner.id);

    if (myProfile?.name || myProfile?.email) {
      const orFilters = [
        myProfile?.name ? `name.eq.${myProfile.name}` : undefined,
        myProfile?.email ? `contact.eq.${myProfile.email}` : undefined,
      ]
        .filter(Boolean)
        .join(",");

      if (orFilters.length > 0) {
        const { data: altDesigners } = await supabase
          .from("designers")
          .select("id")
          .or(orFilters);
        if (altDesigners) {
          candidateDesignerIds.push(...altDesigners.map((d: any) => d.id));
        }
      }
    }

    candidateDesignerIds = Array.from(new Set(candidateDesignerIds));

    let projectsData: any[] = [];
    if (candidateDesignerIds.length > 0) {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .in("assigned_designer_id", candidateDesignerIds)
        .in("status", ["active", "paused"])
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading designer projects:", error);
      } else {
        projectsData = data || [];
      }
    }

    // Enrich with profile info
    if (projectsData.length) {
      const userIds = Array.from(new Set(projectsData.map((p: any) => p.user_id)));
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, name, company")
        .in("id", userIds);
      const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));
      projectsData = projectsData.map((p: any) => ({ ...p, profiles: profileMap.get(p.user_id) || null }));
    }

    setProjects(projectsData);

    // Load notifications
    const { data: notificationsData } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setNotifications(notificationsData || []);

    // Load approved vacation requests to block dates (excluding own requests)
    const { data: vacationData } = await supabase
      .from("vacation_requests")
      .select("start_date, end_date, user_id")
      .eq("status", "approved")
      .neq("user_id", user.id);

    if (vacationData) {
      const blocked: Date[] = [];
      vacationData.forEach((vr) => {
        const start = new Date(vr.start_date);
        const end = new Date(vr.end_date);
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          blocked.push(new Date(d));
        }
      });
      setBookedDates(blocked);
    }

    // Load own vacation requests
    const { data: myVacationData } = await supabase
      .from("vacation_requests")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setMyVacations(myVacationData || []);
  };

  const handleNotificationClick = async (notification: any) => {
    if (notification.title.startsWith('[공지]')) {
      const announcementTitle = notification.title.replace('[공지] ', '');
      const { data: announcement } = await supabase
        .from("announcements")
        .select("*")
        .eq("title", announcementTitle)
        .maybeSingle();

      if (announcement) {
        setSelectedNotification({
          ...notification,
          fullContent: announcement.content,
          imageUrl: announcement.image_url
        });
      } else {
        setSelectedNotification(notification);
      }
    } else {
      setSelectedNotification(notification);
    }
    
    if (!notification.is_read) {
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notification.id);

      setNotifications(notifications.map(n => 
        n.id === notification.id ? { ...n, is_read: true } : n
      ));
    }
  };

  const handleVacationRequest = async () => {
    if (!dateRange?.from) {
      toast({
        title: "날짜 선택 필요",
        description: "휴가 날짜를 선택해주세요.",
        variant: "destructive",
      });
      return;
    }

    let days = 0;
    let vacationTypeText = "";
    let actualVacationType = "";
    
    if (dateRange.to) {
      days = differenceInDays(dateRange.to, dateRange.from) + 1;
      vacationTypeText = `연차 (${days}일)`;
      actualVacationType = "full_day";
    } else {
      if (vacationType === "morning" || vacationType === "afternoon") {
        days = 0.5;
        vacationTypeText = vacationType === "morning" ? "반차 (오전)" : "반차 (오후)";
        actualVacationType = "half_day";
      } else {
        days = 1;
        vacationTypeText = "연차 (1일)";
        actualVacationType = "full_day";
      }
    }
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("로그인이 필요합니다.");

      if (designerInfo && typeof designerInfo.remaining_vacation_days === 'number') {
        if (days > designerInfo.remaining_vacation_days) {
          throw new Error(`잔여 연차가 부족합니다. (잔여: ${designerInfo.remaining_vacation_days}일)`);
        }
      }

      const { data: designer } = await supabase
        .from("designers")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!designer) {
        throw new Error("디자이너 정보를 찾을 수 없습니다. 페이지를 새로고침해주세요.");
      }

      const endDate = dateRange.to || dateRange.from;

      const { error: vacationError } = await supabase.from("vacation_requests").insert({
        designer_id: designer.id,
        user_id: user.id,
        start_date: dateRange.from.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        vacation_type: actualVacationType,
        days_count: days,
        status: 'pending',
      });

      if (vacationError) throw vacationError;

      const { error } = await supabase.from("support_tickets").insert({
        user_id: user.id,
        category: "휴가신청",
        subject: `휴가 신청 - ${vacationTypeText}`,
        message: `휴가 유형: ${vacationTypeText}\n휴가 기간: ${dateRange.from.toLocaleDateString('ko-KR')}${dateRange.to ? ` ~ ${endDate.toLocaleDateString('ko-KR')}` : ''}\n차감 일수: ${days}일`,
        status: 'open',
      });

      if (error) throw error;

      toast({
        title: "휴가 신청 완료",
        description: `휴가 신청이 접수되었습니다. (차감: ${days}일)`,
      });
      
      loadDesignerData();
      setVacationDialogOpen(false);
      setDateRange(undefined);
      setVacationType("full");
    } catch (error: any) {
      toast({
        title: "휴가 신청 실패",
        description: error.message,
        variant: "destructive",
      });
    }
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
      window.location.href = "/";
    }
  };

  // Count unread announcement notifications
  const unreadAnnouncementCount = notifications.filter(n => !n.is_read && n.title.startsWith('[공지]')).length;
  const activeProjectCount = projects.filter(p => p.status === 'active').length;

  return (
    <div className="min-h-screen bg-muted/30">
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

        {/* Tab Navigation */}
        <div className="flex gap-6 mb-8">
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
            onClick={() => setActiveTab("announcements")}
            className={`pb-3 text-sm font-medium transition-colors relative ${
              activeTab === "announcements" 
                ? "text-primary" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            공지사항
            {activeTab === "announcements" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        </div>

        {activeTab === "dashboard" && (
          <>
            {/* Profile and Notifications Grid */}
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              {/* Profile Card */}
              <Card className="bg-card border-0 shadow-sm">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-1">
                    {designerInfo?.name || '디자이너'}님
                  </h2>
                  <p className="text-sm text-muted-foreground mb-1">
                    연차 {designerInfo?.remaining_vacation_days ?? 15}/{designerInfo?.total_vacation_days ?? 15}
                  </p>
                  <p className="text-sm text-muted-foreground mb-8">
                    입사일 {designerInfo?.hire_date 
                      ? new Date(designerInfo.hire_date).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\. /g, '. ')
                      : '2025. 01. 12'}
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setVacationDialogOpen(true)}
                  >
                    휴가 관리
                  </Button>
                </CardContent>
              </Card>

              {/* Notifications Card */}
              <Card className="bg-card border-0 shadow-sm">
                <CardContent className="p-6">
                  <h3 className="font-bold mb-4">알림</h3>
                  <div className="space-y-3">
                    <button 
                      onClick={() => setActiveTab("announcements")}
                      className="w-full flex items-center justify-between py-2 hover:bg-muted/50 rounded-lg px-2 -mx-2 transition-colors"
                    >
                      <span className="text-sm">
                        공지사항 
                        {unreadAnnouncementCount > 0 && (
                          <span className="text-primary ml-1">+{unreadAnnouncementCount}</span>
                        )}
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Projects Card */}
            <Card className="bg-card border-0 shadow-sm mb-4">
              <CardContent className="p-6">
                <h3 className="font-bold mb-4">프로젝트</h3>
                <button 
                  className="w-full flex items-center justify-between py-2 hover:bg-muted/50 rounded-lg px-2 -mx-2 transition-colors"
                >
                  <span className="text-sm">진행 중 {activeProjectCount}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              </CardContent>
            </Card>

            {/* Account Card */}
            <Card className="bg-card border-0 shadow-sm">
              <CardContent className="p-6">
                <h3 className="font-bold mb-4">계정</h3>
                <div className="space-y-1">
                  <Link 
                    to="/"
                    className="w-full flex items-center justify-between py-2 hover:bg-muted/50 rounded-lg px-2 -mx-2 transition-colors"
                  >
                    <span className="text-sm">메인으로 돌아가기</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
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
          </>
        )}

        {activeTab === "announcements" && (
          <Card className="bg-card border-0 shadow-sm">
            <CardContent className="p-6">
              <h3 className="font-bold mb-4">공지사항</h3>
              {announcements.length > 0 ? (
                <div className="space-y-3">
                  {announcements.map((announcement) => (
                    <div
                      key={announcement.id}
                      className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedNotification({
                        title: announcement.title,
                        fullContent: announcement.content,
                        imageUrl: announcement.image_url,
                        created_at: announcement.created_at
                      })}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {announcement.is_pinned && (
                              <Badge variant="destructive" className="text-xs">중요</Badge>
                            )}
                            <Badge variant="outline" className="text-xs">{announcement.category}</Badge>
                            <p className="font-medium">{announcement.title}</p>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {announcement.content}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(announcement.created_at).toLocaleDateString('ko-KR')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">공지사항이 없습니다.</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Notification Detail Dialog */}
        <Dialog open={!!selectedNotification} onOpenChange={() => setSelectedNotification(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedNotification?.title}</DialogTitle>
              <DialogDescription>
                {selectedNotification?.created_at && new Date(selectedNotification.created_at).toLocaleDateString('ko-KR')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {selectedNotification?.imageUrl && (
                <img 
                  src={selectedNotification.imageUrl} 
                  alt="공지사항 이미지" 
                  className="w-full rounded-lg"
                />
              )}
              <div className="whitespace-pre-wrap">
                {selectedNotification?.fullContent || selectedNotification?.message}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Vacation Management Dialog */}
        <Dialog open={vacationDialogOpen} onOpenChange={setVacationDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>휴가 관리</DialogTitle>
              <DialogDescription>
                휴가를 신청하거나 신청 내역을 확인할 수 있습니다.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Vacation Info */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">총 연차</p>
                  <p className="text-lg font-semibold">{designerInfo?.total_vacation_days || 15}일</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">사용</p>
                  <p className="text-lg font-semibold">
                    {(designerInfo?.total_vacation_days || 15) - (designerInfo?.remaining_vacation_days ?? 15)}일
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">잔여</p>
                  <p className="text-lg font-semibold text-primary">
                    {designerInfo?.remaining_vacation_days ?? 15}일
                  </p>
                </div>
              </div>

              {/* Calendar */}
              <div>
                <h4 className="font-medium mb-2">휴가 날짜 선택</h4>
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  disabled={bookedDates}
                  className="rounded-md border"
                />
              </div>

              {/* Vacation Type (only for single day) */}
              {dateRange?.from && !dateRange?.to && (
                <div>
                  <h4 className="font-medium mb-2">휴가 유형</h4>
                  <RadioGroup value={vacationType} onValueChange={setVacationType}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="full" id="full" />
                      <Label htmlFor="full">연차 (1일)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="morning" id="morning" />
                      <Label htmlFor="morning">반차 (오전)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="afternoon" id="afternoon" />
                      <Label htmlFor="afternoon">반차 (오후)</Label>
                    </div>
                  </RadioGroup>
                </div>
              )}

              <Button onClick={handleVacationRequest} className="w-full">
                휴가 신청하기
              </Button>

              {/* My Vacation History */}
              {myVacations.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">신청 내역</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>기간</TableHead>
                        <TableHead>유형</TableHead>
                        <TableHead>일수</TableHead>
                        <TableHead>상태</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {myVacations.map((vacation) => (
                        <TableRow key={vacation.id}>
                          <TableCell>
                            {new Date(vacation.start_date).toLocaleDateString('ko-KR')}
                            {vacation.start_date !== vacation.end_date && 
                              ` ~ ${new Date(vacation.end_date).toLocaleDateString('ko-KR')}`}
                          </TableCell>
                          <TableCell>
                            {vacation.vacation_type === 'half_day' ? '반차' : '연차'}
                          </TableCell>
                          <TableCell>{vacation.days_count}일</TableCell>
                          <TableCell>
                            <Badge variant={
                              vacation.status === 'approved' ? 'default' :
                              vacation.status === 'rejected' ? 'destructive' : 'secondary'
                            }>
                              {vacation.status === 'approved' ? '승인' :
                               vacation.status === 'rejected' ? '반려' : '대기'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
