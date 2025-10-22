import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { differenceInDays } from "date-fns";
import { DateRange } from "react-day-picker";

interface ProjectPauseDialogProps {
  projectId: string;
  pauseCount: number;
}

export const ProjectPauseDialog = ({ projectId, pauseCount }: ProjectPauseDialogProps) => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

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
    if (!dateRange?.from || !dateRange?.to) return;
    
    if (pauseCount >= 2) {
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
        project_id: projectId,
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
      
      setOpen(false);
      setDateRange(undefined);
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">홀딩 신청</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>프로젝트 홀딩 신청</DialogTitle>
          <DialogDescription>
            홀딩 기간을 선택해주세요 (최소 1주일 ~ 최대 2주일). 현재 홀딩 횟수: {pauseCount}/2
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
              className="rounded-md border"
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
            <Button variant="outline" onClick={() => setOpen(false)}>
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
  );
};
