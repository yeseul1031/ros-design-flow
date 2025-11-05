import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatPhoneNumber } from "@/utils/phoneFormat";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const formSchema = z.object({
  name: z.string().trim().min(2, "이름을 2자 이상 입력해주세요").max(100, "이름은 100자 이하로 입력해주세요"),
  email: z.string().trim().email("올바른 이메일 주소를 입력해주세요").max(255, "이메일은 255자 이하로 입력해주세요"),
  phone: z.string().trim().min(10, "연락처를 입력해주세요").max(20, "연락처는 20자 이하로 입력해주세요"),
  company: z.string().trim().max(100, "회사명은 100자 이하로 입력해주세요").optional(),
  serviceType: z.string().min(1, "서비스 유형을 선택해주세요"),
  message: z.string().trim().min(10, "요구사항을 10자 이상 입력해주세요").max(1000, "요구사항은 1000자 이하로 입력해주세요"),
});

type FormValues = z.infer<typeof formSchema>;

export const ConsultationForm = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      serviceType: "",
      message: "",
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    const validFiles = selectedFiles.filter(file => {
      if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
        toast({
          title: "파일 형식 오류",
          description: `${file.name}은(는) 지원하지 않는 파일 형식입니다.`,
          variant: "destructive",
        });
        return false;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: "파일 크기 오류",
          description: `${file.name}의 크기가 10MB를 초과합니다.`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });

    setFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // Get current user if logged in
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("leads")
        .insert([
          {
            name: values.name,
            email: values.email,
            phone: values.phone,
            company: values.company || null,
            service_type: values.serviceType as any,
            message: values.message,
            status: 'new',
            attachments: files.map(f => f.name),
            user_id: user?.id || null,
          },
        ])
        .select();

      if (error) throw error;
      
      toast({
        title: "상담 신청 완료",
        description: "24시간 내 연락드리겠습니다.",
      });
      
      form.reset();
      setFiles([]);
    } catch (error) {
      console.error("Error submitting consultation:", error);
      toast({
        title: "오류 발생",
        description: "잠시 후 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-card p-8 rounded-lg border border-border">
        <FormField
          control={form.control}
          name="serviceType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>서비스 유형 *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="선택해주세요" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="brand">브랜드 패키지</SelectItem>
                  <SelectItem value="web">웹 디자인 패키지</SelectItem>
                  <SelectItem value="allinone">올인원 패키지</SelectItem>
                  <SelectItem value="custom">맞춤 상담</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>이름 *</FormLabel>
                <FormControl>
                  <Input placeholder="홍길동" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel>회사명</FormLabel>
                <FormControl>
                  <Input placeholder="주식회사 ROS" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>이메일 *</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="hello@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>연락처 *</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="010-1234-5678" 
                    {...field}
                    onChange={(e) => {
                      const formatted = formatPhoneNumber(e.target.value);
                      field.onChange(formatted);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>프로젝트 요구사항 *</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="프로젝트에 대해 자세히 설명해주세요. 목표, 일정, 예산 등을 포함해주시면 더 정확한 상담이 가능합니다."
                  className="min-h-[150px] resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <FormLabel>참고 파일 첨부</FormLabel>
          <div className="mt-2">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold">클릭하여 파일 선택</span> 또는 드래그 앤 드롭
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  JPG, PNG, PDF, DOC (최대 10MB)
                </p>
              </div>
              <input
                type="file"
                className="hidden"
                multiple
                accept={ACCEPTED_FILE_TYPES.join(",")}
                onChange={handleFileChange}
              />
            </label>
          </div>

          {files.length > 0 && (
            <div className="mt-4 space-y-2">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                >
                  <span className="text-sm text-foreground truncate">{file.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                  >
                    삭제
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "제출 중..." : "상담 신청하기"}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          제출하신 정보는 상담 목적으로만 사용되며, 개인정보 보호정책에 따라 안전하게 관리됩니다.
        </p>
      </form>
    </Form>
  );
};
