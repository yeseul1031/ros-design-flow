import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(true);
  const [paymentInfo, setPaymentInfo] = useState<any>(null);

  useEffect(() => {
    confirmPayment();
  }, []);

  const confirmPayment = async () => {
    const paymentKey = searchParams.get("paymentKey");
    const orderId = searchParams.get("orderId");
    const amount = searchParams.get("amount");

    if (!paymentKey || !orderId || !amount) {
      toast({
        title: "결제 오류",
        description: "결제 정보가 올바르지 않습니다.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("toss-confirm-payment", {
        body: {
          paymentKey,
          orderId,
          amount: Number(amount),
        },
      });

      if (error) throw error;

      setPaymentInfo(data.payment);
      
      toast({
        title: "결제 완료",
        description: "결제가 성공적으로 완료되었습니다.",
      });
    } catch (error: any) {
      console.error("Payment confirmation error:", error);
      toast({
        title: "결제 확인 실패",
        description: error.message || "결제 확인 중 오류가 발생했습니다.",
        variant: "destructive",
      });
      navigate("/");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isProcessing) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg">결제 확인 중...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-20 px-4">
        <div className="container max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <CardTitle className="text-2xl">결제가 완료되었습니다</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {paymentInfo && (
                <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">결제 금액</span>
                    <span className="font-semibold">
                      ₩{paymentInfo.totalAmount?.toLocaleString('ko-KR')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">결제 방법</span>
                    <span className="font-semibold">{paymentInfo.method}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">주문 번호</span>
                    <span className="font-semibold text-sm">{paymentInfo.orderId}</span>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <p className="text-sm text-muted-foreground text-center">
                  프로젝트가 곧 시작됩니다. 담당 디자이너가 배정되면 알림을 보내드리겠습니다.
                </p>
                <Button onClick={() => navigate("/dashboard")} className="w-full" size="lg">
                  대시보드로 이동
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PaymentSuccess;
