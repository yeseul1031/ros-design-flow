import { useLocation, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

interface Designer {
  id: string;
  name: string;
  work_fields: string[];
  tools: string[];
}

interface SavedItem {
  id: string;
  image: string;
  title: string;
  type: 'liked' | 'uploaded';
}

const MatchingComplete = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { designers, savedItems, additionalRequests } = location.state || {};

  if (!designers) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <section className="py-20 px-4 mt-16">
        <div className="container mx-auto max-w-4xl">
          {/* Success Message */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold mb-4">매칭 신청이 완료되었습니다</h1>
            <p className="text-lg text-muted-foreground">
              24시간 내에 담당 매니저가 연락드리겠습니다.
            </p>
          </div>

          {/* Matching Request Summary */}
          <div className="space-y-6">
            {/* Reference Images */}
            {savedItems && savedItems.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>레퍼런스 이미지</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {savedItems.map((item: SavedItem) => (
                      <div key={item.id} className="relative aspect-square rounded-lg overflow-hidden">
                        <img 
                          src={item.image} 
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                        {item.type === 'uploaded' && (
                          <Badge 
                            variant="secondary" 
                            className="absolute top-2 left-2 text-xs"
                          >
                            참고자료
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Selected Designers */}
            <Card>
              <CardHeader>
                <CardTitle>추천 디자이너</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {designers.map((designer: Designer) => (
                  <div 
                    key={designer.id} 
                    className="p-4 border rounded-lg"
                  >
                    <h3 className="font-semibold text-lg mb-3">{designer.name}</h3>
                    
                    {designer.work_fields && designer.work_fields.length > 0 && (
                      <div className="mb-3">
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
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Additional Requests */}
            {additionalRequests && (
              <Card>
                <CardHeader>
                  <CardTitle>추가 의뢰내용</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-muted-foreground">
                    {additionalRequests}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Action Button */}
          <div className="mt-8 flex justify-center">
            <Button 
              size="lg" 
              className="w-full max-w-md"
              onClick={() => navigate('/')}
            >
              확인
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MatchingComplete;
