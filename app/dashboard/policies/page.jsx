"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { api } from "@/lib/api"
import { Loader2, Save, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function PoliciesPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [policies, setPolicies] = useState({
    about_us: "",
    terms_of_service: "",
    refund_policy: "",
    privacy_policy: "",
  })

  useEffect(() => {
    loadPolicies()
  }, [])

  const loadPolicies = async () => {
    try {
      const data = await api.getPolicies()
      setPolicies(data)
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải chính sách",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.updatePolicies(policies)
      toast({
        title: "Thành công",
        description: "Đã cập nhật chính sách",
      })
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể lưu chính sách",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const updatePolicy = (key, value) => {
    setPolicies((prev) => ({ ...prev, [key]: value }))
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-balance">Quản lý Chính sách</h1>
            <p className="text-muted-foreground mt-2 text-pretty">
              Cập nhật các chính sách và điều khoản của doanh nghiệp
            </p>
          </div>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Lưu tất cả
              </>
            )}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Nội dung chính sách</CardTitle>
            <CardDescription>Chatbot sẽ sử dụng thông tin này để trả lời câu hỏi của khách hàng</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="about">Về chúng tôi</TabsTrigger>
                <TabsTrigger value="terms">Điều khoản</TabsTrigger>
                <TabsTrigger value="refund">Hoàn tiền</TabsTrigger>
                <TabsTrigger value="privacy">Bảo mật</TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="about_us">Về chúng tôi</Label>
                  <Textarea
                    id="about_us"
                    value={policies.about_us}
                    onChange={(e) => updatePolicy("about_us", e.target.value)}
                    placeholder="Giới thiệu về công ty, sứ mệnh, tầm nhìn..."
                    rows={12}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">{policies.about_us.length} ký tự</p>
                </div>
              </TabsContent>

              <TabsContent value="terms" className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="terms_of_service">Điều khoản dịch vụ</Label>
                  <Textarea
                    id="terms_of_service"
                    value={policies.terms_of_service}
                    onChange={(e) => updatePolicy("terms_of_service", e.target.value)}
                    placeholder="Các điều khoản và điều kiện sử dụng dịch vụ..."
                    rows={12}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">{policies.terms_of_service.length} ký tự</p>
                </div>
              </TabsContent>

              <TabsContent value="refund" className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="refund_policy">Chính sách hoàn tiền</Label>
                  <Textarea
                    id="refund_policy"
                    value={policies.refund_policy}
                    onChange={(e) => updatePolicy("refund_policy", e.target.value)}
                    placeholder="Quy định về hoàn tiền, đổi trả sản phẩm..."
                    rows={12}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">{policies.refund_policy.length} ký tự</p>
                </div>
              </TabsContent>

              <TabsContent value="privacy" className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="privacy_policy">Chính sách bảo mật</Label>
                  <Textarea
                    id="privacy_policy"
                    value={policies.privacy_policy}
                    onChange={(e) => updatePolicy("privacy_policy", e.target.value)}
                    placeholder="Cách thức thu thập và bảo vệ thông tin khách hàng..."
                    rows={12}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">{policies.privacy_policy.length} ký tự</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Hướng dẫn
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Chatbot AI sẽ sử dụng thông tin này để trả lời câu hỏi của khách hàng</p>
            <p>• Viết rõ ràng, chi tiết để chatbot có thể cung cấp thông tin chính xác</p>
            <p>• Cập nhật thường xuyên khi có thay đổi về chính sách</p>
            <p>• Sử dụng ngôn ngữ dễ hiểu, tránh thuật ngữ phức tạp</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
