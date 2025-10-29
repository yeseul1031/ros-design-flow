import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Bell, AlertCircle } from "lucide-react";

export const RecentNotifications = () => {
  const [pauseRequests, setPauseRequests] = useState<any[]>([]);
  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [newLeads, setNewLeads] = useState<any[]>([]);

  useEffect(() => {
    loadNotifications();
    
    // 실시간 구독 설정
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'leads' },
        () => loadNotifications()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadNotifications = async () => {
    try {
      // 대기 중인 홀딩 요청 가져오기
      const { data: pauseData } = await supabase
        .from("project_pause_requests")
        .select(`
          *,
          profiles:user_id(name, email)
        `)
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(5);

      // 열린 문의 가져오기
      const { data: ticketData } = await supabase
        .from("support_tickets")
        .select(`
          *,
          profiles:user_id(name, email)
        `)
        .eq("status", "open")
        .order("created_at", { ascending: false })
        .limit(5);

      // 신규 상담 신청 가져오기 (최근 24시간)
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      
      const { data: leadsData } = await supabase
        .from("leads")
        .select("*")
        .eq("status", "new")
        .gte("created_at", oneDayAgo.toISOString())
        .order("created_at", { ascending: false })
        .limit(5);

      setPauseRequests(pauseData || []);
      setSupportTickets(ticketData || []);
      setNewLeads(leadsData || []);
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  };

  const totalNotifications = pauseRequests.length + supportTickets.length + newLeads.length;

  if (totalNotifications === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>새로운 알림이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {newLeads.length > 0 && (
        <div>
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            신규 상담 신청 ({newLeads.length})
          </h4>
          <div className="space-y-2">
            {newLeads.map((lead) => (
              <div
                key={lead.id}
                className="border border-primary/20 rounded-lg p-3 hover:bg-primary/5 transition-colors bg-primary/5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{lead.name}</p>
                    <p className="text-sm text-muted-foreground">{lead.email}</p>
                    <p className="text-sm text-muted-foreground">{lead.phone}</p>
                    {lead.message && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{lead.message}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(lead.created_at).toLocaleString("ko-KR")}
                    </p>
                  </div>
                  <Badge className="bg-primary">신규</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {pauseRequests.length > 0 && (
        <div>
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            홀딩 요청 ({pauseRequests.length})
          </h4>
          <div className="space-y-2">
            {pauseRequests.map((request) => (
              <div
                key={request.id}
                className="border rounded-lg p-3 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{request.profiles?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(request.start_date).toLocaleDateString("ko-KR")} ~{" "}
                      {new Date(request.end_date).toLocaleDateString("ko-KR")} ({request.pause_days}일)
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(request.created_at).toLocaleString("ko-KR")}
                    </p>
                  </div>
                  <Badge variant="secondary">대기중</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {supportTickets.length > 0 && (
        <div>
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Bell className="h-4 w-4" />
            문의 내역 ({supportTickets.length})
          </h4>
          <div className="space-y-2">
            {supportTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="border rounded-lg p-3 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{ticket.profiles?.name}</p>
                    <p className="text-sm text-muted-foreground">{ticket.subject}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(ticket.created_at).toLocaleString("ko-KR")}
                    </p>
                  </div>
                  <Badge>{ticket.category}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
