import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  const [designers, setDesigners] = useState<Designer[]>([]);
  const [loading, setLoading] = useState(true);
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <section className="py-20 px-4 mt-16">
        <div className="container mx-auto max-w-4xl">
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
            <div className="space-y-6">
              {designers.map((designer) => (
                <Card key={designer.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-2xl mb-2">{designer.name}</CardTitle>
                        <Badge variant="secondary">{designer.status}</Badge>
                      </div>
                      <Button>상담 신청</Button>
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

                    {designer.specialties && designer.specialties.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2 text-muted-foreground">전문 분야</h4>
                        <div className="flex flex-wrap gap-2">
                          {designer.specialties.map((specialty, index) => (
                            <Badge key={index} variant="secondary">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default DesignerSearch;
