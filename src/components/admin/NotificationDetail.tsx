import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";

interface NotificationDetailProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

interface Lead {
  id: string;
  company: string | null;
  name: string;
  phone: string;
  email: string;
  created_at: string | null;
  status: string | null;
}

interface MatchingRequest {
  id: string;
  brand_name: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  created_at: string;
  status: string;
}

interface PauseRequest {
  id: string;
  start_date: string;
  end_date: string;
  pause_days: number;
  status: string;
  created_at: string;
  project: {
    id: string;
  } | null;
  profile: {
    name: string;
    company: string | null;
    phone: string | null;
    email: string;
  } | null;
}

interface VacationRequest {
  id: string;
  start_date: string;
  end_date: string;
  days_count: number;
  vacation_type: string;
  status: string;
  created_at: string;
  designer: {
    name: string;
    contact: string | null;
  } | null;
}

export const NotificationDetail = ({ activeTab, onTabChange }: NotificationDetailProps) => {
  const [newLeads, setNewLeads] = useState<Lead[]>([]);
  const [matchingRequests, setMatchingRequests] = useState<MatchingRequest[]>([]);
  const [pauseRequests, setPauseRequests] = useState<PauseRequest[]>([]);
  const [vacationRequests, setVacationRequests] = useState<VacationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'newLeads') {
        const { data } = await supabase
          .from("leads")
          .select("*")
          .eq("status", "new")
          .order("created_at", { ascending: false });
        setNewLeads(data || []);
      } else if (activeTab === 'inquiries') {
        const { data } = await supabase
          .from("matching_requests")
          .select("*")
          .eq("status", "pending")
          .order("created_at", { ascending: false });
        setMatchingRequests(data || []);
      } else if (activeTab === 'holdingRequests') {
        const { data } = await supabase
          .from("project_pause_requests")
          .select(`
            *,
            project:projects(id),
            profile:projects(user_id)
          `)
          .eq("status", "pending")
          .order("created_at", { ascending: false });
        
        // Fetch profile details for each pause request
        if (data) {
          const enrichedData = await Promise.all(data.map(async (item: any) => {
            if (item.project?.user_id) {
              const { data: profileData } = await supabase
                .from("profiles")
                .select("name, company, phone, email")
                .eq("id", item.project.user_id)
                .single();
              return { ...item, profile: profileData };
            }
            return { ...item, profile: null };
          }));
          setPauseRequests(enrichedData);
        }
      } else if (activeTab === 'vacationRequests') {
        const { data } = await supabase
          .from("vacation_requests")
          .select(`
            *,
            designer:designers(name, contact)
          `)
          .eq("status", "pending")
          .order("created_at", { ascending: false });
        setVacationRequests(data || []);
      }
    } catch (error) {
      console.error("Error loading notification data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return format(new Date(dateString), "yyyy. MM. dd");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">알림</h1>
      
      <Tabs value={activeTab} onValueChange={onTabChange}>
        <TabsList className="bg-muted/30 rounded-xl p-1.5 w-full grid grid-cols-4 h-auto border border-border/50">
          <TabsTrigger 
            value="newLeads"
            className="rounded-lg py-3 text-sm font-medium data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm"
          >
            신규상담
          </TabsTrigger>
          <TabsTrigger 
            value="inquiries"
            className="rounded-lg py-3 text-sm font-medium data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm"
          >
            문의요청
          </TabsTrigger>
          <TabsTrigger 
            value="holdingRequests"
            className="rounded-lg py-3 text-sm font-medium data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm"
          >
            홀딩요청
          </TabsTrigger>
          <TabsTrigger 
            value="vacationRequests"
            className="rounded-lg py-3 text-sm font-medium data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm"
          >
            휴가요청
          </TabsTrigger>
        </TabsList>

        <TabsContent value="newLeads" className="mt-6">
          {isLoading ? (
            <div className="text-muted-foreground py-8 text-center">로딩 중...</div>
          ) : newLeads.length === 0 ? (
            <div className="text-muted-foreground py-8 text-center">신규 상담이 없습니다.</div>
          ) : (
            <div className="space-y-0">
              {newLeads.map((lead, index) => (
                <div 
                  key={lead.id} 
                  className={`py-6 ${index !== newLeads.length - 1 ? 'border-b border-border/30' : ''}`}
                >
                  <h3 className="font-semibold text-lg mb-3">신규 상담이 도착했습니다.</h3>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>회사명: {lead.company || "-"}</p>
                    <p>이름: {lead.name}</p>
                    <p>연락처: {lead.phone}</p>
                    <p>이메일: {lead.email}</p>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">{formatDate(lead.created_at)}</p>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="inquiries" className="mt-6">
          {isLoading ? (
            <div className="text-muted-foreground py-8 text-center">로딩 중...</div>
          ) : matchingRequests.length === 0 ? (
            <div className="text-muted-foreground py-8 text-center">문의 요청이 없습니다.</div>
          ) : (
            <div className="space-y-0">
              {matchingRequests.map((request, index) => (
                <div 
                  key={request.id} 
                  className={`py-6 ${index !== matchingRequests.length - 1 ? 'border-b border-border/30' : ''}`}
                >
                  <h3 className="font-semibold text-lg mb-3">새로운 매칭요청이 도착했습니다.</h3>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>브랜드명: {request.brand_name || "-"}</p>
                    <p>이름: {request.contact_name || "-"}</p>
                    <p>연락처: {request.contact_phone || "-"}</p>
                    <p>이메일: {request.contact_email || "-"}</p>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">{formatDate(request.created_at)}</p>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="holdingRequests" className="mt-6">
          {isLoading ? (
            <div className="text-muted-foreground py-8 text-center">로딩 중...</div>
          ) : pauseRequests.length === 0 ? (
            <div className="text-muted-foreground py-8 text-center">홀딩 요청이 없습니다.</div>
          ) : (
            <div className="space-y-0">
              {pauseRequests.map((request, index) => (
                <div 
                  key={request.id} 
                  className={`py-6 ${index !== pauseRequests.length - 1 ? 'border-b border-border/30' : ''}`}
                >
                  <h3 className="font-semibold text-lg mb-3">프로젝트 홀딩 요청이 도착했습니다.</h3>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>회사명: {request.profile?.company || "-"}</p>
                    <p>이름: {request.profile?.name || "-"}</p>
                    <p>연락처: {request.profile?.phone || "-"}</p>
                    <p>이메일: {request.profile?.email || "-"}</p>
                    <p>홀딩 기간: {formatDate(request.start_date)} ~ {formatDate(request.end_date)} ({request.pause_days}일)</p>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">{formatDate(request.created_at)}</p>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="vacationRequests" className="mt-6">
          {isLoading ? (
            <div className="text-muted-foreground py-8 text-center">로딩 중...</div>
          ) : vacationRequests.length === 0 ? (
            <div className="text-muted-foreground py-8 text-center">휴가 요청이 없습니다.</div>
          ) : (
            <div className="space-y-0">
              {vacationRequests.map((request, index) => (
                <div 
                  key={request.id} 
                  className={`py-6 ${index !== vacationRequests.length - 1 ? 'border-b border-border/30' : ''}`}
                >
                  <h3 className="font-semibold text-lg mb-3">휴가 요청이 도착했습니다.</h3>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>디자이너: {request.designer?.name || "-"}</p>
                    <p>연락처: {request.designer?.contact || "-"}</p>
                    <p>휴가 유형: {request.vacation_type}</p>
                    <p>휴가 기간: {formatDate(request.start_date)} ~ {formatDate(request.end_date)} ({request.days_count}일)</p>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">{formatDate(request.created_at)}</p>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
