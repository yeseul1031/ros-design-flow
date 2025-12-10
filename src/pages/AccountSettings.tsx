import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ProfileEdit } from "@/components/dashboard/ProfileEdit";
import { PaymentInfo } from "@/components/dashboard/PaymentInfo";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

const AccountSettings = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      } else {
        loadProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">로딩 중...</div>
      </div>
    );
  }

  return (
    <DashboardLayout 
      profile={profile}
      annualLeave={{ used: 12, total: 15 }}
      joinDate="2025-01-12"
      notificationCount={2}
      projectCount={4}
    >
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">계정 설정</h1>
          <p className="text-muted-foreground">프로필 정보와 결제 정보를 관리하세요.</p>
        </div>

        <div className="space-y-8">
          <ProfileEdit profile={profile} onProfileUpdate={() => loadProfile(user!.id)} />
          <PaymentInfo />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AccountSettings;
