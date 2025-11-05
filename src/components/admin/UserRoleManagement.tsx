import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Shield, UserPlus, Trash2 } from "lucide-react";

export const UserRoleManagement = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("*");

      if (rolesError) throw rolesError;

      const usersWithRoles = profiles?.map((profile) => ({
        ...profile,
        roles: roles?.filter((r) => r.user_id === profile.id).map((r) => r.role) || [],
      }));

      setUsers(usersWithRoles || []);
    } catch (error) {
      console.error("Error loading users:", error);
      toast({
        title: "오류 발생",
        description: "사용자 목록을 불러올 수 없습니다.",
        variant: "destructive",
      });
    }
  };

  const addRole = async () => {
    if (!selectedUserId || !selectedRole) {
      toast({
        title: "입력 오류",
        description: "사용자와 권한을 모두 선택해주세요.",
        variant: "destructive",
      });
      return;
    }

    try {
      // 단일 역할만 유지: 기존 권한 제거 후 선택한 권한만 부여
      const { error: delError } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", selectedUserId);
      if (delError) throw delError;

      const { error: insError } = await supabase
        .from("user_roles")
        .insert([{ user_id: selectedUserId, role: selectedRole as any }]);
      if (insError) throw insError;

      toast({
        title: "권한 부여 완료",
        description: "사용자에게 선택한 단일 권한이 적용되었습니다.",
      });

      setSelectedUserId("");
      setSelectedRole("");
      loadUsers();
    } catch (error: any) {
      toast({
        title: "오류 발생",
        description: error.message || "권한 부여에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const removeRole = async (userId: string, role: string) => {
    try {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", role as any);

      if (error) throw error;

      toast({
        title: "권한 제거 완료",
        description: "사용자의 권한이 제거되었습니다.",
      });

      loadUsers();
    } catch (error: any) {
      toast({
        title: "오류 발생",
        description: error.message || "권한 제거에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const getRoleBadge = (role: string) => {
    const roleMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
      admin: { label: "관리자", variant: "destructive" },
      manager: { label: "매니저", variant: "default" },
      designer: { label: "디자이너", variant: "secondary" },
      customer: { label: "고객", variant: "secondary" },
    };
    
    const roleInfo = roleMap[role] || { label: role, variant: "secondary" };
    return <Badge variant={roleInfo.variant}>{roleInfo.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            권한 부여
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>사용자 선택</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="사용자 선택" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>권한 선택</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="권한 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">관리자</SelectItem>
                  <SelectItem value="manager">매니저</SelectItem>
                  <SelectItem value="designer">디자이너</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button onClick={addRole} className="w-full">
                권한 부여
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              멤버
            </CardTitle>
          </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>이름</TableHead>
                <TableHead>이메일</TableHead>
                <TableHead>권한</TableHead>
                <TableHead>작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.roles.length > 0 ? (
                        user.roles.map((role: string) => (
                          <div key={role}>{getRoleBadge(role)}</div>
                        ))
                      ) : (
                        <Badge variant="secondary">고객</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {user.roles.map((role: string) => (
                        role !== 'customer' && (
                          <Button
                            key={role}
                            variant="ghost"
                            size="sm"
                            onClick={() => removeRole(user.id, role)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
