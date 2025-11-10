import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare } from "lucide-react";

export const SupportTickets = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
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
      setShowForm(false);
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
        return <Badge variant="default">처리 중</Badge>;
      case "closed":
        return <Badge variant="secondary">완료</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="bg-card p-8 rounded-lg border border-border">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          <h2 className="text-2xl font-bold">문의사항</h2>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "취소" : "새 문의 작성"}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>새 문의 작성</CardTitle>
            <CardDescription>
              매니저에게 문의하실 내용을 작성해주세요
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  취소
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "접수 중..." : "문의 접수"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {tickets.length > 0 ? (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <Card 
              key={ticket.id} 
              className="hover:bg-accent/50 transition-colors cursor-pointer"
              onClick={() => setSelectedTicket(ticket)}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{ticket.category}</Badge>
                      {getStatusBadge(ticket.status)}
                    </div>
                    <h3 className="font-semibold">{ticket.subject}</h3>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{ticket.message}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {new Date(ticket.created_at).toLocaleDateString('ko-KR')} {new Date(ticket.created_at).toLocaleTimeString('ko-KR')}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        !showForm && (
          <p className="text-center text-muted-foreground py-8">
            문의 내역이 없습니다.
          </p>
        )
      )}

      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Badge variant="outline">{selectedTicket?.category}</Badge>
              {selectedTicket && getStatusBadge(selectedTicket.status)}
            </DialogTitle>
            <DialogDescription className="text-lg font-semibold text-foreground mt-2">
              {selectedTicket?.subject}
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
                    답변일: {new Date(selectedTicket.responded_at).toLocaleDateString('ko-KR')} {new Date(selectedTicket.responded_at).toLocaleTimeString('ko-KR')}
                  </p>
                )}
              </div>
            )}
            <div className="text-xs text-muted-foreground">
              작성일: {selectedTicket && new Date(selectedTicket.created_at).toLocaleDateString('ko-KR')} {selectedTicket && new Date(selectedTicket.created_at).toLocaleTimeString('ko-KR')}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
