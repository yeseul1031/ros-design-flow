import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, CreditCard } from "lucide-react";

const Payment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [quote, setQuote] = useState<any>(null);
  const [paymentRequest, setPaymentRequest] = useState<any>(null);
  const [lead, setLead] = useState<any>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

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

      if (prError) {
        console.error("Payment request query error:", prError);
        throw prError;
      }

      if (!paymentRequestData) {
        toast({
          title: "유효하지 않은 링크",
          description: "결제 요청을 찾을 수 없습니다.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (new Date(paymentRequestData.expires_at) < new Date()) {
        toast({
          title: "만료된 링크",
          description: "결제 링크가 만료되었습니다. 관리자에게 문의하세요.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      setPaymentRequest(paymentRequestData);
      setQuote(paymentRequestData.quotes);
      setLead(paymentRequestData.quotes?.leads);
    } catch (error) {
      console.error("Error loading payment request:", error);
      toast({
        title: "오류 발생",
        description: "결제 정보를 불러올 수 없습니다.",
        variant: "destructive",
      });
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
    
    setShowPaymentForm(true);
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      // 결제 처리 로직 (실제 결제 게이트웨이 연동 필요)
      // 여기서는 간단히 payments 테이블에 저장
      const { error: paymentError } = await supabase
        .from("payments")
        .insert({
          quote_id: quote.id,
          payment_request_id: paymentRequest.id,
          user_id: lead.user_id || lead.id, // 임시로 lead id 사용
          amount: quote.total_amount,
          status: 'completed',
          method: 'card',
          paid_at: new Date().toISOString(),
        });

      if (paymentError) throw paymentError;

      // 비회원인 경우 비밀번호 설정 다이얼로그 표시
      if (!lead.user_id) {
        setShowPaymentForm(false);
        setShowPasswordDialog(true);
      } else {
        // 회원인 경우 완료 처리
        toast({
          title: "결제 완료",
          description: "결제가 성공적으로 완료되었습니다.",
        });
        
        // 리드 상태 업데이트
        await supabase
          .from("leads")
          .update({ status: 'payment_completed' })
          .eq("id", quote.lead_id);
        
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "결제 실패",
        description: "결제 처리 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePasswordSubmit = async () => {
    if (password.length < 8) {
      toast({
        title: "비밀번호 오류",
        description: "비밀번호는 8자 이상이어야 합니다.",
        variant: "destructive",
      });
      return;
    }

    if (password !== passwordConfirm) {
      toast({
        title: "비밀번호 불일치",
        description: "비밀번호가 일치하지 않습니다.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // 회원가입 처리
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: lead.email,
        password: password,
        options: {
          data: {
            name: lead.name,
            phone: lead.phone,
            company: lead.company,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (signUpError) throw signUpError;

      // leads 테이블의 user_id 업데이트
      if (authData.user) {
        const { error: updateError } = await supabase
          .from("leads")
          .update({ 
            user_id: authData.user.id,
            status: 'payment_completed'
          })
          .eq("id", quote.lead_id);

        if (updateError) throw updateError;
      }

      toast({
        title: "회원가입 완료",
        description: "결제가 완료되고 회원 가입이 완료되었습니다. 로그인해주세요.",
      });

      setShowPasswordDialog(false);
      navigate("/auth");
    } catch (error: any) {
      console.error("Sign up error:", error);
      toast({
        title: "회원가입 실패",
        description: error.message || "회원가입 처리 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
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
                  다음: 결제하기
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 결제 폼 */}
          {showPaymentForm && (
            <Card>
              <CardHeader>
                <CardTitle>결제 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>결제 금액</Label>
                  <p className="text-2xl font-bold text-primary mt-2">
                    ₩{(quote.total_amount * 1.1).toLocaleString('ko-KR')}
                  </p>
                  <p className="text-sm text-muted-foreground">부가세 포함</p>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-4">
                    결제 버튼을 클릭하시면 결제가 진행됩니다.
                  </p>
                  <Button 
                    onClick={handlePayment} 
                    className="w-full" 
                    size="lg"
                    disabled={isProcessing}
                  >
                    <CreditCard className="h-5 w-5 mr-2" />
                    {isProcessing ? "처리 중..." : "결제하기"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />

      {/* 비밀번호 설정 다이얼로그 */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>회원가입을 위한 비밀번호 설정</DialogTitle>
            <DialogDescription>
              결제가 완료되었습니다. 회원 가입을 위해 비밀번호를 설정해주세요.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <div>
              <Label>이메일</Label>
              <Input value={lead?.email || ""} disabled className="mt-2" />
            </div>

            <div>
              <Label htmlFor="password">비밀번호 (8자 이상)</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="password-confirm">비밀번호 확인</Label>
              <Input
                id="password-confirm"
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="비밀번호를 다시 입력하세요"
                className="mt-2"
              />
            </div>

            <Button 
              onClick={handlePasswordSubmit} 
              className="w-full"
              disabled={isProcessing}
            >
              {isProcessing ? "처리 중..." : "회원가입 완료"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Payment;
