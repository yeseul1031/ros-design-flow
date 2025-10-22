import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Payment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [quote, setQuote] = useState<any>(null);
  const [needsInvoice, setNeedsInvoice] = useState(false);

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
      const { data: paymentRequest, error: prError } = await supabase
        .from("payment_requests")
        .select("*, quotes(*)")
        .eq("token", token)
        .single();

      if (prError) throw prError;

      if (!paymentRequest) {
        toast({
          title: "유효하지 않은 링크",
          description: "결제 요청을 찾을 수 없습니다.",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      if (new Date(paymentRequest.expires_at) < new Date()) {
        toast({
          title: "만료된 링크",
          description: "결제 링크가 만료되었습니다. 관리자에게 문의하세요.",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setQuote(paymentRequest.quotes);
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

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    toast({
      title: "준비 중",
      description: "결제 기능은 곧 추가됩니다.",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">로딩 중...</div>
      </div>
    );
  }

  if (!quote) {
    return null;
  }

  const items = Array.isArray(quote.items) ? quote.items : [];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-20 px-4">
        <div className="container max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center">결제하기</h1>

          <div className="grid gap-8 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>견적 상세</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {items.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between">
                      <span>{item.name}</span>
                      <span className="font-semibold">₩{item.price?.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span>총 금액</span>
                      <span className="text-accent">₩{quote.total_amount?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>결제 정보</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePayment} className="space-y-4">
                  <div>
                    <Label htmlFor="name">결제자명</Label>
                    <Input id="name" placeholder="홍길동" required />
                  </div>

                  <div>
                    <Label htmlFor="email">이메일</Label>
                    <Input id="email" type="email" placeholder="hello@example.com" required />
                  </div>

                  <div>
                    <Label htmlFor="phone">연락처</Label>
                    <Input id="phone" placeholder="010-1234-5678" required />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="invoice" 
                      checked={needsInvoice}
                      onCheckedChange={(checked) => setNeedsInvoice(checked as boolean)}
                    />
                    <label htmlFor="invoice" className="text-sm cursor-pointer">
                      세금계산서 발행 필요
                    </label>
                  </div>

                  {needsInvoice && (
                    <>
                      <div>
                        <Label htmlFor="company">사업자명</Label>
                        <Input id="company" placeholder="주식회사 ROS" required />
                      </div>
                      <div>
                        <Label htmlFor="business-number">사업자등록번호</Label>
                        <Input id="business-number" placeholder="123-45-67890" required />
                      </div>
                    </>
                  )}

                  <Button type="submit" className="w-full" size="lg">
                    ₩{quote.total_amount?.toLocaleString()} 결제하기
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Payment;
