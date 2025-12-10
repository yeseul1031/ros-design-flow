import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Download, Eye } from "lucide-react";
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
        return null; // 완료된 경우 배지 표시 안함
      case "pending":
        return (
          <Badge variant="outline" className="border-primary text-primary bg-primary/5 rounded-full px-3">
            결제필요
          </Badge>
        );
      case "failed":
        return <Badge variant="destructive" className="rounded-full px-3">실패</Badge>;
      default:
        return <Badge className="rounded-full px-3">{status}</Badge>;
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount) + '원';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\. /g, '. ');
  };

  const handleReceiptDownload = (payment: any) => {
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
결제일: ${payment.paid_at ? formatDate(payment.paid_at) : '-'}
결제방법: ${payment.method}
결제금액: ${formatAmount(payment.amount)}
상태: ${payment.status === 'completed' ? '완료' : payment.status}
${payment.method === '현금' ? `담당자: ${payment.invoice_manager || '-'}` : ''}

발행일: ${formatDate(new Date().toISOString())}
===========================================
    `.trim();
  };

  if (isLoading) {
    return (
      <div className="py-8">
        <p className="text-center text-muted-foreground">로딩 중...</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-0">
        {payments.length > 0 ? (
          payments.map((payment, index) => (
            <div 
              key={payment.id} 
              className={`py-6 ${index !== payments.length - 1 ? 'border-b border-border' : ''}`}
            >
              <div className="space-y-2">
                {/* Title row with badge */}
                <div className="flex items-center gap-3">
                  {getStatusBadge(payment.status)}
                  <h3 className="font-bold text-foreground">3개월 구독</h3>
                </div>
                
                {/* Amount */}
                <p className="text-sm text-muted-foreground">
                  금액: {formatAmount(payment.amount)}
                </p>
                
                {/* Completed payment details */}
                {payment.status === 'completed' && (
                  <>
                    <p className="text-sm text-muted-foreground">
                      결제일: {payment.paid_at ? formatDate(payment.paid_at) : formatDate(payment.created_at)}
                    </p>
                    {payment.method && (
                      <p className="text-sm text-muted-foreground">
                        결제수단: {payment.method}
                      </p>
                    )}
                    {payment.invoice_manager && (
                      <p className="text-sm text-muted-foreground">
                        담당자: {payment.invoice_manager}
                      </p>
                    )}
                  </>
                )}
                
                {/* Date for pending */}
                {payment.status !== 'completed' && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {formatDate(payment.created_at)}
                  </p>
                )}
                
                {/* Date for completed - shown at bottom */}
                {payment.status === 'completed' && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {formatDate(payment.paid_at || payment.created_at)}
                  </p>
                )}
                
                {/* Action buttons for completed payments - moved to bottom */}
                {payment.status === 'completed' && (
                  <div className="flex gap-2 pt-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg px-5"
                      onClick={() => setPreviewPayment(payment)}
                    >
                      미리보기
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg px-5"
                      onClick={() => handleReceiptDownload(payment)}
                    >
                      영수증 다운로드
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-muted-foreground py-8">
            결제 내역이 없습니다.
          </p>
        )}
      </div>

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
