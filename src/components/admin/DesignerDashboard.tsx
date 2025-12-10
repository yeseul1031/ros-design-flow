import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Bell, ChevronRight, ChevronLeft } from "lucide-react";
import { DateRange } from "react-day-picker";
import { differenceInDays, format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isWeekend, isSameMonth } from "date-fns";
import { ko } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import logo from "@/assets/logo.jpeg";

type ViewType = 'main' | 'vacation' | 'projects';
type VacationTab = 'request' | 'history';
type ProjectTab = 'active' | 'holding';
type VacationType = 'morning_half' | 'afternoon_half' | 'full_day';

export const DesignerDashboard = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [designerInfo, setDesignerInfo] = useState<any>(null);
  const [bookedDates, setBookedDates] = useState<Date[]>([]);
  const [myVacations, setMyVacations] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'announcements'>('dashboard');
  const [currentView, setCurrentView] = useState<ViewType>('main');
  const [vacationTab, setVacationTab] = useState<VacationTab>('request');
  const [projectTab, setProjectTab] = useState<ProjectTab>('active');
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [vacationType, setVacationType] = useState<VacationType>('full_day');
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

    const { data: ownDesigner } = await supabase
      .from("designers")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    setDesignerInfo(ownDesigner);

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
        .select("*, designers(name)")
        .in("assigned_designer_id", candidateDesignerIds)
        .order("created_at", { ascending: false });

      if (!error) {
        projectsData = data || [];
      }
    }

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

    const { data: notificationsData } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setNotifications(notificationsData || []);

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

  const getVacationTypeText = (type: VacationType) => {
    switch (type) {
      case 'morning_half': return '오전반차';
      case 'afternoon_half': return '오후반차';
      case 'full_day': return '연차';
    }
  };

  const getVacationDaysCount = (type: VacationType, dateCount: number) => {
    if (type === 'morning_half' || type === 'afternoon_half') {
      return 0.5 * dateCount;
    }
    return dateCount;
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

    const endDate = dateRange.to || dateRange.from;
    const dateCount = differenceInDays(endDate, dateRange.from) + 1;
    const days = getVacationDaysCount(vacationType, dateCount);
    const vacationTypeText = `${getVacationTypeText(vacationType)} (${days}일)`;
    
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

      const { error: vacationError } = await supabase.from("vacation_requests").insert({
        designer_id: designer.id,
        user_id: user.id,
        start_date: dateRange.from.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        vacation_type: vacationType,
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
      setDateRange(undefined);
      setVacationType('full_day');
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

  const unreadAnnouncementCount = notifications.filter(n => !n.is_read && n.title.startsWith('[공지]')).length;
  const activeProjectCount = projects.filter(p => p.status === 'active' || p.status === 'expiring_soon').length;
  const holdingProjectCount = projects.filter(p => p.status === 'paused' || p.status === 'on_hold').length;

  // Custom calendar for vacation view
  const renderCustomCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    const startDayOfWeek = getDay(monthStart);
    const emptyDays = Array(startDayOfWeek).fill(null);
    
    const selectedDays = dateRange?.from && dateRange?.to 
      ? eachDayOfInterval({ start: dateRange.from, end: dateRange.to })
      : dateRange?.from 
        ? [dateRange.from]
        : [];

    const handleDayClick = (day: Date) => {
      if (!dateRange?.from) {
        setDateRange({ from: day, to: undefined });
      } else if (!dateRange?.to) {
        if (day < dateRange.from) {
          setDateRange({ from: day, to: dateRange.from });
        } else {
          setDateRange({ from: dateRange.from, to: day });
        }
      } else {
        setDateRange({ from: day, to: undefined });
      }
    };

    const isInRange = (day: Date) => {
      if (!dateRange?.from || !dateRange?.to) return false;
      return day >= dateRange.from && day <= dateRange.to;
    };

    const isRangeStart = (day: Date) => dateRange?.from && isSameDay(day, dateRange.from);
    const isRangeEnd = (day: Date) => dateRange?.to && isSameDay(day, dateRange.to);

    return (
      <div className="border rounded-lg p-6">
        {/* Month Navigation */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            <ChevronLeft className="h-5 w-5 text-muted-foreground" />
          </button>
          <span className="text-lg font-medium">
            {format(currentMonth, 'yyyy. MM', { locale: ko })}
          </span>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['일', '월', '화', '수', '목', '금', '토'].map((day, i) => (
            <div key={day} className={`text-center text-sm py-2 ${i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-muted-foreground'}`}>
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1">
          {emptyDays.map((_, i) => (
            <div key={`empty-${i}`} className="h-10" />
          ))}
          {daysInMonth.map((day) => {
            const dayOfWeek = getDay(day);
            const isSelected = selectedDays.some(d => isSameDay(d, day));
            const inRange = isInRange(day);
            const isStart = isRangeStart(day);
            const isEnd = isRangeEnd(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isToday = isSameDay(day, new Date());

            return (
              <button
                key={day.toISOString()}
                onClick={() => handleDayClick(day)}
                className={`
                  h-10 text-sm relative flex items-center justify-center transition-colors
                  ${!isCurrentMonth ? 'text-muted-foreground/50' : ''}
                  ${dayOfWeek === 0 ? 'text-red-500' : dayOfWeek === 6 ? 'text-blue-500' : ''}
                  ${inRange && !isSelected ? 'bg-primary/10' : ''}
                  ${isSelected ? 'bg-primary text-primary-foreground rounded-full' : ''}
                  ${isToday && !isSelected ? 'font-bold' : ''}
                  hover:bg-muted
                `}
              >
                {format(day, 'd')}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const selectedDaysCount = dateRange?.from && dateRange?.to 
    ? differenceInDays(dateRange.to, dateRange.from) + 1
    : dateRange?.from ? 1 : 0;

  // Vacation Management View
  if (currentView === 'vacation') {
    return (
      <div className="min-h-screen bg-white">
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
              onClick={() => { setCurrentView('main'); setActiveTab('dashboard'); }}
              className="pb-3 text-sm font-medium transition-colors relative text-primary"
            >
              대시보드
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            </button>
            <button
              onClick={() => { setCurrentView('main'); setActiveTab('announcements'); }}
              className="pb-3 text-sm font-medium transition-colors relative text-muted-foreground hover:text-foreground"
            >
              공지사항
            </button>
          </div>

          {/* Title */}
          <h1 className="text-xl font-bold mb-6">휴가관리</h1>

          {/* Vacation Tabs - Box Style */}
          <div className="bg-muted rounded-lg p-1 mb-6">
            <div className="flex">
              <button
                onClick={() => setVacationTab('request')}
                className={`flex-1 py-3 text-sm font-medium rounded-md transition-colors ${
                  vacationTab === 'request'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                휴가 신청
              </button>
              <button
                onClick={() => setVacationTab('history')}
                className={`flex-1 py-3 text-sm font-medium rounded-md transition-colors ${
                  vacationTab === 'history'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                신청 내역
              </button>
            </div>
          </div>

          {vacationTab === 'request' && (
            <div className="space-y-6">
              {renderCustomCalendar()}

              {/* Vacation Type Selection */}
              <div className="flex gap-2">
                <button
                  onClick={() => setVacationType('morning_half')}
                  className={`flex-1 py-3 text-sm font-medium rounded-lg border transition-colors ${
                    vacationType === 'morning_half'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border text-muted-foreground hover:border-primary/50'
                  }`}
                >
                  오전반차
                </button>
                <button
                  onClick={() => setVacationType('afternoon_half')}
                  className={`flex-1 py-3 text-sm font-medium rounded-lg border transition-colors ${
                    vacationType === 'afternoon_half'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border text-muted-foreground hover:border-primary/50'
                  }`}
                >
                  오후반차
                </button>
                <button
                  onClick={() => setVacationType('full_day')}
                  className={`flex-1 py-3 text-sm font-medium rounded-lg border transition-colors ${
                    vacationType === 'full_day'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border text-muted-foreground hover:border-primary/50'
                  }`}
                >
                  연차
                </button>
              </div>

              <div className="flex items-center justify-between">
                <Badge variant="outline" className="rounded-full px-4 py-2 text-sm">
                  {getVacationDaysCount(vacationType, selectedDaysCount)}일 {getVacationTypeText(vacationType)}
                </Badge>
                <Button 
                  onClick={handleVacationRequest}
                  disabled={selectedDaysCount === 0}
                  className="bg-primary hover:bg-primary/90"
                >
                  신청하기
                </Button>
              </div>
            </div>
          )}

          {vacationTab === 'history' && (
            <div className="space-y-4">
              {myVacations.length > 0 ? (
                myVacations.map((vacation) => (
                  <div key={vacation.id} className="border-b pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {vacation.vacation_type === 'morning_half' ? '오전반차' :
                           vacation.vacation_type === 'afternoon_half' ? '오후반차' :
                           vacation.vacation_type === 'half_day' ? '반차' : '연차'} ({vacation.days_count}일)
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(vacation.start_date).toLocaleDateString('ko-KR')}
                          {vacation.start_date !== vacation.end_date && 
                            ` ~ ${new Date(vacation.end_date).toLocaleDateString('ko-KR')}`}
                        </p>
                      </div>
                      <Badge variant={
                        vacation.status === 'approved' ? 'default' :
                        vacation.status === 'rejected' ? 'destructive' : 'secondary'
                      }>
                        {vacation.status === 'approved' ? '승인' :
                         vacation.status === 'rejected' ? '반려' : '대기'}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">신청 내역이 없습니다.</p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Projects View
  if (currentView === 'projects') {
    const filteredProjects = projectTab === 'active' 
      ? projects.filter(p => p.status === 'active' || p.status === 'expiring_soon')
      : projects.filter(p => p.status === 'paused' || p.status === 'on_hold');

    return (
      <div className="min-h-screen bg-white">
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
              onClick={() => { setCurrentView('main'); setActiveTab('dashboard'); }}
              className="pb-3 text-sm font-medium transition-colors relative text-primary"
            >
              대시보드
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            </button>
            <button
              className="pb-3 text-sm font-medium transition-colors relative text-muted-foreground hover:text-foreground"
            >
              공지사항
            </button>
          </div>

          {/* Title */}
          <h1 className="text-xl font-bold mb-6">프로젝트</h1>

          {/* Project Tabs - Box Style */}
          <div className="bg-muted rounded-lg p-1 mb-6">
            <div className="flex">
              <button
                onClick={() => setProjectTab('active')}
                className={`flex-1 py-3 text-sm font-medium rounded-md transition-colors ${
                  projectTab === 'active'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                진행 중
              </button>
              <button
                onClick={() => setProjectTab('holding')}
                className={`flex-1 py-3 text-sm font-medium rounded-md transition-colors ${
                  projectTab === 'holding'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                홀딩
              </button>
            </div>
          </div>

          {/* Projects List */}
          <div className="space-y-0">
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <div key={project.id} className="border-b py-6">
                  <h3 className="font-bold mb-2">
                    {project.profiles?.company || project.profiles?.name || '프로젝트'} 웹페이지 리뉴얼
                  </h3>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>디자이너: {project.designers?.name || designerInfo?.name || '홍예진'}</p>
                    <p>홀딩 횟수: {project.pause_count || 0}/2</p>
                    <p>일시 중지 횟수: {project.paused_days || 0}일</p>
                  </div>
                  <p className="text-sm text-muted-foreground mt-3">
                    {new Date(project.start_date).toLocaleDateString('ko-KR').replace(/\./g, '. ')} ~ {new Date(project.end_date).toLocaleDateString('ko-KR').replace(/\./g, '. ')}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                {projectTab === 'active' ? '진행 중인 프로젝트가 없습니다.' : '홀딩 중인 프로젝트가 없습니다.'}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Main Dashboard View
  return (
    <div className="min-h-screen bg-white">
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
                    onClick={() => setCurrentView('vacation')}
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
                  onClick={() => setCurrentView('projects')}
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
          <div className="divide-y">
            {announcements.length > 0 ? (
              announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="py-6 first:pt-0 cursor-pointer hover:bg-muted/30 transition-colors -mx-4 px-4"
                  onClick={() => setSelectedNotification({
                    title: announcement.title,
                    fullContent: announcement.content,
                    imageUrl: announcement.image_url,
                    created_at: announcement.created_at
                  })}
                >
                  {/* Title with badge */}
                  <div className="flex items-center gap-2 mb-2">
                    {announcement.is_pinned && (
                      <Badge 
                        variant="outline" 
                        className="text-xs border-primary text-primary bg-transparent font-medium px-2 py-0.5"
                      >
                        중요
                      </Badge>
                    )}
                    <h3 className="font-medium text-foreground">
                      [{announcement.category}] {announcement.title}
                    </h3>
                  </div>

                  {/* Content preview */}
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {announcement.content}
                  </p>

                  {/* Image if exists */}
                  {announcement.image_url && (
                    <div className="mb-3">
                      <img 
                        src={announcement.image_url} 
                        alt={announcement.title}
                        className="max-w-md rounded-lg"
                      />
                    </div>
                  )}

                  {/* Date */}
                  <p className="text-sm text-muted-foreground">
                    {new Date(announcement.created_at).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit'
                    }).replace(/\./g, '.').replace(/ /g, '')}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">공지사항이 없습니다.</p>
            )}
          </div>
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
      </div>
    </div>
  );
};
