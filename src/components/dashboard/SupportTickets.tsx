import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const SupportTickets = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"list" | "create">("list");
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [category, setCategory] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error("Error loading tickets:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !subject || !message) {
      toast({
        title: "입력 오류",
        description: "모든 필드를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("로그인이 필요합니다.");

      const { error } = await supabase.from("support_tickets").insert({
        user_id: user.id,
        category,
        subject,
        message,
      });

      if (error) throw error;

      toast({
        title: "문의 접수 완료",
        description: "문의가 정상적으로 접수되었습니다.",
      });

      setCategory("");
      setSubject("");
      setMessage("");
      setActiveTab("list");
      loadTickets();
    } catch (error: any) {
      toast({
        title: "문의 접수 실패",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return (
          <Badge variant="outline" className="border-muted-foreground text-muted-foreground bg-muted/30 rounded-full px-3 text-xs">
            대기
          </Badge>
        );
      case "closed":
        return (
          <Badge variant="outline" className="border-primary text-primary bg-primary/5 rounded-full px-3 text-xs">
            완료
          </Badge>
        );
      default:
        return <Badge className="rounded-full px-3 text-xs">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\. /g, '. ');
  };

  return (
    <div>
      {/* Tabs - Box style matching admin dashboard */}
      <div className="flex bg-muted rounded-xl p-1.5 mb-6">
        <button
          onClick={() => setActiveTab("list")}
          className={cn(
            "flex-1 py-2.5 text-sm font-medium transition-colors rounded-lg",
            activeTab === "list"
              ? "bg-background text-primary shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          문의내역
        </button>
        <button
          onClick={() => setActiveTab("create")}
          className={cn(
            "flex-1 py-2.5 text-sm font-medium transition-colors rounded-lg",
            activeTab === "create"
              ? "bg-background text-primary shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          문의작성
        </button>
      </div>

      {/* Create Form */}
      {activeTab === "create" && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">카테고리</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="카테고리 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="디자이너 변경">디자이너 변경 요청</SelectItem>
                <SelectItem value="구독 연장">구독 연장 신청</SelectItem>
                <SelectItem value="일반 문의">일반 문의</SelectItem>
                <SelectItem value="기술 지원">기술 지원</SelectItem>
                <SelectItem value="결제 문의">결제 문의</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">제목</label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="문의 제목을 입력하세요"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">내용</label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="문의 내용을 상세히 작성해주세요"
              rows={5}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" className="rounded-lg" onClick={() => setActiveTab("list")}>
              취소
            </Button>
            <Button type="submit" className="rounded-lg" disabled={isSubmitting}>
              {isSubmitting ? "접수 중..." : "문의 접수"}
            </Button>
          </div>
        </form>
      )}

      {/* Ticket List */}
      {activeTab === "list" && (
        <div className="space-y-0">
          {tickets.length > 0 ? (
            tickets.map((ticket, index) => (
              <div 
                key={ticket.id} 
                className={cn(
                  "py-6 cursor-pointer hover:bg-muted/30 transition-colors -mx-4 px-4",
                  index !== tickets.length - 1 && "border-b border-border"
                )}
                onClick={() => setSelectedTicket(ticket)}
              >
                <div className="space-y-2">
                  {/* Title row with badge */}
                  <div className="flex items-center gap-3">
                    {getStatusBadge(ticket.status)}
                    <h3 className="font-bold text-foreground">{ticket.subject}</h3>
                  </div>
                  
                  {/* Message preview */}
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {ticket.message}
                  </p>
                  
                  {/* Date */}
                  <p className="text-sm text-muted-foreground">
                    {formatDate(ticket.created_at)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">
              문의 내역이 없습니다.
            </p>
          )}
        </div>
      )}

      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedTicket && getStatusBadge(selectedTicket.status)}
              <span>{selectedTicket?.subject}</span>
            </DialogTitle>
            <DialogDescription>
              {selectedTicket?.category}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">문의 내용</h4>
              <p className="text-sm whitespace-pre-wrap">{selectedTicket?.message}</p>
            </div>
            {selectedTicket?.response && (
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium mb-2">답변</h4>
                <p className="text-sm whitespace-pre-wrap bg-accent/10 p-3 rounded-lg">{selectedTicket.response}</p>
                {selectedTicket.responded_at && (
                  <p className="text-xs text-muted-foreground mt-2">
                    답변일: {formatDate(selectedTicket.responded_at)}
                  </p>
                )}
              </div>
            )}
            <div className="text-xs text-muted-foreground">
              작성일: {selectedTicket && formatDate(selectedTicket.created_at)}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
