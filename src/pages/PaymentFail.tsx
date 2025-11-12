import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle } from "lucide-react";

const PaymentFail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const errorCode = searchParams.get("code");
  const errorMessage = searchParams.get("message");

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-20 px-4">
        <div className="container max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <XCircle className="h-10 w-10 text-red-600" />
              </div>
              <CardTitle className="text-2xl">결제가 실패했습니다</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                {errorCode && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">오류 코드</span>
                    <span className="font-semibold">{errorCode}</span>
                  </div>
                )}
                {errorMessage && (
                  <div>
                    <p className="text-muted-foreground mb-2">오류 메시지</p>
                    <p className="font-semibold">{decodeURIComponent(errorMessage)}</p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <p className="text-sm text-muted-foreground text-center">
                  결제 중 문제가 발생했습니다. 다시 시도해 주세요.
                </p>
                <Button onClick={() => navigate(-1)} className="w-full" size="lg">
                  다시 시도
                </Button>
                <Button 
                  onClick={() => navigate("/")} 
                  variant="outline" 
                  className="w-full" 
                  size="lg"
                >
                  홈으로 이동
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

export default PaymentFail;
