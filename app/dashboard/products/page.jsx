"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/api"
import { Loader2, Plus, Edit2, Trash2, Package, Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ProductsPage() {
  const { toast } = useToast()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
    image: "",
  })

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const data = await api.getProducts({ paginate: false })
      setProducts(data.data || [])
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách sản phẩm",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const productData = {
        ...formData,
        price: Number.parseFloat(formData.price),
      }

      if (selectedProduct) {
        await api.updateProduct(selectedProduct.id, productData)
        toast({
          title: "Thành công",
          description: "Đã cập nhật sản phẩm",
        })
      } else {
        await api.createProduct(productData)
        toast({
          title: "Thành công",
          description: "Đã tạo sản phẩm mới",
        })
      }
      loadProducts()
      resetForm()
      setDialogOpen(false)
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể lưu sản phẩm",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("Bạn có chắc muốn xóa sản phẩm này?")) return

    try {
      await api.deleteProduct(id)
      toast({
        title: "Thành công",
        description: "Đã xóa sản phẩm",
      })
      loadProducts()
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xóa sản phẩm",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (product) => {
    setSelectedProduct(product)
    setFormData({
      name: product.name,
      price: product.price.toString(),
      category: product.category,
      description: product.description,
      image: product.image || "",
    })
    setDialogOpen(true)
  }

  const resetForm = () => {
    setSelectedProduct(null)
    setFormData({
      name: "",
      price: "",
      category: "",
      description: "",
      image: "",
    })
  }

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-balance">Quản lý Sản phẩm</h1>
            <p className="text-muted-foreground mt-2 text-pretty">Quản lý danh mục sản phẩm cho chatbot AI</p>
          </div>
          <Dialog
            open={dialogOpen}
            onOpenChange={(open) => {
              setDialogOpen(open)
              if (!open) resetForm()
            }}
          >
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Thêm sản phẩm
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{selectedProduct ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}</DialogTitle>
                <DialogDescription>
                  Điền thông tin sản phẩm để chatbot có thể giới thiệu cho khách hàng
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Tên sản phẩm *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="VD: iPhone 15 Pro Max"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Giá (VNĐ) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="29990000"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Danh mục *</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="VD: Điện thoại"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Mô tả *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Mô tả chi tiết về sản phẩm..."
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">URL hình ảnh</Label>
                  <Input
                    id="image"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                  {formData.image && (
                    <div className="mt-2">
                      <img
                        src={formData.image || "/placeholder.svg"}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-lg border border-border"
                        onError={(e) => {
                          e.target.style.display = "none"
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" disabled={saving} className="flex-1">
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang lưu...
                      </>
                    ) : selectedProduct ? (
                      "Cập nhật"
                    ) : (
                      "Tạo mới"
                    )}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Hủy
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle>Danh sách sản phẩm</CardTitle>
                <CardDescription>{products.length} sản phẩm</CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>{searchTerm ? "Không tìm thấy sản phẩm" : "Chưa có sản phẩm nào"}</p>
              </div>
            ) : (
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sản phẩm</TableHead>
                      <TableHead>Danh mục</TableHead>
                      <TableHead>Giá</TableHead>
                      <TableHead>Mô tả</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {product.image ? (
                              <img
                                src={product.image || "/placeholder.svg"}
                                alt={product.name}
                                className="w-10 h-10 rounded object-cover"
                                onError={(e) => {
                                  e.target.style.display = "none"
                                }}
                              />
                            ) : (
                              <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                                <Package className="h-5 w-5 text-muted-foreground" />
                              </div>
                            )}
                            <span className="font-medium">{product.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{product.category}</Badge>
                        </TableCell>
                        <TableCell className="font-semibold text-primary">
                          {product.price.toLocaleString("vi-VN")} đ
                        </TableCell>
                        <TableCell className="max-w-xs truncate text-muted-foreground">{product.description}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="icon" variant="outline" onClick={() => handleEdit(product)}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="outline" onClick={() => handleDelete(product.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
