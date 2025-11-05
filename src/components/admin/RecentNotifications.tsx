import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Bell, AlertCircle, MessageSquare } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const RecentNotifications = () => {
  const [pauseRequests, setPauseRequests] = useState<any[]>([]);
  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [newLeads, setNewLeads] = useState<any[]>([]);
  const [profilesMap, setProfilesMap] = useState<Record<string, any>>({});

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

  const loadNotifications = async () => {
    try {
      // 대기 중인 홀딩 요청 (근태관리)
      const { data: pauseData, error: pauseErr } = await supabase
        .from("project_pause_requests")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(20);
      if (pauseErr) throw pauseErr;

      // 휴가신청 티켓 (근태관리)
      const { data: vacationTickets, error: vacationErr } = await supabase
        .from("support_tickets")
        .select("*")
        .eq("status", "open")
        .eq("category", "휴가신청")
        .order("created_at", { ascending: false })
        .limit(20);
      if (vacationErr) throw vacationErr;

      // 프로젝트 관련 문의 (휴가신청 제외)
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
      // 근태관리 = 프로젝트 홀딩 요청 + 휴가신청 티켓
      setPauseRequests([...(pauseData || []), ...(vacationTickets || [])]);
      setSupportTickets(ticketData || []);
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
            <div key={req.id} className="border rounded-lg p-3 hover:bg-accent/50 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{profilesMap[req.user_id]?.name || "-"}</p>
                  {req.pause_days ? (
                    // 프로젝트 홀딩 요청
                    <p className="text-sm text-muted-foreground">
                      프로젝트 홀딩: {new Date(req.start_date).toLocaleDateString("ko-KR")} ~ {new Date(req.end_date).toLocaleDateString("ko-KR")} ({req.pause_days}일)
                    </p>
                  ) : (
                    // 휴가 신청
                    <p className="text-sm text-muted-foreground">
                      {req.subject || "휴가 신청"}
                    </p>
                  )}
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
          {supportTickets.map((ticket) => (
            <div key={ticket.id} className="border rounded-lg p-3 hover:bg-accent/50 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{profilesMap[ticket.user_id]?.name || "-"}</p>
                  <p className="text-sm text-muted-foreground">{ticket.subject}</p>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(ticket.created_at).toLocaleString("ko-KR")}</p>
                </div>
                <Badge>{ticket.category}</Badge>
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
  );
};
