import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Save, RotateCcw } from "lucide-react";

interface EmailTemplate {
  id: string;
  template_key: string;
  subject: string;
  html_content: string;
  description: string | null;
}

export const EmailTemplateManager = () => {
  const { toast } = useToast();
  const [template, setTemplate] = useState<EmailTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editedSubject, setEditedSubject] = useState("");
  const [editedContent, setEditedContent] = useState("");

  useEffect(() => {
    loadTemplate();
  }, []);

  const loadTemplate = async () => {
    try {
      const { data, error } = await supabase
        .from("email_templates")
        .select("*")
        .eq("template_key", "contract_expiring")
        .single();

      if (error) throw error;

      setTemplate(data);
      setEditedSubject(data.subject);
      setEditedContent(data.html_content);
    } catch (error) {
      console.error("Error loading template:", error);
      toast({
        title: "템플릿 로드 실패",
        description: "이메일 템플릿을 불러오는 데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!template) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("email_templates")
        .update({
          subject: editedSubject,
          html_content: editedContent,
          updated_at: new Date().toISOString(),
        })
        .eq("id", template.id);

      if (error) throw error;

      toast({
        title: "저장 완료",
        description: "이메일 템플릿이 성공적으로 저장되었습니다.",
      });

      await loadTemplate();
    } catch (error) {
      console.error("Error saving template:", error);
      toast({
        title: "저장 실패",
        description: "이메일 템플릿 저장에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (template) {
      setEditedSubject(template.subject);
      setEditedContent(template.html_content);
      toast({
        title: "초기화 완료",
        description: "변경사항이 초기화되었습니다.",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            이메일 템플릿 관리
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">로딩 중...</div>
        </CardContent>
      </Card>
    );
  }

  if (!template) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            이메일 템플릿 관리
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            템플릿을 찾을 수 없습니다.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          이메일 템플릿 관리
        </CardTitle>
        <CardDescription>
          계약 만료 예정 고객에게 발송되는 이메일 템플릿을 수정할 수 있습니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="subject">이메일 제목</Label>
          <Input
            id="subject"
            value={editedSubject}
            onChange={(e) => setEditedSubject(e.target.value)}
            placeholder="이메일 제목"
          />
          <p className="text-xs text-muted-foreground">
            사용 가능한 변수: {`{{customerName}}`} (고객 이름)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">이메일 내용 (HTML)</Label>
          <Textarea
            id="content"
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            placeholder="이메일 HTML 내용"
            rows={20}
            className="font-mono text-sm"
          />
          <div className="text-xs text-muted-foreground space-y-1">
            <p>사용 가능한 변수:</p>
            <ul className="list-disc list-inside ml-2">
              <li>{`{{customerName}}`} - 고객 이름</li>
              <li>{`{{endDate}}`} - 계약 만료 예정일</li>
              <li>{`{{surveyLink}}`} - 만족도 조사 링크</li>
            </ul>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "저장 중..." : "저장"}
          </Button>
          <Button
            onClick={handleReset}
            variant="outline"
            disabled={isSaving}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            초기화
          </Button>
        </div>

        <div className="p-4 bg-secondary/50 rounded-lg border border-border">
          <h4 className="font-semibold mb-2">미리보기</h4>
          <div className="p-4 bg-background rounded border border-border">
            <div className="text-sm font-semibold mb-3">{editedSubject}</div>
            <div 
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ 
                __html: editedContent
                  .replace(/\{\{customerName\}\}/g, '홍길동')
                  .replace(/\{\{endDate\}\}/g, '2024년 12월 31일')
                  .replace(/\{\{surveyLink\}\}/g, '#')
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
