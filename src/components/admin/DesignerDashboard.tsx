import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Briefcase, Bell, Calendar as CalendarIcon, X } from "lucide-react";
import { DateRange } from "react-day-picker";
import { differenceInDays } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const [sampleDesigner, setSampleDesigner] = useState<any>(null);
  const [remainingDays, setRemainingDays] = useState<number>(13);
  const [bookedDates, setBookedDates] = useState<Date[]>([]);
  const [myVacations, setMyVacations] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadDesignerData();
  }, []);

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
    setRemainingDays(
      ownDesigner?.remaining_vacation_days ?? 15
    );

    // Load a sample designer for display (admin list temporary)
    const { data: sample } = await supabase
      .from("designers")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    setSampleDesigner(sample);

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
        .in("status", ["active", "paused"]) // 진행중(진행/홀딩)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading designer projects:", error);
      } else {
        projectsData = data || [];
      }
    }

    // Enrich with profile info (브랜드명 등 표시용)
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
    // Load full announcement data if this is an announcement notification
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
      // 여러 날 선택한 경우
      days = differenceInDays(dateRange.to, dateRange.from) + 1;
      vacationTypeText = `연차 (${days}일)`;
      actualVacationType = "full_day";
    } else {
      // 하루만 선택한 경우
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

      // If we have designer info, enforce remaining days constraint
      if (designerInfo && typeof designerInfo.remaining_vacation_days === 'number') {
        if (days > designerInfo.remaining_vacation_days) {
          throw new Error(`잔여 연차가 부족합니다. (잔여: ${designerInfo.remaining_vacation_days}일)`);
        }
      }

      // Get designer_id
      const { data: designer } = await supabase
        .from("designers")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!designer) {
        throw new Error("디자이너 정보를 찾을 수 없습니다. 페이지를 새로고침해주세요.");
      }

      const endDate = dateRange.to || dateRange.from;

      // Insert into vacation_requests table
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

      // Also keep support_tickets for backward compatibility
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
      
      // Reload designer data to reflect updated vacation days if any
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

  const hasUnreadNotifications = notifications.some(n => !n.is_read);

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

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <img src={logo} alt="Logo" className="h-16 object-contain" />
          <div className="flex gap-2">
            <Button variant="ghost" asChild>
              <Link to="/">홈</Link>
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              로그아웃
            </Button>
          </div>
        </div>

        {/* Vacation Request Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                <CardTitle>{designerInfo?.name || '디자이너'} 디자이너</CardTitle>
              </div>
              <Button onClick={() => setVacationDialogOpen(true)}>
                휴가 관리
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">입사일</p>
                <p className="text-lg font-semibold">
                  {designerInfo?.hire_date 
                    ? new Date(designerInfo.hire_date).toLocaleDateString('ko-KR')
                    : '2024.01.01'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">총 연차 개수</p>
                <p className="text-lg font-semibold">{designerInfo?.total_vacation_days || 15}개</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">잔여 연차 개수</p>
                <p className="text-2xl font-bold text-accent">
                  {designerInfo?.remaining_vacation_days !== undefined 
                    ? designerInfo.remaining_vacation_days 
                    : 15}개
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Bell className="h-5 w-5" />
                  {hasUnreadNotifications && (
                    <span className="absolute -top-1 -right-1 h-2 w-2 bg-destructive rounded-full" />
                  )}
                </div>
                <CardTitle>알림</CardTitle>
              </div>
            </div>
            <CardDescription>새로운 공지사항 및 알림</CardDescription>
          </CardHeader>
          <CardContent>
            {notifications.length > 0 ? (
              <div className="space-y-2">
                {notifications.slice(0, 5).map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      notification.is_read 
                        ? 'bg-background hover:bg-muted/50' 
                        : 'bg-accent/10 border-accent hover:bg-accent/20'
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{notification.title}</p>
                          {!notification.is_read && (
                            <Badge variant="default" className="text-xs">New</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(notification.created_at).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                  </div>
                ))}
                {notifications.length > 5 && (
                  <Button 
                    variant="outline" 
                    className="w-full mt-2"
                    onClick={() => {
                      const dialog = document.getElementById('all-notifications-dialog');
                      if (dialog) dialog.click();
                    }}
                  >
                    전체보기 ({notifications.length}개)
                  </Button>
                )}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">알림이 없습니다.</p>
            )}
          </CardContent>
        </Card>

        {/* Projects */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              <CardTitle>진행 중인 프로젝트</CardTitle>
            </div>
            <CardDescription>현재 담당하고 있는 프로젝트</CardDescription>
          </CardHeader>
          <CardContent>
            {projects.length > 0 ? (
              <div className="space-y-4">
                {projects.map((project) => (
                  <div key={project.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="font-semibold text-lg">{project.profiles?.name || '고객명'}</h3>
                        {project.profiles?.company && (
                          <p className="text-sm text-muted-foreground">{project.profiles.company}</p>
                        )}
                      </div>
                      <Badge>{project.status === 'active' ? '진행중' : project.status}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                      <div>
                        <p className="text-xs text-muted-foreground">연락처</p>
                        <p className="text-sm">{project.profiles?.phone || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">이메일</p>
                        <p className="text-sm">{project.profiles?.email || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">시작일</p>
                        <p className="text-sm">{new Date(project.start_date).toLocaleDateString('ko-KR')}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">종료일</p>
                        <p className="text-sm">{new Date(project.end_date).toLocaleDateString('ko-KR')}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">일시정지 횟수</p>
                        <p className="text-sm">{project.pause_count || 0}회</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">일시정지 일수</p>
                        <p className="text-sm">{project.paused_days || 0}일</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">계약 횟수</p>
                        <p className="text-sm">{project.contract_count || 1}회</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">진행 중인 프로젝트가 없습니다.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Notification Dialog */}
      <Dialog open={!!selectedNotification} onOpenChange={() => setSelectedNotification(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedNotification?.title}</DialogTitle>
            <DialogDescription>
              {new Date(selectedNotification?.created_at).toLocaleString('ko-KR')}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {selectedNotification?.imageUrl && (
              <img 
                src={selectedNotification.imageUrl} 
                alt="공지사항 이미지"
                className="w-full rounded-lg border"
              />
            )}
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap">{selectedNotification?.fullContent || selectedNotification?.message}</p>
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setSelectedNotification(null)}>확인</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* All Notifications Dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <button id="all-notifications-dialog" className="hidden" />
        </DialogTrigger>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>전체 알림</DialogTitle>
            <DialogDescription>
              모든 알림 목록
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 mt-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  notification.is_read 
                    ? 'bg-background hover:bg-muted/50' 
                    : 'bg-accent/10 border-accent hover:bg-accent/20'
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{notification.title}</p>
                      {!notification.is_read && (
                        <Badge variant="default" className="text-xs">New</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(notification.created_at).toLocaleDateString('ko-KR')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Vacation Management Dialog */}
      <Dialog open={vacationDialogOpen} onOpenChange={setVacationDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>휴가 관리</DialogTitle>
            <DialogDescription>
              휴가 신청 및 현황을 확인하세요
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="request" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="request">휴가 신청</TabsTrigger>
              <TabsTrigger value="status">휴가 현황</TabsTrigger>
            </TabsList>
            
            <TabsContent value="request" className="space-y-4 mt-4">
              <div>
                <h3 className="text-sm font-medium mb-2">휴가 기간 선택</h3>
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  disabled={(date) => {
                    // Disable past dates
                    if (date < new Date()) return true;
                    
                    // Disable dates that are already booked by other designers
                    return bookedDates.some(bookedDate => 
                      bookedDate.getFullYear() === date.getFullYear() &&
                      bookedDate.getMonth() === date.getMonth() &&
                      bookedDate.getDate() === date.getDate()
                    );
                  }}
                  className="rounded-md border"
                  numberOfMonths={2}
                />
                {bookedDates.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    * 회색으로 표시된 날짜는 다른 디자이너가 이미 신청한 날짜입니다.
                  </p>
                )}
              </div>

              {dateRange?.from && (
                <div className="space-y-4">
                  {/* 하루만 선택한 경우 반차/연차 선택 */}
                  {!dateRange.to && (
                    <div className="bg-muted p-4 rounded-lg space-y-3">
                      <Label className="text-sm font-medium">휴가 유형</Label>
                      <RadioGroup value={vacationType} onValueChange={setVacationType}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="morning" id="morning" />
                          <Label htmlFor="morning" className="cursor-pointer">반차 (오전)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="afternoon" id="afternoon" />
                          <Label htmlFor="afternoon" className="cursor-pointer">반차 (오후)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="full" id="full" />
                          <Label htmlFor="full" className="cursor-pointer">연차 (1일)</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  )}

                  {/* 여러 날 선택한 경우 */}
                  {dateRange.to && (
                    <div className="bg-muted p-4 rounded-lg">
                      <p className="text-sm">
                        선택한 기간: {differenceInDays(dateRange.to, dateRange.from) + 1}일
                        ({dateRange.from.toLocaleDateString('ko-KR')} ~ {dateRange.to.toLocaleDateString('ko-KR')})
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => {
                  setVacationDialogOpen(false);
                  setDateRange(undefined);
                  setVacationType("full");
                }}>
                  취소
                </Button>
                <Button 
                  onClick={handleVacationRequest}
                  disabled={!dateRange?.from}
                >
                  신청
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="status" className="mt-4">
              <div className="space-y-4">
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>기간</TableHead>
                        <TableHead>유형</TableHead>
                        <TableHead>차감일수</TableHead>
                        <TableHead>상태</TableHead>
                        <TableHead>신청일</TableHead>
                        <TableHead className="text-right">작업</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {myVacations.length > 0 ? (
                        myVacations.map((vacation) => (
                          <TableRow key={vacation.id}>
                            <TableCell>
                              {new Date(vacation.start_date).toLocaleDateString('ko-KR')}
                              {vacation.start_date !== vacation.end_date && 
                                ` ~ ${new Date(vacation.end_date).toLocaleDateString('ko-KR')}`
                              }
                            </TableCell>
                            <TableCell>
                              {vacation.vacation_type === 'morning' ? '반차(오전)' : 
                               vacation.vacation_type === 'afternoon' ? '반차(오후)' : 
                               '연차'}
                            </TableCell>
                            <TableCell>{vacation.days_count}일</TableCell>
                            <TableCell>
                              <Badge variant={
                                vacation.status === 'approved' ? 'default' :
                                vacation.status === 'rejected' ? 'destructive' :
                                'secondary'
                              }>
                                {vacation.status === 'approved' ? '승인' :
                                 vacation.status === 'rejected' ? '거부' :
                                 '대기중'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {new Date(vacation.created_at).toLocaleDateString('ko-KR')}
                            </TableCell>
                            <TableCell className="text-right">
                              {vacation.status === 'pending' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={async () => {
                                    try {
                                      const { error } = await supabase
                                        .from("vacation_requests")
                                        .delete()
                                        .eq("id", vacation.id);

                                      if (error) throw error;

                                      // Also delete from support_tickets
                                      await supabase
                                        .from("support_tickets")
                                        .delete()
                                        .eq("user_id", vacation.user_id)
                                        .eq("category", "휴가신청")
                                        .gte("created_at", vacation.created_at)
                                        .lte("created_at", vacation.created_at);

                                      toast({
                                        title: "휴가 취소 완료",
                                        description: "휴가 신청이 취소되었습니다.",
                                      });

                                      loadDesignerData();
                                    } catch (error: any) {
                                      toast({
                                        title: "취소 실패",
                                        description: error.message,
                                        variant: "destructive",
                                      });
                                    }
                                  }}
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  취소
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                            신청한 휴가가 없습니다.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
};
