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
        <div className="bg-muted/30 rounded-xl border border-border/50 p-1.5">
          <TabsList className="w-full grid grid-cols-4 bg-transparent h-auto p-0">
            <TabsTrigger 
              value="newLeads"
              className="rounded-lg py-3 text-sm font-medium bg-transparent data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm text-muted-foreground"
            >
              신규상담
            </TabsTrigger>
            <TabsTrigger 
              value="inquiries"
              className="rounded-lg py-3 text-sm font-medium bg-transparent data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm text-muted-foreground"
            >
              문의요청
            </TabsTrigger>
            <TabsTrigger 
              value="holdingRequests"
              className="rounded-lg py-3 text-sm font-medium bg-transparent data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm text-muted-foreground"
            >
              홀딩요청
            </TabsTrigger>
            <TabsTrigger 
              value="vacationRequests"
              className="rounded-lg py-3 text-sm font-medium bg-transparent data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm text-muted-foreground"
            >
              휴가요청
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="newLeads" className="mt-6">
          {isLoading ? (
            <div className="text-muted-foreground py-8 text-center text-sm">로딩 중...</div>
          ) : newLeads.length === 0 ? (
            <div className="text-muted-foreground py-8 text-center text-sm">신규 상담이 없습니다.</div>
          ) : (
            <div className="space-y-0 px-4">
              {newLeads.map((lead, index) => (
                <div 
                  key={lead.id} 
                  className={`py-5 ${index !== newLeads.length - 1 ? 'border-b border-border/30' : ''}`}
                >
                  <h3 className="font-medium text-sm mb-2">{lead.company || lead.name} 신규 상담이 도착했습니다.</h3>
                  <p className="text-xs text-muted-foreground mb-1">이름: {lead.name} | 연락처: {lead.phone}</p>
                  <p className="text-xs text-muted-foreground">상태: 신규</p>
                  <p className="text-xs text-muted-foreground mt-2">{formatDate(lead.created_at)}</p>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="inquiries" className="mt-6">
          {isLoading ? (
            <div className="text-muted-foreground py-8 text-center text-sm">로딩 중...</div>
          ) : matchingRequests.length === 0 ? (
            <div className="text-muted-foreground py-8 text-center text-sm">문의 요청이 없습니다.</div>
          ) : (
            <div className="space-y-0 px-4">
              {matchingRequests.map((request, index) => (
                <div 
                  key={request.id} 
                  className={`py-5 ${index !== matchingRequests.length - 1 ? 'border-b border-border/30' : ''}`}
                >
                  <h3 className="font-medium text-sm mb-2">{request.brand_name || request.contact_name} 매칭요청이 도착했습니다.</h3>
                  <p className="text-xs text-muted-foreground mb-1">이름: {request.contact_name || "-"} | 연락처: {request.contact_phone || "-"}</p>
                  <p className="text-xs text-muted-foreground">상태: 대기중</p>
                  <p className="text-xs text-muted-foreground mt-2">{formatDate(request.created_at)}</p>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="holdingRequests" className="mt-6">
          {isLoading ? (
            <div className="text-muted-foreground py-8 text-center text-sm">로딩 중...</div>
          ) : pauseRequests.length === 0 ? (
            <div className="text-muted-foreground py-8 text-center text-sm">홀딩 요청이 없습니다.</div>
          ) : (
            <div className="space-y-0 px-4">
              {pauseRequests.map((request, index) => (
                <div 
                  key={request.id} 
                  className={`py-5 ${index !== pauseRequests.length - 1 ? 'border-b border-border/30' : ''}`}
                >
                  <h3 className="font-medium text-sm mb-2">{request.profile?.company || request.profile?.name} 홀딩 요청이 도착했습니다.</h3>
                  <p className="text-xs text-muted-foreground mb-1">기간: {formatDate(request.start_date)} - {formatDate(request.end_date)} ({request.pause_days}일)</p>
                  <p className="text-xs text-muted-foreground">상태: 대기중</p>
                  <p className="text-xs text-muted-foreground mt-2">{formatDate(request.created_at)}</p>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="vacationRequests" className="mt-6">
          {isLoading ? (
            <div className="text-muted-foreground py-8 text-center text-sm">로딩 중...</div>
          ) : vacationRequests.length === 0 ? (
            <div className="text-muted-foreground py-8 text-center text-sm">휴가 요청이 없습니다.</div>
          ) : (
            <div className="space-y-0 px-4">
              {vacationRequests.map((request, index) => (
                <div 
                  key={request.id} 
                  className={`py-5 ${index !== vacationRequests.length - 1 ? 'border-b border-border/30' : ''}`}
                >
                  <h3 className="font-medium text-sm mb-2">{request.designer?.name} 휴가 요청이 도착했습니다.</h3>
                  <p className="text-xs text-muted-foreground mb-1">기간: {formatDate(request.start_date)} - {formatDate(request.end_date)} ({request.days_count}일)</p>
                  <p className="text-xs text-muted-foreground">상태: 대기중</p>
                  <p className="text-xs text-muted-foreground mt-2">{formatDate(request.created_at)}</p>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};