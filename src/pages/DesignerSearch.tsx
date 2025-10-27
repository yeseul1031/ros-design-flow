import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface Designer {
  id: string;
  name: string;
  work_fields: string[];
  tools: string[];
  specialties: string[];
  status: string;
}

const DesignerSearch = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [designers, setDesigners] = useState<Designer[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [additionalRequests, setAdditionalRequests] = useState("");
  const { toast } = useToast();
  const savedItems = location.state?.savedItems || [];

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

  const handleMatchingComplete = async () => {
    if (designers.length === 0) {
      toast({
        title: "디자이너를 먼저 선택해주세요",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "로그인이 필요합니다",
          variant: "destructive",
        });
        return;
      }

      // Create matching request
      const { data: matchingRequest, error: matchingError } = await supabase
        .from('matching_requests')
        .insert({
          user_id: user.id,
          designer_ids: designers.map(d => ({ id: d.id, name: d.name })),
          reference_images: savedItems,
          additional_requests: additionalRequests,
        })
        .select()
        .single();

      if (matchingError) throw matchingError;

      // Send notification to admin
      const { data: adminProfile, error: adminError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', 'admin@gmail.com')
        .single();

      if (!adminError && adminProfile) {
        await supabase
          .from('notifications')
          .insert({
            user_id: adminProfile.id,
            title: '새로운 매칭 신청',
            message: `${user.email}님의 매칭 신청이 도착했습니다.`,
          });
      }

      // Navigate to completion page
      navigate('/matching-complete', {
        state: {
          matchingRequestId: matchingRequest.id,
          designers,
          savedItems,
          additionalRequests,
        }
      });
    } catch (error) {
      console.error('Error creating matching request:', error);
      toast({
        title: "매칭 신청 중 오류가 발생했습니다",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
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
                      <CardTitle className="text-xl">{designer.name}</CardTitle>
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
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    처리중...
                  </>
                ) : (
                  '매칭 신청 완료하기'
                )}
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default DesignerSearch;
