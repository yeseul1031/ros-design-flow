import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Copy, Eye, Trash2 } from "lucide-react";

export const PaymentRequestManager = () => {
  const [leads, setLeads] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [paymentRequests, setPaymentRequests] = useState<any[]>([]);
  const [previewRequest, setPreviewRequest] = useState<any>(null);
  const { toast } = useToast();

  // 현재 월 매출 계산
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // 현재 월 시작일 (YYYY-MM-DD 형식)
  const monthStartStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`;
  const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
  const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
  const monthEndStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-01`;

  const [monthlyStats, setMonthlyStats] = useState({
    monthlyContracts: 0,
    renewalContracts: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const loadMonthlyStats = async () => {
      try {
        // 이번 달 시작일인 프로젝트 조회 (신규 계약: contract_count = 1)
        const { data: newProjects } = await supabase
          .from("projects")
          .select("id, contract_count, payment_id")
          .gte("start_date", monthStartStr)
          .lt("start_date", monthEndStr)
          .eq("contract_count", 1);

        // 이번 달 시작일인 재계약 프로젝트 (contract_count > 1)
        const { data: renewalProjects } = await supabase
          .from("projects")
          .select("id, contract_count")
          .gte("start_date", monthStartStr)
          .lt("start_date", monthEndStr)
          .gt("contract_count", 1);

        // 이번 달 결제 완료된 금액 조회
        const { data: payments } = await supabase
          .from("payments")
          .select("amount")
          .eq("status", "completed")
          .gte("paid_at", monthStartStr)
          .lt("paid_at", monthEndStr);

        const totalRevenue = payments?.reduce((sum, p) => sum + Number(p.amount || 0), 0) || 0;

        setMonthlyStats({
          monthlyContracts: newProjects?.length || 0,
          renewalContracts: renewalProjects?.length || 0,
          totalRevenue,
        });
      } catch (error) {
        console.error("Error loading monthly stats:", error);
      }
    };

    loadMonthlyStats();
  }, [monthStartStr, monthEndStr]);

  const loadData = async () => {
    try {
      // leads와 matching_requests에서 연락완료 상태인 항목 조회
      const { data: leadsData } = await supabase
        .from("leads")
        .select("*")
        .in("status", ["contacted", "quoted", "payment_pending"])
        .order("created_at", { ascending: false });
      
      const { data: matchingData } = await supabase
        .from("matching_requests")
        .select("*")
        .eq("status", "contacted")
        .order("created_at", { ascending: false });
      
      // matching_requests를 leads 형식으로 변환
      const convertedMatching = (matchingData || []).map((m: any) => ({
        id: m.id,
        name: m.contact_name,
        email: m.contact_email,
        phone: m.contact_phone,
        company: m.brand_name,
        user_id: m.user_id,
        status: m.status,
        service_type: 'matching',
        created_at: m.created_at,
        is_matching: true,
      }));
      
      const combinedLeads = [...(leadsData || []), ...convertedMatching];

      const { data: quotesData } = await supabase
        .from("quotes")
        .select("*, leads(*)")
        .eq("status", "sent");

      const { data: requestsData } = await supabase
        .from("payment_requests")
        .select("*, quotes(*, leads(*))")
        .order("created_at", { ascending: false });

      setLeads(combinedLeads);
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
        description: "상담과 금액을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    try {
      const numericAmount = parseFloat(amount.replace(/,/g, ''));

      // Resolve lead id (create from matching request if needed)
      const selectedLead = leads.find((l) => l.id === selectedLeadId);
      let leadIdToUse = selectedLeadId;

      if (selectedLead?.is_matching) {
        const { data: newLead, error: newLeadError } = await supabase
          .from('leads')
          .insert({
            name: selectedLead.name || '담당자',
            email: selectedLead.email || '',
            phone: selectedLead.phone || '',
            company: selectedLead.company || null,
            service_type: 'custom',
            message: '매칭 요청에서 자동 생성된 리드',
            status: 'contacted' as any,
            user_id: selectedLead.user_id || null,
            attachments: [],
          })
          .select('id')
          .single();
        if (newLeadError) throw newLeadError;
        leadIdToUse = newLead!.id;
      }
      
      // Create quote for the resolved lead
      const { data: quoteData, error: quoteError } = await supabase
        .from("quotes")
        .insert({
          lead_id: leadIdToUse,
          total_amount: numericAmount,
          items: [{
            description: "서비스 이용료",
            quantity: 1,
            amount: numericAmount,
          }],
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
        title: "결제 링크 생성 완료",
        description: "결제 링크 생성이 완료되었습니다.",
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

  const deletePaymentRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from("payment_requests")
        .delete()
        .eq("id", requestId);

      if (error) throw error;

      toast({
        title: "삭제 완료",
        description: "결제 링크가 삭제되었습니다.",
      });

      loadData();
    } catch (error: any) {
      toast({
        title: "오류 발생",
        description: error.message || "삭제에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* 월 매출 현황 */}
      <h2 className="text-xl font-bold">{currentMonth + 1}월 매출 현황</h2>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-muted/30 rounded-lg p-5">
          <p className="text-xs text-muted-foreground mb-1">{currentMonth + 1}월 계약 건수</p>
          <p className="text-2xl font-bold">{monthlyStats.monthlyContracts}</p>
        </div>
        <div className="bg-muted/30 rounded-lg p-5">
          <p className="text-xs text-muted-foreground mb-1">재계약 건수</p>
          <p className="text-2xl font-bold">{monthlyStats.renewalContracts}</p>
        </div>
        <div className="bg-muted/30 rounded-lg p-5">
          <p className="text-xs text-muted-foreground mb-1">총 매출 (₩)</p>
          <p className="text-2xl font-bold">{monthlyStats.totalRevenue.toLocaleString()}</p>
        </div>
      </div>

      {/* 결제 링크 생성 */}
      <div className="bg-muted/30 rounded-lg p-5 space-y-4">
        <h3 className="font-bold">결제 링크 생성</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">상담</Label>
            <Select value={selectedLeadId} onValueChange={setSelectedLeadId}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="링크를 생성할 상담을 선택해주세요." />
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
            <Label className="text-xs text-muted-foreground">결제 금액</Label>
            <Input
              type="text"
              placeholder="결제 금액을 입력해주세요. (예시:15,000,000)"
              value={amount}
              onChange={(e) => {
                const value = e.target.value.replace(/,/g, '');
                if (!isNaN(Number(value)) || value === '') {
                  const formatted = value === '' ? '' : Number(value).toLocaleString('ko-KR');
                  setAmount(formatted);
                }
              }}
              className="bg-background"
            />
          </div>

          <div className="flex items-end">
            <Button onClick={createPaymentRequest} variant="outline" className="px-6">
              링크 생성
            </Button>
          </div>
        </div>
      </div>

      {/* 생성된 결제 링크 */}
      <div className="space-y-4">
        <h3 className="font-bold">
          생성된 결제 링크 <span className="text-primary">({paymentRequests.length})</span>
        </h3>
        <Table>
          <TableHeader>
            <TableRow className="border-b">
              <TableHead className="text-muted-foreground font-medium">회사명 / 이름</TableHead>
              <TableHead className="text-muted-foreground font-medium">이메일</TableHead>
              <TableHead className="text-muted-foreground font-medium">상품</TableHead>
              <TableHead className="text-muted-foreground font-medium">금액</TableHead>
              <TableHead className="text-muted-foreground font-medium">생성일</TableHead>
              <TableHead className="text-muted-foreground font-medium">만료일</TableHead>
              <TableHead className="text-muted-foreground font-medium">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paymentRequests.map((request) => {
              const item = request.quotes?.items?.[0];
              const subtotal = request.quotes?.total_amount || 0;
              const vat = subtotal * 0.1;
              const total = subtotal + vat;
              const lead = request.quotes?.leads;

              return (
                <TableRow key={request.id} className="border-b">
                  <TableCell className="py-4">
                    <div>
                      <p className="font-medium text-sm">{lead?.company || lead?.name}</p>
                      <p className="text-xs text-muted-foreground">{lead?.name}</p>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 text-sm">{lead?.email}</TableCell>
                  <TableCell className="py-4 text-sm">{item?.description || "-"}</TableCell>
                  <TableCell className="py-4 text-sm">{subtotal.toLocaleString()}</TableCell>
                  <TableCell className="py-4 text-sm">
                    {new Date(request.created_at).toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\. /g, ". ")}
                  </TableCell>
                  <TableCell className="py-4 text-sm">
                    {new Date(request.expires_at).toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\. /g, ". ")}
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex gap-1">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setPreviewRequest(request)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>견적서 미리보기</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-6 p-6 border rounded-lg">
                            <div className="grid grid-cols-2 gap-6">
                              <div>
                                <h3 className="font-semibold mb-2">발신인</h3>
                                <p className="text-sm">ROS Design Studio</p>
                                <p className="text-sm text-muted-foreground">디자인 구독 서비스</p>
                              </div>
                              <div>
                                <h3 className="font-semibold mb-2">수신인</h3>
                                <p className="text-sm">{request.quotes?.leads?.name}</p>
                                <p className="text-sm text-muted-foreground">{request.quotes?.leads?.email}</p>
                              </div>
                            </div>

                            <div>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>상품</TableHead>
                                    <TableHead className="text-right">수량</TableHead>
                                    <TableHead className="text-right">금액</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  <TableRow>
                                    <TableCell>{item?.description}</TableCell>
                                    <TableCell className="text-right">{item?.quantity || 1}</TableCell>
                                    <TableCell className="text-right">₩{subtotal.toLocaleString()}</TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>
                            </div>

                            <div className="space-y-2 pt-4 border-t">
                              <div className="flex justify-between">
                                <span>상품금액</span>
                                <span>₩{subtotal.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>부가세 (10%)</span>
                                <span>₩{vat.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                                <span>총 금액</span>
                                <span>₩{total.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyPaymentLink(request.token)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>결제 링크 삭제</AlertDialogTitle>
                            <AlertDialogDescription>
                              이 결제 링크를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>취소</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deletePaymentRequest(request.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              삭제
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
