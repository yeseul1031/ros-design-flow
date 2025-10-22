import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { CreditCard, Download, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const PaymentInfo = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [previewPayment, setPreviewPayment] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      console.error("Error loading payments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="default">완료</Badge>;
      case "pending":
        return <Badge variant="secondary">대기</Badge>;
      case "failed":
        return <Badge variant="destructive">실패</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount);
  };

  const handleReceiptDownload = (payment: any) => {
    // 실제로는 PDF 생성 로직이 들어가야 합니다
    const receiptData = generateReceiptData(payment);
    const blob = new Blob([receiptData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${payment.method === '현금' ? '세금계산서' : '결제영수증'}_${payment.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "다운로드 완료",
      description: `${payment.method === '현금' ? '세금계산서' : '결제영수증'}가 다운로드되었습니다.`,
    });
  };

  const generateReceiptData = (payment: any) => {
    const receiptType = payment.method === '현금' ? '세금계산서' : '결제영수증';
    return `
===========================================
${receiptType}
===========================================

결제 ID: ${payment.id}
결제일: ${payment.paid_at ? new Date(payment.paid_at).toLocaleDateString('ko-KR') : '-'}
결제방법: ${payment.method}
결제금액: ${formatAmount(payment.amount)}
상태: ${payment.status === 'completed' ? '완료' : payment.status}
${payment.method === '현금' ? `담당자: ${payment.invoice_manager || '-'}` : ''}

발행일: ${new Date().toLocaleDateString('ko-KR')}
===========================================
    `.trim();
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">로딩 중...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            <CardTitle>결제 정보</CardTitle>
          </div>
          <CardDescription>결제 내역 및 세금계산서 정보</CardDescription>
        </CardHeader>
        <CardContent>
        {payments.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>결제일</TableHead>
                  <TableHead>금액</TableHead>
                  <TableHead>결제방법</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>세금계산서 담당자</TableHead>
                  <TableHead>영수증</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      {payment.paid_at 
                        ? new Date(payment.paid_at).toLocaleDateString('ko-KR')
                        : new Date(payment.created_at).toLocaleDateString('ko-KR')}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatAmount(payment.amount)}
                    </TableCell>
                    <TableCell>{payment.method || "-"}</TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell>{payment.invoice_manager || "-"}</TableCell>
                    <TableCell>
                      {payment.status === 'completed' && (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setPreviewPayment(payment)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            미리보기
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReceiptDownload(payment)}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            다운로드
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            결제 내역이 없습니다.
          </p>
        )}
      </CardContent>
    </Card>

    <Dialog open={!!previewPayment} onOpenChange={() => setPreviewPayment(null)}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {previewPayment?.method === '현금' ? '세금계산서' : '결제영수증'} 미리보기
          </DialogTitle>
          <DialogDescription>
            영수증 내용을 확인하신 후 다운로드하실 수 있습니다.
          </DialogDescription>
        </DialogHeader>
        {previewPayment && (
          <div className="bg-muted p-6 rounded-lg">
            <pre className="whitespace-pre-wrap font-mono text-sm">
              {generateReceiptData(previewPayment)}
            </pre>
          </div>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setPreviewPayment(null)}>
            닫기
          </Button>
          <Button onClick={() => {
            handleReceiptDownload(previewPayment);
            setPreviewPayment(null);
          }}>
            <Download className="h-4 w-4 mr-2" />
            다운로드
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
};
