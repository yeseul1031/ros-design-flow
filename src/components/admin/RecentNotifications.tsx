import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Bell, AlertCircle, MessageSquare, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export const RecentNotifications = () => {
  const navigate = useNavigate();
  const [pauseRequests, setPauseRequests] = useState<any[]>([]);
  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [newLeads, setNewLeads] = useState<any[]>([]);
  const [profilesMap, setProfilesMap] = useState<Record<string, any>>({});
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadNotifications();

    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "leads" },
        () => loadNotifications()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleApprove = async (requestId: string) => {
    try {
      // Update support_tickets
      const { error: ticketError } = await supabase
        .from("support_tickets")
        .update({ status: "resolved" })
        .eq("id", requestId);

      if (ticketError) throw ticketError;

      // Update vacation_requests to trigger the vacation days deduction
      const { error: vacationError } = await supabase
        .from("vacation_requests")
        .update({ status: "approved" })
        .eq("user_id", selectedRequest.user_id)
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(1);

      if (vacationError) throw vacationError;

      toast({
        title: "승인 완료",
        description: "요청이 승인되었습니다.",
      });

      setSelectedRequest(null);
      loadNotifications();
    } catch (error: any) {
      toast({
        title: "오류 발생",
        description: error.message || "승인에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast({
        title: "입력 오류",
        description: "거절 사유를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("support_tickets")
        .update({ 
          status: "resolved",
          message: `${selectedRequest.message}\n\n[거절 사유]\n${rejectionReason}`
        })
        .eq("id", selectedRequest.id);

      if (error) throw error;

      toast({
        title: "거절 완료",
        description: "요청이 거절되었습니다.",
      });

      setSelectedRequest(null);
      setRejectionReason("");
      loadNotifications();
    } catch (error: any) {
      toast({
        title: "오류 발생",
        description: error.message || "거절에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const loadNotifications = async () => {
    try {
      // 휴가신청 티켓만 근태관리
      const { data: vacationTickets, error: vacationErr } = await supabase
        .from("support_tickets")
        .select("*")
        .eq("status", "open")
        .eq("category", "휴가신청")
        .order("created_at", { ascending: false })
        .limit(20);
      if (vacationErr) throw vacationErr;

      // 프로젝트 홀딩 요청 (프로젝트 관련 문의로 이동)
      const { data: pauseData, error: pauseErr } = await supabase
        .from("project_pause_requests")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(20);
      if (pauseErr) throw pauseErr;

      // 프로젝트 관련 문의 (휴가신청 제외) + 프로젝트 홀딩
      const { data: ticketData, error: ticketErr } = await supabase
        .from("support_tickets")
        .select("*")
        .eq("status", "open")
        .neq("category", "휴가신청")
        .order("created_at", { ascending: false })
        .limit(20);
      if (ticketErr) throw ticketErr;

      // 신규 상담 (최근 24시간)
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      const { data: leadsData, error: leadsErr } = await supabase
        .from("leads")
        .select("*")
        .eq("status", "new")
        .gte("created_at", oneDayAgo.toISOString())
        .order("created_at", { ascending: false })
        .limit(20);
      if (leadsErr) throw leadsErr;

      // 프로필 맵 구성 (pause/ticket 항목용)
      const userIds = Array.from(
        new Set([
          ...((pauseData || []).map((p: any) => p.user_id).filter(Boolean)),
          ...((vacationTickets || []).map((t: any) => t.user_id).filter(Boolean)),
          ...((ticketData || []).map((t: any) => t.user_id).filter(Boolean)),
        ])
      );
      let map: Record<string, any> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, name, email")
          .in("id", userIds);
        map = Object.fromEntries((profiles || []).map((p: any) => [p.id, p]));
      }

      setProfilesMap(map);
      // 근태관리 = 휴가신청 티켓만
      setPauseRequests(vacationTickets || []);
      // 프로젝트 관련 문의 = 일반 티켓 + 프로젝트 홀딩 요청
      setSupportTickets([...(ticketData || []), ...(pauseData || [])]);
      setNewLeads(leadsData || []);
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  };

  const sections = [
    {
      key: "leads",
      icon: <Bell className="h-4 w-4 text-primary" />,
      title: "신규 상담문의",
      count: newLeads.length,
      content: (
        <div className="space-y-2">
          {newLeads.map((lead) => (
            <div key={lead.id} className="border rounded-lg p-3 bg-primary/5 hover:bg-primary/10 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{lead.name} <span className="text-xs text-muted-foreground">({lead.email})</span></p>
                  <p className="text-sm text-muted-foreground">{lead.phone}</p>
                  {lead.message && (
                    <p className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap">{lead.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">{new Date(lead.created_at).toLocaleString("ko-KR")}</p>
                </div>
                <Badge className="bg-primary">신규</Badge>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      key: "pause",
      icon: <AlertCircle className="h-4 w-4" />,
      title: "근태관련 요청",
      count: pauseRequests.length,
      content: (
        <div className="space-y-2">
          {pauseRequests.map((req) => (
            <div 
              key={req.id} 
              className="border rounded-lg p-3 hover:bg-accent/50 transition-colors cursor-pointer"
              onClick={() => setSelectedRequest(req)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{profilesMap[req.user_id]?.name || "-"}</p>
                  <p className="text-sm text-muted-foreground">
                    {req.subject || "휴가 신청"}
                  </p>
                  {req.message && (
                    <p className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap">{req.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">{new Date(req.created_at).toLocaleString("ko-KR")}</p>
                </div>
                <Badge variant="secondary">대기중</Badge>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      key: "tickets",
      icon: <MessageSquare className="h-4 w-4" />,
      title: "프로젝트 관련 문의",
      count: supportTickets.length,
      content: (
        <div className="space-y-2">
          {supportTickets.map((item) => (
            <div 
              key={item.id} 
              className="border rounded-lg p-3 hover:bg-accent/50 transition-colors cursor-pointer"
              onClick={() => item.user_id && navigate(`/admin/customers/${item.user_id}`)}
            >
              <div className="flex items-start justify-between">
                <div className="w-full">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">{item.pause_days ? "홀딩요청" : item.category}</Badge>
                  </div>
                  <p className="font-medium">{profilesMap[item.user_id]?.name || "-"}</p>
                  {item.pause_days ? (
                    // 프로젝트 홀딩 요청
                    <p className="text-sm text-muted-foreground mt-1">
                      프로젝트 홀딩: {new Date(item.start_date).toLocaleDateString("ko-KR")} ~ {new Date(item.end_date).toLocaleDateString("ko-KR")} ({item.pause_days}일)
                    </p>
                  ) : (
                    // 일반 티켓
                    <p className="text-sm text-muted-foreground mt-1">{item.subject}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">{new Date(item.created_at).toLocaleString("ko-KR")}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ),
    },
  ];

  const total = sections.reduce((sum, s) => sum + s.count, 0);
  if (total === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>새로운 알림이 없습니다.</p>
      </div>
    );
  }

  return (
    <>
      <Accordion type="multiple" className="space-y-2">
        {sections.map((s) => (
          <AccordionItem key={s.key} value={s.key}>
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                {s.icon}
                <span className="font-semibold">{s.title}</span>
                <Badge variant="outline">{s.count}</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              {s.content}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>근태 요청 처리</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div>
                <p className="font-medium">{profilesMap[selectedRequest.user_id]?.name || "-"}</p>
                <p className="text-sm text-muted-foreground">{selectedRequest.subject || "휴가 신청"}</p>
                {selectedRequest.message && (
                  <p className="text-sm mt-2 whitespace-pre-wrap">{selectedRequest.message}</p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  {new Date(selectedRequest.created_at).toLocaleString("ko-KR")}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">거절 사유 (거절시 필수)</label>
                <Textarea
                  placeholder="거절 사유를 입력하세요..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                />
              </div>

              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={handleReject}
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  거절
                </Button>
                <Button
                  onClick={() => handleApprove(selectedRequest.id)}
                  className="gap-2"
                >
                  <Check className="h-4 w-4" />
                  수락
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
