import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { toast } from "sonner";
import { X } from "lucide-react";

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

interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  category: string;
  status: string;
  created_at: string;
  profile: {
    name: string;
    company: string | null;
    email: string;
  } | null;
}

interface PauseRequest {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  pause_days: number;
  status: string;
  created_at: string;
  project: {
    id: string;
    user_id: string;
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
  const navigate = useNavigate();
  const [newLeads, setNewLeads] = useState<Lead[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [pauseRequests, setPauseRequests] = useState<PauseRequest[]>([]);
  const [vacationRequests, setVacationRequests] = useState<VacationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Vacation request dialog state
  const [selectedVacation, setSelectedVacation] = useState<VacationRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

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
        // Fetch support tickets (excluding vacation requests)
        const { data } = await supabase
          .from("support_tickets")
          .select("*")
          .neq("category", "휴가신청")
          .order("created_at", { ascending: false });
        
        if (data) {
          // Fetch profile details for each ticket
          const enrichedData = await Promise.all(data.map(async (ticket) => {
            const { data: profileData } = await supabase
              .from("profiles")
              .select("name, company, email")
              .eq("id", ticket.user_id)
              .maybeSingle();
            return { ...ticket, profile: profileData };
          }));
          setSupportTickets(enrichedData);
        }
      } else if (activeTab === 'holdingRequests') {
        const { data } = await supabase
          .from("project_pause_requests")
          .select(`
            *,
            project:projects(id, user_id)
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
                .maybeSingle();
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

  const handleLeadClick = () => {
    // Navigate to leads tab using window.location for reliable navigation
    window.location.href = `/admin?tab=leads`;
  };

  const handleTicketClick = (userId: string) => {
    navigate(`/admin/customers/${userId}`);
  };

  const handlePauseRequestClick = (userId: string) => {
    navigate(`/admin/customers/${userId}`);
  };

  const handleVacationClick = (request: VacationRequest) => {
    setSelectedVacation(request);
    setRejectionReason("");
  };

  const handleApproveVacation = async () => {
    if (!selectedVacation) return;
    
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from("vacation_requests")
        .update({ status: "approved" })
        .eq("id", selectedVacation.id);
      
      if (error) throw error;
      
      toast.success("휴가가 승인되었습니다.");
      setSelectedVacation(null);
      loadData();
    } catch (error) {
      console.error("Error approving vacation:", error);
      toast.error("휴가 승인에 실패했습니다.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectVacation = async () => {
    if (!selectedVacation) return;
    
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from("vacation_requests")
        .update({ status: "rejected" })
        .eq("id", selectedVacation.id);
      
      if (error) throw error;
      
      toast.success("휴가가 거절되었습니다.");
      setSelectedVacation(null);
      loadData();
    } catch (error) {
      console.error("Error rejecting vacation:", error);
      toast.error("휴가 거절에 실패했습니다.");
    } finally {
      setIsProcessing(false);
    }
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
                  className={`py-5 cursor-pointer hover:bg-muted/30 rounded-lg px-2 -mx-2 transition-colors ${index !== newLeads.length - 1 ? 'border-b border-border/30' : ''}`}
                  onClick={handleLeadClick}
                >
                  <h3 className="font-semibold text-sm mb-3">신규 상담이 도착했습니다.</h3>
                  <div className="space-y-0.5 text-xs text-muted-foreground">
                    <p>회사명: {lead.company || "-"}</p>
                    <p>이름: {lead.name}</p>
                    <p>연락처: {lead.phone}</p>
                    <p>이메일: {lead.email}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">{formatDate(lead.created_at)}</p>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="inquiries" className="mt-6">
          {isLoading ? (
            <div className="text-muted-foreground py-8 text-center text-sm">로딩 중...</div>
          ) : supportTickets.length === 0 ? (
            <div className="text-muted-foreground py-8 text-center text-sm">문의 요청이 없습니다.</div>
          ) : (
            <div className="space-y-0 px-4">
              {supportTickets.map((ticket, index) => (
                <div 
                  key={ticket.id} 
                  className={`py-5 cursor-pointer hover:bg-muted/30 rounded-lg px-2 -mx-2 transition-colors ${index !== supportTickets.length - 1 ? 'border-b border-border/30' : ''}`}
                  onClick={() => handleTicketClick(ticket.user_id)}
                >
                  <h3 className="font-medium text-sm mb-2">
                    '{ticket.profile?.company || ticket.profile?.name}' 님의 문의가 도착했습니다.
                  </h3>
                  <p className="text-xs text-muted-foreground mb-1">
                    제목: {ticket.subject}
                  </p>
                  <p className="text-xs text-muted-foreground mb-1 line-clamp-2">
                    내용: {ticket.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">{formatDate(ticket.created_at)}</p>
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
                  className={`py-5 cursor-pointer hover:bg-muted/30 rounded-lg px-2 -mx-2 transition-colors ${index !== pauseRequests.length - 1 ? 'border-b border-border/30' : ''}`}
                  onClick={() => request.project?.user_id && handlePauseRequestClick(request.project.user_id)}
                >
                  <h3 className="font-medium text-sm mb-2">{request.profile?.company || request.profile?.name} 홀딩 요청이 도착했습니다.</h3>
                  <p className="text-xs text-muted-foreground mb-1">
                    고객명: {request.profile?.name || "-"} | 연락처: {request.profile?.phone || "-"}
                  </p>
                  <p className="text-xs text-muted-foreground mb-1">
                    기간: {formatDate(request.start_date)} - {formatDate(request.end_date)} ({request.pause_days}일)
                  </p>
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
                  className={`py-5 cursor-pointer hover:bg-muted/30 rounded-lg px-2 -mx-2 transition-colors ${index !== vacationRequests.length - 1 ? 'border-b border-border/30' : ''}`}
                  onClick={() => handleVacationClick(request)}
                >
                  <h3 className="font-medium text-sm mb-2">{request.designer?.name}님이 휴가를 신청했습니다.</h3>
                  <p className="text-xs text-muted-foreground mb-1">
                    기간: {formatDate(request.start_date)} - {formatDate(request.end_date)} ({request.vacation_type})
                  </p>
                  <p className="text-xs text-muted-foreground">상태: 대기중</p>
                  <p className="text-xs text-muted-foreground mt-2">{formatDate(request.created_at)}</p>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Vacation Request Dialog */}
      <Dialog open={!!selectedVacation} onOpenChange={(open) => !open && setSelectedVacation(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">휴가요청</DialogTitle>
          </DialogHeader>
          {selectedVacation && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-base mb-2">{selectedVacation.designer?.name}</h3>
                <p className="text-sm text-muted-foreground">
                  기간: {formatDate(selectedVacation.start_date)} - {formatDate(selectedVacation.end_date)} ({selectedVacation.vacation_type})
                </p>
                <p className="text-sm text-muted-foreground">상태: 대기중</p>
                <p className="text-sm text-muted-foreground mt-2">{formatDate(selectedVacation.created_at)}</p>
              </div>
              
              <Textarea
                placeholder="휴가 거절 시 사유를 입력해주세요."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="min-h-[100px]"
              />
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleRejectVacation}
                  disabled={isProcessing}
                >
                  거절
                </Button>
                <Button
                  className="flex-1 bg-primary hover:bg-primary/90"
                  onClick={handleApproveVacation}
                  disabled={isProcessing}
                >
                  승인
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};