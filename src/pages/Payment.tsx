import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2 } from "lucide-react";

const Payment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [quote, setQuote] = useState<any>(null);
  const [paymentRequest, setPaymentRequest] = useState<any>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      loadPaymentRequest(token);
    } else {
      navigate("/");
    }
  }, [searchParams]);

  const loadPaymentRequest = async (token: string) => {
    try {
      const { data: paymentRequestData, error: prError } = await supabase
        .from("payment_requests")
        .select("*, quotes(*, leads(*))")
        .eq("token", token)
        .maybeSingle();

      if (prError) throw prError;

      if (!paymentRequestData) {
        toast({
          title: "유효하지 않은 링크",
          description: "결제 요청을 찾을 수 없습니다.",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      if (new Date(paymentRequestData.expires_at) < new Date()) {
        toast({
          title: "만료된 링크",
          description: "결제 링크가 만료되었습니다. 관리자에게 문의하세요.",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setPaymentRequest(paymentRequestData);
      setQuote(paymentRequestData.quotes);
    } catch (error) {
      console.error("Error loading payment request:", error);
      toast({
        title: "오류 발생",
        description: "결제 정보를 불러올 수 없습니다.",
        variant: "destructive",
      });
      navigate("/");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!isConfirmed) {
      toast({
        title: "확인 필요",
        description: "견적서를 확인하셨다면 체크박스를 선택해주세요.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "확인 완료",
      description: "견적서 확인이 완료되었습니다. 담당자가 연락드리겠습니다.",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">로딩 중...</div>
      </div>
    );
  }

  if (!quote || !paymentRequest) {
    return null;
  }

  const items = Array.isArray(quote.items) ? quote.items : [];
  const subtotal = quote.total_amount || 0;
  const vat = subtotal * 0.1;
  const total = subtotal + vat;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-20 px-4">
        <div className="container max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center">견적서</h1>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>견적서 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 발신인/수신인 정보 */}
              <div className="grid md:grid-cols-2 gap-6 pb-6 border-b">
                <div>
                  <h3 className="font-semibold text-lg mb-2">발신인</h3>
                  <div className="space-y-1 text-sm">
                    <p className="font-medium">ROS Design Studio</p>
                    <p className="text-muted-foreground">사업자등록번호: 123-45-67890</p>
                    <p className="text-muted-foreground">contact@ros-design.com</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">수신인</h3>
                  <div className="space-y-1 text-sm">
                    <p className="font-medium">{quote.leads?.company || quote.leads?.name || '고객사'}</p>
                    <p className="text-muted-foreground">{quote.leads?.name || '담당자'}</p>
                    <p className="text-muted-foreground">{quote.leads?.email}</p>
                    <p className="text-muted-foreground">{quote.leads?.phone}</p>
                  </div>
                </div>
              </div>

              {/* 상품 정보 */}
              <div>
                <h3 className="font-semibold text-lg mb-4">상품 내역</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-4 font-medium">상품</th>
                        <th className="text-center p-4 font-medium w-24">수량</th>
                        <th className="text-right p-4 font-medium w-32">금액</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item: any, index: number) => (
                        <tr key={index} className="border-t">
                          <td className="p-4">{item.description || item.name || '서비스 이용료'}</td>
                          <td className="text-center p-4">1</td>
                          <td className="text-right p-4 font-semibold">
                            ₩{(item.amount || item.price || 0).toLocaleString('ko-KR')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 금액 합계 */}
              <div className="space-y-3 pt-4 border-t">
                <div className="flex justify-between text-base">
                  <span className="text-muted-foreground">상품 금액</span>
                  <span className="font-medium">₩{subtotal.toLocaleString('ko-KR')}</span>
                </div>
                <div className="flex justify-between text-base">
                  <span className="text-muted-foreground">부가세 (10%)</span>
                  <span className="font-medium">₩{vat.toLocaleString('ko-KR')}</span>
                </div>
                <div className="flex justify-between text-xl font-bold pt-3 border-t">
                  <span>총 금액</span>
                  <span className="text-primary">₩{total.toLocaleString('ko-KR')}</span>
                </div>
              </div>

              {/* 확인 체크박스 */}
              <div className="pt-6 border-t">
                <div className="flex items-start space-x-3 p-4 bg-muted/50 rounded-lg">
                  <input
                    type="checkbox"
                    id="confirm"
                    checked={isConfirmed}
                    onChange={(e) => setIsConfirmed(e.target.checked)}
                    className="mt-1 h-5 w-5 rounded border-gray-300"
                  />
                  <label htmlFor="confirm" className="text-sm cursor-pointer flex-1">
                    상기 견적 내용을 확인하였으며, 내용에 동의합니다.
                  </label>
                </div>

                <Button 
                  onClick={handleConfirm} 
                  className="w-full mt-4" 
                  size="lg"
                  disabled={!isConfirmed}
                >
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  견적서 확인 완료
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center mt-4">
                견적서 확인 후 담당자가 결제 안내를 위해 연락드리겠습니다.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Payment;
