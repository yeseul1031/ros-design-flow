import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { differenceInDays, format } from "date-fns";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";

interface Project {
  id: string;
  start_date: string;
  end_date: string;
  status: string;
  pause_count: number;
  paused_days: number;
  designers?: { name: string } | null;
}

interface ProjectSectionProps {
  projects: Project[];
  onRefresh: () => void;
}

export const ProjectSection = ({ projects, onRefresh }: ProjectSectionProps) => {
  const [activeProjectTab, setActiveProjectTab] = useState<"active" | "holding">("active");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const activeProjects = projects.filter(p => p.status === 'active' || p.status === 'expiring_soon');
  const holdingProjects = projects.filter(p => p.status === 'paused' || p.status === 'on_hold');

  const displayedProjects = activeProjectTab === "active" ? activeProjects : holdingProjects;

  const handleDateRangeSelect = (range: DateRange | undefined) => {
    if (!range?.from || !range?.to) {
      setDateRange(range);
      return;
    }
    
    const days = differenceInDays(range.to, range.from) + 1;
    if (days < 7) {
      toast({
        title: "기간 오류",
        description: "최소 1주일(7일) 이상 선택해주세요.",
        variant: "destructive",
      });
      setDateRange({ from: range.from, to: undefined });
      return;
    }
    if (days > 14) {
      toast({
        title: "기간 오류",
        description: "최대 2주일(14일)까지만 선택 가능합니다.",
        variant: "destructive",
      });
      setDateRange({ from: range.from, to: undefined });
      return;
    }
    setDateRange(range);
  };

  const handleSubmit = async () => {
    if (!dateRange?.from || !dateRange?.to || !selectedProject) return;
    
    if (selectedProject.pause_count >= 2) {
      toast({
        title: "홀딩 불가",
        description: "홀딩은 최대 2회까지만 가능합니다.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    const pauseDays = differenceInDays(dateRange.to, dateRange.from) + 1;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("로그인이 필요합니다.");

      const { error } = await supabase.from("project_pause_requests").insert({
        project_id: selectedProject.id,
        user_id: user.id,
        start_date: dateRange.from.toISOString().split('T')[0],
        end_date: dateRange.to.toISOString().split('T')[0],
        pause_days: pauseDays,
        status: 'pending',
      });

      if (error) throw error;

      toast({
        title: "홀딩 신청 완료",
        description: "홀딩 신청이 접수되었습니다. 매니저 확인 후 처리됩니다.",
      });
      
      setSelectedProject(null);
      setDateRange(undefined);
      onRefresh();
    } catch (error: any) {
      toast({
        title: "홀딩 신청 실패",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), 'yyyy. MM. dd');
  };

  return (
    <>
      <div>
        <h2 className="text-lg font-bold mb-4">프로젝트</h2>
        
        {/* Project Tabs */}
        <div className="flex border rounded-lg overflow-hidden mb-6">
          <button
            onClick={() => setActiveProjectTab("active")}
            className={cn(
              "flex-1 py-3 text-sm font-medium transition-colors",
              activeProjectTab === "active"
                ? "bg-background text-primary border-r"
                : "bg-muted/30 text-muted-foreground"
            )}
          >
            진행 중
          </button>
          <button
            onClick={() => setActiveProjectTab("holding")}
            className={cn(
              "flex-1 py-3 text-sm font-medium transition-colors",
              activeProjectTab === "holding"
                ? "bg-background text-foreground"
                : "bg-muted/30 text-muted-foreground"
            )}
          >
            홀딩
          </button>
        </div>

        {/* Project List */}
        <div className="space-y-0 divide-y">
          {displayedProjects.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              {activeProjectTab === "active" 
                ? "진행중인 프로젝트가 없습니다" 
                : "홀딩중인 프로젝트가 없습니다"}
            </p>
          ) : (
            displayedProjects.map((project) => (
              <div key={project.id} className="py-6 first:pt-0">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {project.pause_count > 0 && activeProjectTab === "active" && (
                        <Badge variant="outline" className="text-xs text-primary border-primary">
                          홀딩요청
                        </Badge>
                      )}
                      <span className="font-medium">
                        {project.designers?.name || "미정"} 프로젝트
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      디자이너: {project.designers?.name || "미정"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      홀딩 횟수: {project.pause_count || 0}/2
                    </p>
                    <p className="text-sm text-muted-foreground">
                      일시 중지 횟수: {project.paused_days || 0}일
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(project.start_date)} - {formatDate(project.end_date)}
                    </p>
                  </div>
                  {activeProjectTab === "active" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedProject(project)}
                      disabled={project.pause_count >= 2}
                    >
                      홀딩 요청
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Holding Request Dialog */}
      <Dialog open={!!selectedProject} onOpenChange={(open) => !open && setSelectedProject(null)}>
        <DialogContent className="max-w-fit">
          <DialogHeader>
            <DialogTitle>프로젝트 홀딩 신청</DialogTitle>
            <DialogDescription>
              홀딩 기간을 선택해주세요 (최소 1주일 ~ 최대 2주일). 현재 홀딩 횟수: {selectedProject?.pause_count || 0}/2
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">홀딩 기간 선택 (시작일과 종료일 클릭)</h3>
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={handleDateRangeSelect}
                disabled={(date) => date < new Date()}
                className="rounded-md border pointer-events-auto"
                numberOfMonths={2}
              />
            </div>

            {dateRange?.from && dateRange?.to && (
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm">
                  선택한 기간: {differenceInDays(dateRange.to, dateRange.from) + 1}일
                  ({dateRange.from.toLocaleDateString('ko-KR')} ~ {dateRange.to.toLocaleDateString('ko-KR')})
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSelectedProject(null)}>
                취소
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={!dateRange?.from || !dateRange?.to || isSubmitting}
              >
                {isSubmitting ? "신청 중..." : "홀딩 신청"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
