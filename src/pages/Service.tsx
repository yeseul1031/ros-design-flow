import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { formatPhoneNumber } from "@/utils/phoneFormat";

const Service = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const payload: any = {
        name: formData.name || "이름 미기재",
        email: formData.email.trim(),
        phone: "",
        company: null,
        service_type: 'custom' as any,
        message: formData.message || '',
        status: 'new' as any,
        user_id: user?.id || null,
        attachments: [],
      };

      const { error } = await supabase.from('leads').insert(payload);
      if (error) throw error;

      toast({
        title: "문의가 접수되었습니다",
        description: "빠른 시일 내에 연락드리겠습니다.",
      });
      setFormData({ name: "", email: "", message: "" });
    } catch (err: any) {
      console.error('Error submitting inquiry:', err);
      toast({
        title: "오류 발생",
        description: "잠시 후 다시 시도해주세요.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <main className="pt-16">
        {/* Hero Section - New Landing Smart Web */}
        <section className="relative bg-black min-h-screen flex items-center justify-center px-4 overflow-hidden">
          <div className="container mx-auto max-w-7xl text-center relative z-10">
            {/* Pink Ring Graphic */}
            <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 opacity-80">
              <div className="w-full h-full rounded-full border-[40px] md:border-[60px] border-pink-500/40 transform rotate-45"></div>
            </div>
            
            <div className="mb-4">
              <p className="text-white/60 text-sm md:text-base tracking-wider uppercase mb-2">
                New Landing
              </p>
              <p className="text-white/60 text-sm md:text-base tracking-wider uppercase">
                Smart Experience
              </p>
            </div>
            
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold text-white mb-8 leading-none tracking-tight">
              Web
            </h1>
            
            <div className="flex items-center justify-center gap-4 text-white/40 text-xs md:text-sm">
              <span>SCROLL</span>
              <div className="w-px h-12 bg-white/40"></div>
            </div>
          </div>
        </section>

        {/* Laptop Showcase Section */}
        <section className="relative bg-black py-20 md:py-32 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="relative">
              {/* Spotlight Effect */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[800px] h-[800px] rounded-full bg-gradient-radial from-purple-500/20 via-transparent to-transparent blur-3xl"></div>
              </div>
              
              {/* Laptop Image */}
              <div className="relative z-10 flex justify-center">
                <div className="relative w-full max-w-4xl">
                  <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl p-8 shadow-2xl border border-white/10">
                    <div className="aspect-video bg-gradient-to-br from-purple-600 via-blue-500 to-cyan-400 rounded-xl overflow-hidden">
                      {/* Placeholder for laptop screen content */}
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-white/20 text-6xl font-bold">ROS</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Reflection */}
                  <div className="absolute -bottom-8 left-0 right-0 h-32 bg-gradient-to-b from-white/5 to-transparent blur-xl"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Portfolio Grid Section */}
        <section className="bg-white py-20 md:py-32 px-4">
          <div className="container mx-auto max-w-7xl">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {/* Row 1 */}
              <div className="col-span-1 aspect-square bg-gradient-to-br from-blue-400 to-cyan-300 rounded-2xl overflow-hidden">
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-32 h-32 bg-blue-500/30 rounded-full"></div>
                </div>
              </div>
              <div className="col-span-1 aspect-square bg-gradient-to-br from-sky-200 to-blue-300 rounded-2xl overflow-hidden flex items-center justify-center">
                <div className="text-white text-4xl font-bold">◆</div>
              </div>
              <div className="col-span-2 md:col-span-1 aspect-square bg-white rounded-2xl overflow-hidden border-4 border-gray-100"></div>
              
              {/* Row 2 */}
              <div className="col-span-2 aspect-video bg-gradient-to-r from-pink-200 via-red-200 to-pink-300 rounded-2xl overflow-hidden"></div>
              <div className="col-span-1 aspect-square bg-white rounded-2xl overflow-hidden border-4 border-gray-100"></div>
              
              {/* Row 3 */}
              <div className="col-span-1 aspect-square bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl overflow-hidden"></div>
              <div className="col-span-1 aspect-square bg-white rounded-2xl overflow-hidden border-4 border-gray-100"></div>
              <div className="col-span-1 aspect-square bg-gradient-to-br from-gray-700 to-gray-900 rounded-2xl overflow-hidden"></div>
              
              {/* Row 4 */}
              <div className="col-span-1 aspect-square bg-gradient-to-br from-gray-900 to-black rounded-2xl overflow-hidden"></div>
              <div className="col-span-2 aspect-video bg-gradient-to-r from-green-300 to-emerald-400 rounded-2xl overflow-hidden"></div>
            </div>
          </div>
        </section>

        {/* Text Section */}
        <section className="bg-white py-12 md:py-20 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <p className="text-gray-800 text-lg md:text-xl leading-relaxed">
              디자인의 새로운 방식을 경험하세요
            </p>
          </div>
        </section>

        {/* Pricing Cards Section */}
        <section className="bg-white py-20 md:py-32 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="grid md:grid-cols-3 gap-6 md:gap-8">
              {/* Blue Card */}
              <Card className="bg-gradient-to-br from-blue-500 to-cyan-400 border-0 rounded-3xl p-8 md:p-10 text-white transform hover:scale-105 transition-transform duration-300">
                <div className="mb-8">
                  <div className="w-12 h-12 bg-white/20 rounded-xl mb-4"></div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-2">Basic</h3>
                  <p className="text-white/80 text-sm">스타트업을 위한 기본 플랜</p>
                </div>
                <div className="mb-8">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl md:text-6xl font-bold">100</span>
                    <span className="text-xl">만원</span>
                  </div>
                  <p className="text-white/80 text-sm mt-2">/월</p>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-sm">무제한 디자인 요청</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-sm">평균 2일 내 완료</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-sm">1명의 디자이너</span>
                  </li>
                </ul>
                <Button className="w-full bg-white text-blue-600 hover:bg-white/90 font-semibold py-6 rounded-xl">
                  시작하기
                </Button>
              </Card>

              {/* Purple Card - Featured */}
              <Card className="bg-gradient-to-br from-purple-600 to-violet-500 border-0 rounded-3xl p-8 md:p-10 text-white transform hover:scale-105 transition-transform duration-300 shadow-2xl shadow-purple-500/50">
                <div className="absolute top-4 right-4">
                  <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold">
                    인기
                  </span>
                </div>
                <div className="mb-8">
                  <div className="w-12 h-12 bg-white/20 rounded-xl mb-4"></div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-2">Pro</h3>
                  <p className="text-white/80 text-sm">성장하는 비즈니스를 위한</p>
                </div>
                <div className="mb-8">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl md:text-6xl font-bold">200</span>
                    <span className="text-xl">만원</span>
                  </div>
                  <p className="text-white/80 text-sm mt-2">/월</p>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-sm">모든 Basic 기능</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-sm">평균 1일 내 완료</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-sm">2명의 디자이너</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-sm">우선 지원</span>
                  </li>
                </ul>
                <Button className="w-full bg-white text-purple-600 hover:bg-white/90 font-semibold py-6 rounded-xl">
                  시작하기
                </Button>
              </Card>

              {/* Green Card */}
              <Card className="bg-gradient-to-br from-green-500 to-emerald-400 border-0 rounded-3xl p-8 md:p-10 text-white transform hover:scale-105 transition-transform duration-300">
                <div className="mb-8">
                  <div className="w-12 h-12 bg-white/20 rounded-xl mb-4"></div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-2">Enterprise</h3>
                  <p className="text-white/80 text-sm">대규모 팀을 위한</p>
                </div>
                <div className="mb-8">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl md:text-6xl font-bold">Custom</span>
                  </div>
                  <p className="text-white/80 text-sm mt-2">맞춤형 견적</p>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-sm">모든 Pro 기능</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-sm">전담 팀 배정</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-sm">24/7 지원</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-sm">브랜딩 가이드</span>
                  </li>
                </ul>
                <Button className="w-full bg-white text-green-600 hover:bg-white/90 font-semibold py-6 rounded-xl">
                  문의하기
                </Button>
              </Card>
            </div>
          </div>
        </section>

        {/* Divider Section */}
        <section className="bg-white py-12">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          </div>
        </section>

        {/* CTA Section - JOIN THE NEW WAY TO DESIGN */}
        <section className="bg-gradient-to-br from-gray-900 via-purple-900 to-black py-20 md:py-32 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
                JOIN THE NEW WAY
                <br />
                TO DESIGN
              </h2>
              <p className="text-white/60 text-lg">
                지금 바로 시작하세요
              </p>
            </div>

            <Card className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 md:p-12">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name" className="text-white text-base mb-2 block">
                    이름
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="홍길동"
                    className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-xl"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-white text-base mb-2 block">
                    이메일
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="example@email.com"
                    className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-xl"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="message" className="text-white text-base mb-2 block">
                    메시지
                  </Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="프로젝트에 대해 알려주세요"
                    rows={6}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-xl"
                  />
                </div>

                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full h-14 text-lg bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/50"
                >
                  시작하기
                </Button>
              </form>
            </Card>
          </div>
        </section>

        {/* Footer Info Section */}
        <section className="bg-black py-12 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-wrap justify-center gap-8 text-white/40 text-sm">
              <a href="#" className="hover:text-white transition-colors">About</a>
              <a href="#" className="hover:text-white transition-colors">Services</a>
              <a href="#" className="hover:text-white transition-colors">Portfolio</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Service;
