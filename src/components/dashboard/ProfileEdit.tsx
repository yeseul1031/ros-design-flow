import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { formatPhoneNumber } from "@/utils/phoneFormat";

interface ProfileEditProps {
  profile: any;
  onProfileUpdate: () => void;
}

export const ProfileEdit = ({ profile, onProfileUpdate }: ProfileEditProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(profile?.name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [company, setCompany] = useState(profile?.company || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("로그인이 필요합니다.");

      const { error } = await supabase
        .from("profiles")
        .update({
          name,
          phone,
          company,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "프로필 수정 완료",
        description: "프로필이 성공적으로 업데이트되었습니다.",
      });

      setIsEditing(false);
      onProfileUpdate();
    } catch (error: any) {
      toast({
        title: "프로필 수정 실패",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setName(profile?.name || "");
    setPhone(profile?.phone || "");
    setCompany(profile?.company || "");
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>프로필 정보</CardTitle>
            <CardDescription>담당자 정보를 수정할 수 있습니다</CardDescription>
          </div>
          {!isEditing && (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              수정
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">이름</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름을 입력하세요"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">이메일</label>
              <Input
                value={profile?.email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground mt-1">이메일은 변경할 수 없습니다</p>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">연락처</label>
              <Input
                value={phone}
                onChange={handlePhoneChange}
                placeholder="000-0000-0000"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">회사명</label>
              <Input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="회사명을 입력하세요"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleCancel}>
                취소
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "저장 중..." : "저장"}
              </Button>
            </div>
          </form>
        ) : (
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">이름</dt>
              <dd className="text-lg">{profile?.name || "-"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">이메일</dt>
              <dd className="text-lg">{profile?.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">연락처</dt>
              <dd className="text-lg">{profile?.phone || "-"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">회사명</dt>
              <dd className="text-lg">{profile?.company || "-"}</dd>
            </div>
          </dl>
        )}
      </CardContent>
    </Card>
  );
};
