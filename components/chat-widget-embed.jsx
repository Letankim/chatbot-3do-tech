"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Check, Eye } from "lucide-react";

export function ChatWidgetEmbed({ apiKey, themeId }) {
  const [copied, setCopied] = useState(false);
  const [apiBase, setApiBase] = useState("https://3docorp.id.vn/rental");
  const [showPreview, setShowPreview] = useState(false);

  const embedCode = `<script src="${
    typeof window !== "undefined" ? window.location.origin : ""
  }/chat-widget.js?api_key=${apiKey || "YOUR_API_KEY"}${
    themeId ? `&theme_id=${themeId}` : ""
  }&api_base=${encodeURIComponent(apiBase)}&include_products=true"></script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (showPreview && apiKey && themeId) {
      // Remove existing widget if any
      const existingScript = document.getElementById(
        "chat-widget-preview-script"
      );
      const existingBtn = document.getElementById("chat-widget-btn");
      const existingModal = document.getElementById("chat-widget-modal");

      if (existingScript) existingScript.remove();
      if (existingBtn) existingBtn.remove();
      if (existingModal) existingModal.remove();

      // Load new widget
      const script = document.createElement("script");
      script.id = "chat-widget-preview-script";
      script.src = `/chat-widget.js?api_key=${apiKey}&theme_id=${themeId}&api_base=${encodeURIComponent(
        apiBase
      )}&include_products=true&t=${Date.now()}`;
      document.body.appendChild(script);
    }
  }, [showPreview, apiKey, themeId, apiBase]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mã nhúng Chat Widget</CardTitle>
        <CardDescription>
          Sao chép và dán vào website của bạn trước thẻ đóng body
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="api-base">API Base URL</Label>
          <Input
            id="api-base"
            value={apiBase}
            onChange={(e) => setApiBase(e.target.value)}
            placeholder="https://3docorp.id.vn/rental"
          />
          <p className="text-xs text-muted-foreground">
            URL backend API của bạn (production hoặc development)
          </p>
        </div>

        <div className="space-y-2">
          <Label>Mã nhúng</Label>
          <div className="flex gap-2">
            <Input value={embedCode} readOnly className="font-mono text-xs" />
            <Button size="icon" variant="outline" onClick={handleCopy}>
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant={showPreview ? "secondary" : "default"}
            onClick={() => setShowPreview(!showPreview)}
            className="flex-1"
          >
            <Eye className="mr-2 h-4 w-4" />
            {showPreview ? "Ẩn Preview" : "Xem Preview"}
          </Button>
        </div>

        {showPreview && (
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-lg border-2 border-dashed border-primary/30">
            <p className="text-sm text-center text-muted-foreground mb-2">
              Chat widget đang hiển thị ở góc dưới bên phải màn hình
            </p>
            <p className="text-xs text-center text-muted-foreground">
              Click vào nút chat để xem giao diện với theme hiện tại
            </p>
          </div>
        )}

        <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
          <p className="font-semibold">Hướng dẫn:</p>
          <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
            <li>Cấu hình API Base URL (URL backend của bạn)</li>
            <li>Sao chép mã nhúng ở trên</li>
            <li>Mở file HTML của website</li>
            <li>Dán mã trước thẻ đóng {`</body>`}</li>
            <li>Lưu và tải lại trang</li>
          </ol>
          <div className="mt-3 pt-3 border-t border-border">
            <p className="font-semibold mb-1">Tham số URL:</p>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>
                <code className="bg-background px-1 py-0.5 rounded">
                  api_key
                </code>{" "}
                - API key của bạn (bắt buộc)
              </li>
              <li>
                <code className="bg-background px-1 py-0.5 rounded">
                  theme_id
                </code>{" "}
                - ID theme để áp dụng
              </li>
              <li>
                <code className="bg-background px-1 py-0.5 rounded">
                  api_base
                </code>{" "}
                - URL backend API
              </li>
              <li>
                <code className="bg-background px-1 py-0.5 rounded">
                  include_products
                </code>{" "}
                - Hiển thị gợi ý sản phẩm (true/false)
              </li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
