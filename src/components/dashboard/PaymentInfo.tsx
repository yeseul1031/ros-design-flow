import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { CreditCard, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const PaymentInfo = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
    toast({
      title: "영수증 다운로드",
      description: `${payment.method === '현금' ? '세금계산서' : '결제영수증'} 다운로드를 시작합니다.`,
    });
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
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReceiptDownload(payment)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          {payment.method === '현금' ? '세금계산서' : '결제영수증'}
                        </Button>
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
  );
};
