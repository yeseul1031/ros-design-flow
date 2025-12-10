import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CalendarDays, Plus } from "lucide-react";
import type { User } from "@supabase/supabase-js";

interface VacationRequest {
  id: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

const VacationManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [vacationRequests, setVacationRequests] = useState<VacationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

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

      // Mock vacation requests data (replace with actual DB query)
      setVacationRequests([
        {
          id: "1",
          start_date: "2025-01-15",
          end_date: "2025-01-17",
          reason: "개인 사유",
          status: "approved",
          created_at: "2025-01-01"
        },
        {
          id: "2",
          start_date: "2025-02-10",
          end_date: "2025-02-12",
          reason: "가족 여행",
          status: "pending",
          created_at: "2025-01-05"
        }
      ]);

    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500">승인됨</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">대기중</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500">거절됨</Badge>;
      default:
        return <Badge>{status}</Badge>;
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
    <DashboardLayout 
      profile={profile}
      annualLeave={{ used: 12, total: 15 }}
      joinDate="2025-01-12"
      notificationCount={2}
      projectCount={4}
    >
      <div className="p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">휴가 관리</h1>
            <p className="text-muted-foreground">연차 신청 및 관리를 할 수 있습니다.</p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            휴가 신청
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Calendar Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                휴가 달력
              </CardTitle>
              <CardDescription>날짜를 선택하여 휴가를 확인하세요</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          {/* Vacation Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle>연차 현황</CardTitle>
              <CardDescription>올해 연차 사용 현황</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">총 연차</span>
                  <span className="font-semibold">15일</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">사용한 연차</span>
                  <span className="font-semibold text-accent">12일</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">남은 연차</span>
                  <span className="font-semibold text-green-600">3일</span>
                </div>
              </div>
              <div className="w-full bg-secondary rounded-full h-3">
                <div 
                  className="bg-accent h-3 rounded-full transition-all" 
                  style={{ width: `${(12 / 15) * 100}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Vacation Requests List */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>휴가 신청 내역</CardTitle>
            <CardDescription>최근 휴가 신청 내역을 확인하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {vacationRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-[#F7F7FB]/45 transition-colors cursor-pointer"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-semibold">
                        {new Date(request.start_date).toLocaleDateString('ko-KR')} ~ {new Date(request.end_date).toLocaleDateString('ko-KR')}
                      </p>
                      {getStatusBadge(request.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">{request.reason}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    신청일: {new Date(request.created_at).toLocaleDateString('ko-KR')}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default VacationManagement;
