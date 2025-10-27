import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Designer {
  id: string;
  name: string;
  work_fields: string[];
  tools: string[];
  specialties: string[];
  status: string;
}

const DesignerSearch = () => {
  const [designers, setDesigners] = useState<Designer[]>([]);
  const [loading, setLoading] = useState(true);
  const [additionalRequests, setAdditionalRequests] = useState("");
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchDesigners();
  }, []);

  const fetchDesigners = async () => {
    try {
      const { data, error } = await supabase
        .from('designers')
        .select('id, name, work_fields, tools, specialties, status')
        .eq('is_available', true)
        .limit(3);

      if (error) throw error;
      setDesigners(data || []);
    } catch (error) {
      console.error('Error fetching designers:', error);
      toast({
        title: "디자이너 정보를 불러올 수 없습니다",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMatchingComplete = () => {
    setShowSuccessDialog(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <section className="py-20 px-4 mt-16">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">추천 디자이너</h1>
            <p className="text-muted-foreground">
              선택하신 포트폴리오를 기반으로 최적의 디자이너를 추천해드립니다
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : designers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">추천 가능한 디자이너가 없습니다</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <h2 className="text-2xl font-bold">크리에이터 추천</h2>
                {designers.map((designer) => (
                  <Card key={designer.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl mb-2">{designer.name}</CardTitle>
                          <Badge variant="secondary">{designer.status}</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {designer.work_fields && designer.work_fields.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold mb-2 text-muted-foreground">업무 분야</h4>
                          <div className="flex flex-wrap gap-2">
                            {designer.work_fields.map((field, index) => (
                              <Badge key={index} variant="outline">
                                {field}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {designer.tools && designer.tools.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold mb-2 text-muted-foreground">활용 디자인 도구</h4>
                          <div className="flex flex-wrap gap-2">
                            {designer.tools.map((tool, index) => (
                              <Badge key={index} variant="outline" className="bg-primary/5">
                                {tool}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>추가 의뢰내용</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="요구사항, 작업내용 등을 자세히 입력해주세요."
                      value={additionalRequests}
                      onChange={(e) => setAdditionalRequests(e.target.value)}
                      className="min-h-[200px] resize-none"
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {!loading && designers.length > 0 && (
            <div className="mt-8 flex justify-center">
              <Button 
                size="lg" 
                className="w-full max-w-md"
                onClick={handleMatchingComplete}
              >
                매칭 신청 완료하기
              </Button>
            </div>
          )}
        </div>
      </section>

      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>매칭이 완료되었습니다</AlertDialogTitle>
            <AlertDialogDescription>
              24시간 내에 담당 매니저가 연락드리겠습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button onClick={() => setShowSuccessDialog(false)}>확인</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DesignerSearch;
