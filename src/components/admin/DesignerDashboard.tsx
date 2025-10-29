import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Briefcase, Bell } from "lucide-react";
import { DateRange } from "react-day-picker";
import { differenceInDays } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export const DesignerDashboard = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [vacationDialogOpen, setVacationDialogOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [vacationType, setVacationType] = useState<string>("full");
  const [designerInfo, setDesignerInfo] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadDesignerData();
  }, []);

  const loadDesignerData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Load designer info
    const { data: designerData } = await supabase
      .from("designers")
      .select("*")
      .eq("user_id", user.id)
      .single();

    setDesignerInfo(designerData);

    // Load projects assigned to this designer
    const { data: projectsData } = await supabase
      .from("projects")
      .select(`
        *,
        profiles:user_id (name),
        designers:assigned_designer_id (name)
      `)
      .eq("assigned_designer_id", user.id)
      .eq("status", "active");

    setProjects(projectsData || []);

    // Load notifications
    const { data: notificationsData } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5);

    setNotifications(notificationsData || []);
  };

  const handleNotificationClick = async (notification: any) => {
    setSelectedNotification(notification);
    
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
    
    if (dateRange.to) {
      // 여러 날 선택한 경우
      days = differenceInDays(dateRange.to, dateRange.from) + 1;
      vacationTypeText = `연차 (${days}일)`;
    } else {
      // 하루만 선택한 경우
      if (vacationType === "morning") {
        days = 0.5;
        vacationTypeText = "반차 (오전)";
      } else if (vacationType === "afternoon") {
        days = 0.5;
        vacationTypeText = "반차 (오후)";
      } else {
        days = 1;
        vacationTypeText = "연차 (1일)";
      }
    }
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("로그인이 필요합니다.");

      // Check if designer has enough vacation days
      if (designerInfo && days > designerInfo.remaining_vacation_days) {
        throw new Error(`잔여 연차가 부족합니다. (잔여: ${designerInfo.remaining_vacation_days}일)`);
      }

      const endDate = dateRange.to || dateRange.from;
      const { error } = await supabase.from("support_tickets").insert({
        user_id: user.id,
        category: "휴가신청",
        subject: `휴가 신청 - ${vacationTypeText}`,
        message: `휴가 유형: ${vacationTypeText}\n휴가 기간: ${dateRange.from.toLocaleDateString('ko-KR')}${dateRange.to ? ` ~ ${endDate.toLocaleDateString('ko-KR')}` : ''}\n차감 일수: ${days}일`,
        status: 'open',
      });

      if (error) throw error;

      // Update remaining vacation days
      const { error: updateError } = await supabase
        .from("designers")
        .update({ remaining_vacation_days: designerInfo.remaining_vacation_days - days })
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      toast({
        title: "휴가 신청 완료",
        description: `휴가 신청이 접수되었습니다. (차감: ${days}일)`,
      });
      
      // Reload designer data to reflect updated vacation days
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
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">디자이너 대시보드</h1>
          <div className="flex gap-2">
            <Button variant="ghost" asChild>
              <Link to="/">홈</Link>
            </Button>
            <Button variant="outline" onClick={() => setVacationDialogOpen(true)}>
              휴가 신청
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              로그아웃
            </Button>
          </div>
        </div>

        {/* Designer Info Card */}
        {designerInfo && (
          <Card>
            <CardHeader>
              <CardTitle>근무 정보</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">입사일</p>
                  <p className="text-lg font-semibold">
                    {designerInfo.hire_date 
                      ? new Date(designerInfo.hire_date).toLocaleDateString('ko-KR')
                      : '2024-01-01'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">총 연차</p>
                  <p className="text-lg font-semibold">{designerInfo.total_vacation_days || 15}일</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">잔여 연차</p>
                  <p className="text-lg font-semibold text-accent">{designerInfo.remaining_vacation_days || 15}일</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Bell className="h-5 w-5" />
                {hasUnreadNotifications && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 bg-destructive rounded-full" />
                )}
              </div>
              <CardTitle>알림</CardTitle>
            </div>
            <CardDescription>새로운 공지사항 및 알림</CardDescription>
          </CardHeader>
          <CardContent>
            {notifications.length > 0 ? (
              <div className="space-y-2">
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
                        <p className="text-sm text-muted-foreground mt-1">
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
              <div className="grid gap-4 md:grid-cols-2">
                {projects.map((project) => (
                  <div key={project.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">{project.profiles?.name || '고객명'}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(project.start_date).toLocaleDateString('ko-KR')} ~ {new Date(project.end_date).toLocaleDateString('ko-KR')}
                        </p>
                      </div>
                      <Badge>{project.status === 'active' ? '진행중' : project.status}</Badge>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedNotification?.title}</DialogTitle>
            <DialogDescription>
              {new Date(selectedNotification?.created_at).toLocaleString('ko-KR')}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm">{selectedNotification?.message}</p>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setSelectedNotification(null)}>확인</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Vacation Request Dialog */}
      <Dialog open={vacationDialogOpen} onOpenChange={setVacationDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>휴가 신청</DialogTitle>
            <DialogDescription>
              휴가 날짜를 선택하고 유형을 지정해주세요. (최소 0.5일)
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">휴가 기간 선택</h3>
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={setDateRange}
                disabled={(date) => date < new Date()}
                className="rounded-md border"
                numberOfMonths={2}
              />
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
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
