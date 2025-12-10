import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Bell, Check, CheckCheck } from "lucide-react";
import type { User } from "@supabase/supabase-js";

const Notifications = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
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
        loadData(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadData = async (userId: string) => {
    try {
      const [profileResult, notificationsResult] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).single(),
        supabase.from("notifications").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
      ]);

      if (profileResult.error) throw profileResult.error;
      setProfile(profileResult.data);
      setNotifications(notificationsResult.data || []);

    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationClick = async (notification: any) => {
    setSelectedNotification(notification);
    
    if (!notification.is_read) {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notification.id);
      
      if (!error) {
        setNotifications(notifications.map(n => 
          n.id === notification.id ? { ...n, is_read: true } : n
        ));
      }
    }
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
    
    if (unreadIds.length === 0) {
      toast({
        title: "모든 알림을 읽었습니다",
        description: "읽지 않은 알림이 없습니다.",
      });
      return;
    }

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .in("id", unreadIds);
    
    if (!error) {
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      toast({
        title: "모든 알림을 읽음으로 표시했습니다",
        description: `${unreadIds.length}개의 알림을 읽음으로 표시했습니다.`,
      });
    } else {
      toast({
        title: "오류가 발생했습니다",
        description: "알림을 업데이트하는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">로딩 중...</div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <DashboardLayout 
      profile={profile}
      annualLeave={{ used: 12, total: 15 }}
      joinDate="2025-01-12"
      notificationCount={2}
      projectCount={4}
    >
      <div className="p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">알림</h1>
            <p className="text-muted-foreground">
              {unreadCount > 0 ? `읽지 않은 알림 ${unreadCount}개` : "모든 알림을 읽었습니다"}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} variant="outline" className="gap-2">
              <CheckCheck className="h-4 w-4" />
              모두 읽음
            </Button>
          )}
        </div>

        {notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`cursor-pointer hover:bg-[#F7F7FB]/45 transition-colors ${
                  notification.is_read ? 'opacity-70' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`mt-1 p-2 rounded-full ${
                        notification.is_read ? 'bg-muted' : 'bg-accent/10'
                      }`}>
                        <Bell className={`h-4 w-4 ${
                          notification.is_read ? 'text-muted-foreground' : 'text-accent'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-base mb-2 flex items-center gap-2">
                          {notification.title}
                          {notification.is_read && (
                            <Check className="h-4 w-4 text-muted-foreground" />
                          )}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(notification.created_at).toLocaleDateString('ko-KR')} {new Date(notification.created_at).toLocaleTimeString('ko-KR')}
                        </p>
                      </div>
                    </div>
                    {!notification.is_read && (
                      <Badge variant="default" className="ml-2">New</Badge>
                    )}
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">알림이 없습니다.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notification Detail Dialog */}
        <Dialog open={!!selectedNotification} onOpenChange={() => setSelectedNotification(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedNotification?.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{selectedNotification?.message}</p>
              <p className="text-xs text-muted-foreground">
                {selectedNotification && new Date(selectedNotification.created_at).toLocaleDateString('ko-KR')} {selectedNotification && new Date(selectedNotification.created_at).toLocaleTimeString('ko-KR')}
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Notifications;
