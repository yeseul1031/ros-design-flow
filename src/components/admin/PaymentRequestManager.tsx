import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Link2, Copy, Send } from "lucide-react";

export const PaymentRequestManager = () => {
  const [leads, setLeads] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [paymentRequests, setPaymentRequests] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: leadsData } = await supabase
        .from("leads")
        .select("*")
        .in("status", ["quoted", "payment_pending"])
        .order("created_at", { ascending: false });

      const { data: quotesData } = await supabase
        .from("quotes")
        .select("*, leads(*)")
        .eq("status", "sent");

      const { data: requestsData } = await supabase
        .from("payment_requests")
        .select("*, quotes(*, leads(*))")
        .order("created_at", { ascending: false });

      setLeads(leadsData || []);
      setQuotes(quotesData || []);
      setPaymentRequests(requestsData || []);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const createPaymentRequest = async () => {
    if (!selectedLeadId || !amount) {
      toast({
        title: "입력 오류",
        description: "상담과 금액을 모두 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create quote first
      const { data: quoteData, error: quoteError } = await supabase
        .from("quotes")
        .insert({
          lead_id: selectedLeadId,
          total_amount: parseFloat(amount),
          items: [{ description: "서비스 이용료", amount: parseFloat(amount) }],
          status: "sent",
        })
        .select()
        .single();

      if (quoteError) throw quoteError;

      // Create payment request
      const token = Math.random().toString(36).substring(2, 15);
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7일 후 만료

      const { error: requestError } = await supabase
        .from("payment_requests")
        .insert({
          quote_id: quoteData.id,
          token,
          expires_at: expiresAt.toISOString(),
          sent_via: "manual",
        });

      if (requestError) throw requestError;

      // Update lead status
      await supabase
        .from("leads")
        .update({ status: "payment_pending" })
        .eq("id", selectedLeadId);

      const paymentUrl = `${window.location.origin}/payment?token=${token}`;

      toast({
        title: "결제 링크 생성 완료",
        description: "결제 링크가 생성되었습니다.",
      });

      // Copy to clipboard
      await navigator.clipboard.writeText(paymentUrl);
      toast({
        title: "클립보드 복사",
        description: "결제 링크가 클립보드에 복사되었습니다.",
      });

      setSelectedLeadId("");
      setAmount("");
      loadData();
    } catch (error: any) {
      toast({
        title: "오류 발생",
        description: error.message || "결제 링크 생성에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const copyPaymentLink = async (token: string) => {
    const paymentUrl = `${window.location.origin}/payment?token=${token}`;
    await navigator.clipboard.writeText(paymentUrl);
    toast({
      title: "클립보드 복사",
      description: "결제 링크가 클립보드에 복사되었습니다.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            결제 링크 생성
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>상담 선택</Label>
              <Select value={selectedLeadId} onValueChange={setSelectedLeadId}>
                <SelectTrigger>
                  <SelectValue placeholder="상담 선택" />
                </SelectTrigger>
                <SelectContent>
                  {leads.map((lead) => (
                    <SelectItem key={lead.id} value={lead.id}>
                      {lead.name} - {lead.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>결제 금액</Label>
              <Input
                type="number"
                placeholder="금액 입력"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="flex items-end">
              <Button onClick={createPaymentRequest} className="w-full">
                <Link2 className="h-4 w-4 mr-2" />
                링크 생성
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>생성된 결제 링크</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>고객명</TableHead>
                <TableHead>이메일</TableHead>
                <TableHead>금액</TableHead>
                <TableHead>생성일</TableHead>
                <TableHead>만료일</TableHead>
                <TableHead>작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>{request.quotes?.leads?.name}</TableCell>
                  <TableCell>{request.quotes?.leads?.email}</TableCell>
                  <TableCell>₩{request.quotes?.total_amount?.toLocaleString()}</TableCell>
                  <TableCell>
                    {new Date(request.created_at).toLocaleDateString("ko-KR")}
                  </TableCell>
                  <TableCell>
                    {new Date(request.expires_at).toLocaleDateString("ko-KR")}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyPaymentLink(request.token)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
