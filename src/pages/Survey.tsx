import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Star, CheckCircle, Loader2 } from "lucide-react";

interface SurveyData {
  id: string;
  customer_name: string | null;
  customer_company: string | null;
  submitted_at: string | null;
}

const Survey = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [surveyData, setSurveyData] = useState<SurveyData | null>(null);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  // Form state
  const [overallSatisfaction, setOverallSatisfaction] = useState<number | null>(null);
  const [designerSatisfaction, setDesignerSatisfaction] = useState<number | null>(null);
  const [communicationSatisfaction, setCommunicationSatisfaction] = useState<number | null>(null);
  const [wouldReuse, setWouldReuse] = useState<boolean | null>(null);
  const [wouldRecommend, setWouldRecommend] = useState<number | null>(null);
  const [improvementFeedback, setImprovementFeedback] = useState("");

  useEffect(() => {
    if (token) {
      loadSurvey();
    }
  }, [token]);

  const loadSurvey = async () => {
    try {
      const { data, error } = await supabase
        .from("survey_responses")
        .select("id, customer_name, customer_company, submitted_at")
        .eq("token", token)
        .single();

      if (error) {
        console.error("Survey not found:", error);
        toast({
          title: "오류",
          description: "유효하지 않은 설문 링크입니다.",
          variant: "destructive",
        });
        return;
      }

      setSurveyData(data);
      if (data.submitted_at) {
        setAlreadySubmitted(true);
      }
    } catch (error) {
      console.error("Error loading survey:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!surveyData) return;
    
    if (overallSatisfaction === null) {
      toast({
        title: "입력 필요",
        description: "전반적인 만족도를 선택해주세요.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("survey_responses")
        .update({
          overall_satisfaction: overallSatisfaction,
          designer_satisfaction: designerSatisfaction,
          communication_satisfaction: communicationSatisfaction,
          would_reuse: wouldReuse,
          would_recommend: wouldRecommend,
          improvement_feedback: improvementFeedback || null,
          submitted_at: new Date().toISOString(),
        })
        .eq("id", surveyData.id);

      if (error) throw error;

      setSubmitted(true);
      toast({
        title: "제출 완료",
        description: "소중한 의견 감사합니다!",
      });
    } catch (error) {
      console.error("Error submitting survey:", error);
      toast({
        title: "제출 실패",
        description: "설문 제출에 실패했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const StarRating = ({ 
    value, 
    onChange, 
    label 
  }: { 
    value: number | null; 
    onChange: (v: number) => void; 
    label: string;
  }) => (
    <div className="space-y-3">
      <Label className="text-base font-medium">{label}</Label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-1 transition-transform hover:scale-110"
          >
            <Star 
              className={`h-8 w-8 ${
                value && star <= value 
                  ? "fill-yellow-400 text-yellow-400" 
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
      {value && (
        <p className="text-sm text-muted-foreground">
          {value === 1 && "매우 불만족"}
          {value === 2 && "불만족"}
          {value === 3 && "보통"}
          {value === 4 && "만족"}
          {value === 5 && "매우 만족"}
        </p>
      )}
    </div>
  );

  const NPSRating = ({ 
    value, 
    onChange 
  }: { 
    value: number | null; 
    onChange: (v: number) => void;
  }) => (
    <div className="space-y-3">
      <Label className="text-base font-medium">
        주변에 저희 서비스를 추천할 의향이 있으신가요?
      </Label>
      <div className="flex gap-1 flex-wrap">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
          <button
            key={score}
            type="button"
            onClick={() => onChange(score)}
            className={`w-10 h-10 rounded-md border text-sm font-medium transition-colors ${
              value === score
                ? score <= 6
                  ? "bg-red-500 text-white border-red-500"
                  : score <= 8
                  ? "bg-yellow-500 text-white border-yellow-500"
                  : "bg-green-500 text-white border-green-500"
                : "bg-card border-border hover:bg-muted"
            }`}
          >
            {score}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>전혀 추천하지 않음</span>
        <span>매우 추천함</span>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!surveyData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">유효하지 않은 링크</h1>
          <p className="text-muted-foreground">설문 링크가 유효하지 않거나 만료되었습니다.</p>
        </div>
      </div>
    );
  }

  if (alreadySubmitted || submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 max-w-md px-4">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
          <h1 className="text-2xl font-bold">설문이 완료되었습니다</h1>
          <p className="text-muted-foreground">
            소중한 의견을 남겨주셔서 감사합니다.<br/>
            더 나은 서비스로 보답하겠습니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">서비스 만족도 조사</h1>
          {surveyData.customer_name && (
            <p className="text-muted-foreground">
              {surveyData.customer_name}님
              {surveyData.customer_company && ` (${surveyData.customer_company})`}
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            더 나은 서비스를 위해 소중한 의견을 들려주세요
          </p>
        </div>

        {/* Survey Form */}
        <div className="bg-card rounded-lg border p-6 space-y-8">
          {/* Overall Satisfaction */}
          <StarRating
            value={overallSatisfaction}
            onChange={setOverallSatisfaction}
            label="전반적인 서비스 만족도 *"
          />

          {/* Designer Satisfaction */}
          <StarRating
            value={designerSatisfaction}
            onChange={setDesignerSatisfaction}
            label="디자이너 결과물 만족도"
          />

          {/* Communication Satisfaction */}
          <StarRating
            value={communicationSatisfaction}
            onChange={setCommunicationSatisfaction}
            label="커뮤니케이션 만족도"
          />

          {/* Would Reuse */}
          <div className="space-y-3">
            <Label className="text-base font-medium">재이용 의향이 있으신가요?</Label>
            <RadioGroup
              value={wouldReuse === null ? undefined : wouldReuse.toString()}
              onValueChange={(v) => setWouldReuse(v === "true")}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="true" id="reuse-yes" />
                <Label htmlFor="reuse-yes" className="cursor-pointer">네, 이용할 의향이 있습니다</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="false" id="reuse-no" />
                <Label htmlFor="reuse-no" className="cursor-pointer">아니오</Label>
              </div>
            </RadioGroup>
          </div>

          {/* NPS */}
          <NPSRating value={wouldRecommend} onChange={setWouldRecommend} />

          {/* Improvement Feedback */}
          <div className="space-y-3">
            <Label className="text-base font-medium">개선 의견이나 건의사항</Label>
            <Textarea
              value={improvementFeedback}
              onChange={(e) => setImprovementFeedback(e.target.value)}
              placeholder="서비스 개선을 위한 의견을 자유롭게 작성해주세요"
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={submitting || overallSatisfaction === null}
            className="w-full h-12 text-base"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                제출 중...
              </>
            ) : (
              "설문 제출하기"
            )}
          </Button>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          본 설문 결과는 서비스 개선을 위해서만 사용됩니다.
        </p>
      </div>
    </div>
  );
};

export default Survey;