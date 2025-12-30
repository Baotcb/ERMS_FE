"use client"

import { Navbar } from "@/components/common/navbar"
import { Footer } from "@/components/common/footer"
import { Users, Target, Lightbulb, Trophy, Globe, Heart } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 py-20 px-4">
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:32px_32px]" />
          <div className="container mx-auto relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">
                Về Chúng Tôi
              </h1>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                ERMS - Enterprise Resource Management System là giải pháp quản trị nguồn lực doanh nghiệp toàn diện với sự hỗ trợ của AI
              </p>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20 px-4 bg-white">
          <div className="container mx-auto">
            <div className="max-w-3xl mx-auto text-center space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                Sứ Mệnh Của Chúng Tôi
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                Cung cấp nền tảng quản trị nguồn lực doanh nghiệp hiện đại, giúp các tổ chức tối ưu hóa quy trình, 
                nâng cao hiệu quả làm việc và tạo ra môi trường làm việc lý tưởng cho nhân sự.
              </p>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 px-4 bg-slate-50">
          <div className="container mx-auto">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                Giá Trị Cốt Lõi
              </h2>
              <p className="text-lg text-slate-600">
                Những giá trị định hình văn hóa và cách chúng tôi làm việc
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                  <Target className="h-7 w-7 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Tập Trung Kết Quả</h3>
                <p className="text-slate-600">
                  Chúng tôi cam kết mang lại giá trị thực tế và kết quả đo lường được cho mọi khách hàng.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
                  <Lightbulb className="h-7 w-7 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Đổi Mới Sáng Tạo</h3>
                <p className="text-slate-600">
                  Không ngừng học hỏi và áp dụng công nghệ mới để tạo ra giải pháp tốt hơn.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                  <Users className="h-7 w-7 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Hợp Tác</h3>
                <p className="text-slate-600">
                  Tin vào sức mạnh của sự hợp tác và làm việc cùng nhau để đạt được mục tiêu chung.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center mb-6">
                  <Trophy className="h-7 w-7 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Chất Lượng</h3>
                <p className="text-slate-600">
                  Đặt chất lượng lên hàng đầu trong mọi sản phẩm và dịch vụ chúng tôi cung cấp.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-rose-100 rounded-xl flex items-center justify-center mb-6">
                  <Heart className="h-7 w-7 text-rose-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Khách Hàng Là Trung Tâm</h3>
                <p className="text-slate-600">
                  Luôn đặt nhu cầu và trải nghiệm của khách hàng làm trọng tâm trong mọi quyết định.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-cyan-100 rounded-xl flex items-center justify-center mb-6">
                  <Globe className="h-7 w-7 text-cyan-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Tầm Nhìn Toàn Cầu</h3>
                <p className="text-slate-600">
                  Mở rộng biên giới và mang giải pháp của chúng tôi đến mọi nơi trên thế giới.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 px-4 bg-white">
          <div className="container mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">500+</div>
                <p className="text-slate-600">Khách Hàng</p>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">50+</div>
                <p className="text-slate-600">Quốc Gia</p>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">99%</div>
                <p className="text-slate-600">Hài Lòng</p>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">24/7</div>
                <p className="text-slate-600">Hỗ Trợ</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

