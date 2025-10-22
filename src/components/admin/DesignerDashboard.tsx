import { useState, useEffect } from "react";
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

export const DesignerDashboard = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [vacationDialogOpen, setVacationDialogOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const { toast } = useToast();

  useEffect(() => {
    loadDesignerData();
  }, []);

  const loadDesignerData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

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
    if (!dateRange?.from || !dateRange?.to) {
      toast({
        title: "날짜 선택 필요",
        description: "휴가 시작일과 종료일을 선택해주세요.",
        variant: "destructive",
      });
      return;
    }

    const days = differenceInDays(dateRange.to, dateRange.from) + 1;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("로그인이 필요합니다.");

      const { error } = await supabase.from("support_tickets").insert({
        user_id: user.id,
        category: "휴가신청",
        subject: `휴가 신청 (${days}일)`,
        message: `휴가 기간: ${dateRange.from.toLocaleDateString('ko-KR')} ~ ${dateRange.to.toLocaleDateString('ko-KR')}`,
        status: 'open',
      });

      if (error) throw error;

      toast({
        title: "휴가 신청 완료",
        description: "휴가 신청이 접수되었습니다.",
      });
      
      setVacationDialogOpen(false);
      setDateRange(undefined);
    } catch (error: any) {
      toast({
        title: "휴가 신청 실패",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const hasUnreadNotifications = notifications.some(n => !n.is_read);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">디자이너 대시보드</h1>
          <Button variant="outline" onClick={() => setVacationDialogOpen(true)}>
            휴가 신청
          </Button>
        </div>

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
              휴가 기간을 선택해주세요.
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

            {dateRange?.from && dateRange?.to && (
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm">
                  선택한 기간: {differenceInDays(dateRange.to, dateRange.from) + 1}일
                  ({dateRange.from.toLocaleDateString('ko-KR')} ~ {dateRange.to.toLocaleDateString('ko-KR')})
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setVacationDialogOpen(false)}>
                취소
              </Button>
              <Button 
                onClick={handleVacationRequest}
                disabled={!dateRange?.from || !dateRange?.to}
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
