import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { 
  Star, 
  TrendingUp, 
  Users, 
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Loader2,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface SurveyResponse {
  id: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_company: string | null;
  overall_satisfaction: number | null;
  designer_satisfaction: number | null;
  communication_satisfaction: number | null;
  would_reuse: boolean | null;
  would_recommend: number | null;
  improvement_feedback: string | null;
  submitted_at: string | null;
  created_at: string;
}

interface Stats {
  totalResponses: number;
  avgOverall: number;
  avgDesigner: number;
  avgCommunication: number;
  reuseRate: number;
  npsScore: number;
}

export const SurveyResults = () => {
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  useEffect(() => {
    loadResponses();
  }, []);

  const loadResponses = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("survey_responses")
        .select("*")
        .not("submitted_at", "is", null)
        .order("submitted_at", { ascending: false });

      if (error) throw error;

      setResponses(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error("Error loading survey responses:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: SurveyResponse[]) => {
    if (data.length === 0) {
      setStats(null);
      return;
    }

    const validOverall = data.filter(r => r.overall_satisfaction !== null);
    const validDesigner = data.filter(r => r.designer_satisfaction !== null);
    const validComm = data.filter(r => r.communication_satisfaction !== null);
    const validReuse = data.filter(r => r.would_reuse !== null);
    const validNps = data.filter(r => r.would_recommend !== null);

    // NPS calculation: % Promoters (9-10) - % Detractors (0-6)
    const promoters = validNps.filter(r => r.would_recommend! >= 9).length;
    const detractors = validNps.filter(r => r.would_recommend! <= 6).length;
    const npsScore = validNps.length > 0 
      ? Math.round(((promoters - detractors) / validNps.length) * 100)
      : 0;

    setStats({
      totalResponses: data.length,
      avgOverall: validOverall.length > 0 
        ? validOverall.reduce((sum, r) => sum + r.overall_satisfaction!, 0) / validOverall.length 
        : 0,
      avgDesigner: validDesigner.length > 0 
        ? validDesigner.reduce((sum, r) => sum + r.designer_satisfaction!, 0) / validDesigner.length 
        : 0,
      avgCommunication: validComm.length > 0 
        ? validComm.reduce((sum, r) => sum + r.communication_satisfaction!, 0) / validComm.length 
        : 0,
      reuseRate: validReuse.length > 0 
        ? (validReuse.filter(r => r.would_reuse).length / validReuse.length) * 100 
        : 0,
      npsScore,
    });
  };

  const renderStars = (value: number | null) => {
    if (value === null) return <span className="text-muted-foreground">-</span>;
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= value ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getNpsBadge = (score: number | null) => {
    if (score === null) return null;
    if (score >= 9) return <Badge className="bg-green-500">추천</Badge>;
    if (score >= 7) return <Badge className="bg-yellow-500">중립</Badge>;
    return <Badge className="bg-red-500">비추천</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalResponses}</p>
                  <p className="text-xs text-muted-foreground">총 응답</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.avgOverall.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground">전반 만족도</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.avgDesigner.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground">디자이너 만족도</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.avgCommunication.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground">커뮤니케이션</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <ThumbsUp className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.reuseRate.toFixed(0)}%</p>
                  <p className="text-xs text-muted-foreground">재이용 의향</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <TrendingUp className={`h-5 w-5 ${stats.npsScore >= 0 ? "text-green-500" : "text-red-500"}`} />
                <div>
                  <p className="text-2xl font-bold">{stats.npsScore}</p>
                  <p className="text-xs text-muted-foreground">NPS 점수</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Responses Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>설문 응답 목록</CardTitle>
          <Button variant="outline" size="sm" onClick={loadResponses}>
            <RefreshCw className="h-4 w-4 mr-2" />
            새로고침
          </Button>
        </CardHeader>
        <CardContent>
          {responses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              아직 제출된 설문이 없습니다.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>고객</TableHead>
                  <TableHead>전반 만족도</TableHead>
                  <TableHead>디자이너</TableHead>
                  <TableHead>커뮤니케이션</TableHead>
                  <TableHead>재이용</TableHead>
                  <TableHead>NPS</TableHead>
                  <TableHead>제출일</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {responses.map((response) => (
                  <>
                    <TableRow key={response.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell>
                        <div>
                          <p className="font-medium">{response.customer_name || "익명"}</p>
                          <p className="text-xs text-muted-foreground">{response.customer_company || ""}</p>
                        </div>
                      </TableCell>
                      <TableCell>{renderStars(response.overall_satisfaction)}</TableCell>
                      <TableCell>{renderStars(response.designer_satisfaction)}</TableCell>
                      <TableCell>{renderStars(response.communication_satisfaction)}</TableCell>
                      <TableCell>
                        {response.would_reuse === null ? (
                          <span className="text-muted-foreground">-</span>
                        ) : response.would_reuse ? (
                          <ThumbsUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <ThumbsDown className="h-4 w-4 text-red-500" />
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{response.would_recommend ?? "-"}</span>
                          {getNpsBadge(response.would_recommend)}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{formatDate(response.submitted_at)}</TableCell>
                      <TableCell>
                        {response.improvement_feedback && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpandedRow(expandedRow === response.id ? null : response.id)}
                          >
                            {expandedRow === response.id ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                    {expandedRow === response.id && response.improvement_feedback && (
                      <TableRow>
                        <TableCell colSpan={8} className="bg-muted/30">
                          <div className="p-4">
                            <p className="text-sm font-medium mb-2">개선 의견:</p>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                              {response.improvement_feedback}
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};