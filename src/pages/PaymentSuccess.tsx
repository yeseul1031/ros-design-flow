import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(true);
  const [paymentInfo, setPaymentInfo] = useState<any>(null);
  const [leadInfo, setLeadInfo] = useState<any>(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [paymentRequest, setPaymentRequest] = useState<any>(null);

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
      setLeadInfo(data.leadInfo);
      setPaymentRequest(data.paymentRequest);
      
      // 비회원인 경우 (user_id가 null) 비밀번호 설정 폼 표시
      if (!data.leadInfo?.user_id) {
        setShowPasswordForm(true);
      }
      
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

  const handlePasswordSubmit = async () => {
    if (!password || password.length < 6) {
      toast({
        title: "비밀번호 오류",
        description: "비밀번호는 최소 6자 이상이어야 합니다.",
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

    setIsRegistering(true);

    try {
      // 회원가입
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: leadInfo.email,
        password: password,
        options: {
          data: {
            name: leadInfo.name,
            phone: leadInfo.phone,
            company: leadInfo.company,
          },
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (signUpError) throw signUpError;

      // user_id를 lead에 업데이트
      if (signUpData.user) {
        const { error: updateError } = await supabase
          .from("leads")
          .update({ user_id: signUpData.user.id })
          .eq("email", leadInfo.email);

        if (updateError) {
          console.error("Lead update error:", updateError);
        }

        // payments 테이블에도 레코드 생성 (게스트 결제였던 경우)
        if (paymentInfo && paymentRequest) {
          // Extract contract agreed timestamp
          const contractAgreedAt = paymentRequest?.sent_via?.startsWith('contract_agreed:')
            ? paymentRequest.sent_via.split('contract_agreed:')[1]
            : null;

          const { error: paymentInsertError } = await supabase
            .from("payments")
            .insert({
              quote_id: paymentRequest.quote_id,
              payment_request_id: paymentRequest.id,
              user_id: signUpData.user.id,
              amount: paymentInfo.totalAmount || paymentInfo.amount,
              status: "completed",
              method: paymentInfo.method,
              gateway_txn_id: paymentInfo.paymentKey || paymentInfo.transactionKey,
              paid_at: new Date().toISOString(),
              contract_agreed_at: contractAgreedAt,
            });

          if (paymentInsertError) {
            console.error("Payment insert error:", paymentInsertError);
          }
        }
      }

      toast({
        title: "회원가입 완료",
        description: "자동으로 로그인되었습니다.",
      });

      setShowPasswordForm(false);
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        title: "회원가입 실패",
        description: error.message || "회원가입 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsRegistering(false);
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

              {showPasswordForm ? (
                <div className="space-y-4 p-6 border rounded-lg bg-background">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">회원가입을 완료해주세요</h3>
                    <p className="text-sm text-muted-foreground">
                      결제가 완료되었습니다. 서비스 이용을 위해 비밀번호를 설정해주세요.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">비밀번호 (최소 6자)</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="비밀번호를 입력하세요"
                          disabled={isRegistering}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isRegistering}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="passwordConfirm">비밀번호 확인</Label>
                      <Input
                        id="passwordConfirm"
                        type={showPassword ? "text" : "password"}
                        value={passwordConfirm}
                        onChange={(e) => setPasswordConfirm(e.target.value)}
                        placeholder="비밀번호를 다시 입력하세요"
                        disabled={isRegistering}
                      />
                    </div>

                    <Button 
                      onClick={handlePasswordSubmit} 
                      className="w-full" 
                      size="lg"
                      disabled={isRegistering}
                    >
                      {isRegistering ? "처리 중..." : "회원가입 완료"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground text-center">
                    프로젝트가 곧 시작됩니다. 담당 디자이너가 배정되면 알림을 보내드리겠습니다.
                  </p>
                  <Button onClick={() => navigate("/dashboard")} className="w-full" size="lg">
                    대시보드로 이동
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PaymentSuccess;
