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
import { Link2, Copy, Eye, Edit, Trash2 } from "lucide-react";

const SUBSCRIPTION_PRODUCTS = [
  { id: "1month", name: "1개월 구독", defaultAmount: 1300000 },
  { id: "3month", name: "3개월 구독", defaultAmount: 3000000 },
  { id: "6month", name: "6개월 구독", defaultAmount: 5500000 },
  { id: "custom", name: "직접 입력", defaultAmount: 0 },
];

export const PaymentRequestManager = () => {
  const [leads, setLeads] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [paymentRequests, setPaymentRequests] = useState<any[]>([]);
  const [previewRequest, setPreviewRequest] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

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
    if (!selectedLeadId || !selectedProduct || !amount) {
      toast({
        title: "입력 오류",
        description: "상담, 상품, 금액을 모두 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    try {
      const numericAmount = parseFloat(amount.replace(/,/g, ''));
      const product = SUBSCRIPTION_PRODUCTS.find(p => p.id === selectedProduct);
      
      // Create quote first
      const { data: quoteData, error: quoteError } = await supabase
        .from("quotes")
        .insert({
          lead_id: selectedLeadId,
          total_amount: numericAmount,
          items: [{ 
            description: product?.name || "서비스 이용료", 
            quantity: 1,
            amount: numericAmount 
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
        title: "클립보드 복사",
        description: "결제 링크가 클립보드에 복사되었습니다.",
      });

      setSelectedLeadId("");
      setSelectedProduct("");
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

  const handleProductChange = (productId: string) => {
    setSelectedProduct(productId);
    const product = SUBSCRIPTION_PRODUCTS.find(p => p.id === productId);
    if (product && product.defaultAmount > 0) {
      setAmount(product.defaultAmount.toLocaleString('ko-KR'));
    } else {
      setAmount("");
    }
  };

  // 현재 월 매출 계산 (임시 데이터)
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const monthStart = new Date(currentYear, currentMonth, 1);
  const monthEnd = new Date(currentYear, currentMonth + 1, 0);

  // 임시 데이터: 18,000,000원, 계약 8건
  const monthlyRevenue = 18000000;
  const monthlyContracts = 8;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {currentMonth + 1}월 매출 현황
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">계약 건수</p>
              <p className="text-2xl font-bold">{monthlyContracts}건</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">총 매출</p>
              <p className="text-2xl font-bold">₩{monthlyRevenue.toLocaleString()}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {monthStart.toLocaleDateString("ko-KR")} ~ {monthEnd.toLocaleDateString("ko-KR")}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            결제 링크 생성
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <Label>상품 선택</Label>
              <Select value={selectedProduct} onValueChange={handleProductChange}>
                <SelectTrigger>
                  <SelectValue placeholder="상품 선택" />
                </SelectTrigger>
                <SelectContent>
                  {SUBSCRIPTION_PRODUCTS.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>결제 금액</Label>
              <Input
                type="text"
                placeholder="금액 입력 (예: 13,000,000)"
                value={amount}
                onChange={(e) => {
                  const value = e.target.value.replace(/,/g, '');
                  if (!isNaN(Number(value)) || value === '') {
                    const formatted = value === '' ? '' : Number(value).toLocaleString('ko-KR');
                    setAmount(formatted);
                  }
                }}
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
                <TableHead>상품</TableHead>
                <TableHead>금액</TableHead>
                <TableHead>생성일</TableHead>
                <TableHead>만료일</TableHead>
                <TableHead>작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentRequests.map((request) => {
                const item = request.quotes?.items?.[0];
                const subtotal = request.quotes?.total_amount || 0;
                const vat = subtotal * 0.1;
                const total = subtotal + vat;

                return (
                  <TableRow key={request.id}>
                    <TableCell>{request.quotes?.leads?.name}</TableCell>
                    <TableCell>{request.quotes?.leads?.email}</TableCell>
                    <TableCell>{item?.description || "-"}</TableCell>
                    <TableCell>₩{subtotal.toLocaleString()}</TableCell>
                    <TableCell>
                      {new Date(request.created_at).toLocaleDateString("ko-KR")}
                    </TableCell>
                    <TableCell>
                      {new Date(request.expires_at).toLocaleDateString("ko-KR")}
                    </TableCell>
                    <TableCell>
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
        </CardContent>
      </Card>
    </div>
  );
};
