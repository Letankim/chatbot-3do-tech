"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { Loader2, Eye, Palette, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export default function PreviewPage() {
  const { toast } = useToast();
  const [themes, setThemes] = useState([]);
  const [selectedThemeId, setSelectedThemeId] = useState(null);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [embedThemeId, setEmbedThemeId] = useState(null);
  const [copied, setCopied] = useState(false);

  const [openSections, setOpenSections] = useState({
    themeInfo: true,
    embedCode: false,
  });

  useEffect(() => {
    loadThemes();
  }, []);

  useEffect(() => {
    if (selectedThemeId) {
      const theme = themes.find(
        (t) => t.id === Number.parseInt(selectedThemeId)
      );
      if (theme) {
        setSelectedTheme(theme);
      }
    }
  }, [selectedThemeId, themes]);

  useEffect(() => {
    if (themes.length > 0 && !embedThemeId) {
      setEmbedThemeId(themes[0].id.toString());
    }
  }, [themes, embedThemeId]);

  const loadThemes = async () => {
    try {
      const data = await api.getThemes();
      setThemes(data.data || []);
      if (data.data && data.data.length > 0) {
        setSelectedThemeId(data.data[0].id.toString());
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách theme",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const copyEmbedCode = () => {
    const embedCode = `<script src="https://your-domain.com/chat-widget.js?api_key=YOUR_API_KEY&theme_id=${embedThemeId}"></script>`;
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    toast({
      title: "Đã sao chép",
      description: "Mã nhúng đã được sao chép vào clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const renderIconPreview = (icon, iconType) => {
    if (iconType === "emoji") {
      return <span className="text-xl">{icon}</span>;
    } else if (iconType === "image") {
      return (
        <img
          src={icon || "/placeholder.svg"}
          alt="Icon"
          className="w-5 h-5 object-contain"
        />
      );
    } else if (iconType === "boxicon") {
      return (
        <i
          className={icon}
          style={{
            fontSize: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        ></i>
      );
    }
    return <span className="text-xl">{icon}</span>;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const style = selectedTheme?.style
    ? typeof selectedTheme.style === "string"
      ? JSON.parse(selectedTheme.style)
      : selectedTheme.style
    : null;

  if (style) {
    style.title = style.title || "Trợ lý AI";
    style.botMessageBg = style.botMessageBg || "#ffffff";
    style.botMessageText = style.botMessageText || "#1f2937";
    style.userMessageBg = style.userMessageBg || "gradient";
    style.userMessageText = style.userMessageText || "#ffffff";
    style.chatBackground = style.chatBackground || "#f9fafb";
    style.poweredByText = style.poweredByText || "Powered by 3do tech";
    style.inputBg = style.inputBg || "#f3f4f6";
    style.inputText = style.inputText || "#1f2937";
    style.inputPlaceholder = style.inputPlaceholder || "#9ca3af";
    style.sendButtonBg = style.sendButtonBg || "gradient";
    style.sendButtonIcon = style.sendButtonIcon || "#ffffff";
    style.chatButtonIcon = style.chatButtonIcon || "💬";
    style.chatButtonIconType = style.chatButtonIconType || "emoji";
    style.chatButtonBg = style.chatButtonBg || "gradient";
    style.chatButtonSize = style.chatButtonSize || "60";
    style.chatButtonPosition = style.chatButtonPosition || "bottom-right";
    style.chatButtonAnimation = style.chatButtonAnimation || "pulse";
    style.fontFamily = style.fontFamily || "system-ui";
  }

  const userMessageStyle =
    style?.userMessageBg === "gradient"
      ? {
          background: `linear-gradient(135deg, ${style.primaryColor} 0%, ${style.secondaryColor} 100%)`,
          color: style.userMessageText,
        }
      : {
          backgroundColor: style?.userMessageBg,
          color: style?.userMessageText,
        };

  const sendButtonStyle = style
    ? style.sendButtonBg === "gradient"
      ? {
          background: `linear-gradient(135deg, ${style.primaryColor} 0%, ${style.secondaryColor} 100%)`,
          color: style.sendButtonIcon,
        }
      : {
          backgroundColor: style.sendButtonBg,
          color: style.sendButtonIcon,
        }
    : {};

  const chatButtonStyle = style
    ? style.chatButtonIconType === "image"
      ? {
          width: `${style.chatButtonSize}px`,
          height: `${style.chatButtonSize}px`,
          borderRadius: "50%",
          overflow: "hidden",
          background: "none",
          border: "none",
        }
      : style.chatButtonBg === "gradient"
      ? {
          background: `linear-gradient(135deg, ${style.primaryColor} 0%, ${style.secondaryColor} 100%)`,
          width: `${style.chatButtonSize}px`,
          height: `${style.chatButtonSize}px`,
        }
      : {
          backgroundColor: style.chatButtonBg,
          width: `${style.chatButtonSize}px`,
          height: `${style.chatButtonSize}px`,
        }
    : {};

  const animationClass = style
    ? style.chatButtonAnimation === "pulse"
      ? "animate-pulse"
      : style.chatButtonAnimation === "bounce"
      ? "animate-bounce"
      : style.chatButtonAnimation === "none"
      ? ""
      : "animate-pulse"
    : "";

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-balance">
            Xem trước Chat Widget
          </h1>
          <p className="text-muted-foreground mt-2 text-pretty">
            Xem trước giao diện chatbot với theme đã chọn
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Theme Selector */}
          <Card>
            <CardHeader>
              <CardTitle>Chọn Theme</CardTitle>
              <CardDescription>Xem trước với theme khác nhau</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {themes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Palette className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Chưa có theme nào</p>
                  <p className="text-sm mt-1">Tạo theme mới để xem trước</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label>Theme</Label>
                    <Select
                      value={selectedThemeId}
                      onValueChange={setSelectedThemeId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn theme" />
                      </SelectTrigger>
                      <SelectContent>
                        {themes.map((theme) => (
                          <SelectItem
                            key={theme.id}
                            value={theme.id.toString()}
                          >
                            {theme.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {style && (
                    <Collapsible
                      open={openSections.themeInfo}
                      onOpenChange={() => toggleSection("themeInfo")}
                    >
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                        <h3 className="font-semibold text-sm">
                          Thông tin Theme
                        </h3>
                        {openSections.themeInfo ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-4 pt-4">
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Tiêu đề
                          </Label>
                          <p className="text-sm mt-2 font-semibold">
                            {style.title}
                          </p>
                        </div>

                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Font chữ
                          </Label>
                          <p
                            className="text-sm mt-2 font-medium"
                            style={{ fontFamily: style.fontFamily }}
                          >
                            {style.fontFamily}
                          </p>
                        </div>

                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Màu sắc
                          </Label>
                          <div className="flex items-center gap-2 mt-2">
                            <div
                              className="w-10 h-10 rounded-lg border-2 border-border shadow-sm"
                              style={{ backgroundColor: style.primaryColor }}
                            />
                            <div
                              className="w-10 h-10 rounded-lg border-2 border-border shadow-sm"
                              style={{ backgroundColor: style.secondaryColor }}
                            />
                          </div>
                        </div>

                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Icons
                          </Label>
                          <div className="flex items-center gap-3 mt-2">
                            <div className="flex items-center gap-2">
                              {renderIconPreview(
                                style.botIcon,
                                style.botIconType || "emoji"
                              )}
                              <span className="text-xs">Bot</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {renderIconPreview(
                                style.userIcon,
                                style.userIconType || "emoji"
                              )}
                              <span className="text-xs">User</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Lời chào
                          </Label>
                          <p className="text-sm mt-2 p-3 bg-muted rounded-lg">
                            {style.greeting}
                          </p>
                        </div>

                        {style.poweredByText && (
                          <div>
                            <Label className="text-xs text-muted-foreground">
                              Powered By
                            </Label>
                            <p className="text-sm mt-2 p-3 bg-muted rounded-lg">
                              {style.poweredByText}
                            </p>
                          </div>
                        )}

                        {style.logo && (
                          <div>
                            <Label className="text-xs text-muted-foreground">
                              Logo
                            </Label>
                            <div className="mt-2 p-3 bg-muted rounded-lg flex items-center justify-center">
                              <img
                                src={style.logo || "/placeholder.svg"}
                                alt="Logo"
                                className="h-12 object-contain"
                              />
                            </div>
                          </div>
                        )}
                      </CollapsibleContent>
                    </Collapsible>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Chat Preview */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Preview Chat Widget
              </CardTitle>
              <CardDescription>
                Giao diện chatbot sẽ hiển thị như thế này
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!style ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>Chọn theme để xem trước</p>
                </div>
              ) : (
                <div className="bg-muted/30 rounded-xl p-8 min-h-[600px] flex items-end justify-end relative">
                  {/* Chat Widget Preview */}
                  <div
                    className="w-96 h-[500px] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                    style={{
                      backgroundColor: "#ffffff",
                      fontFamily: style.fontFamily,
                    }}
                  >
                    {/* Header */}
                    <div
                      className="p-5 text-white"
                      style={{
                        background: `linear-gradient(135deg, ${style.primaryColor} 0%, ${style.secondaryColor} 100%)`,
                      }}
                    >
                      <div className="flex items-center gap-3">
                        {style.logo ? (
                          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center overflow-hidden">
                            <img
                              src={style.logo || "/placeholder.svg"}
                              alt="Logo"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                            style={{
                              backgroundColor: "rgba(255, 255, 255, 0.2)",
                            }}
                          >
                            {renderIconPreview(
                              style.botIcon,
                              style.botIconType || "emoji"
                            )}
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold">{style.title}</h3>
                          <p className="text-xs opacity-90">Đang hoạt động</p>
                        </div>
                      </div>
                    </div>

                    {/* Messages */}
                    <div
                      className="flex-1 p-5 space-y-3 overflow-y-auto"
                      style={{ backgroundColor: style.chatBackground }}
                    >
                      {/* Bot message */}
                      <div className="flex items-start gap-2">
                        <div className="text-xl">
                          {renderIconPreview(
                            style.botIcon,
                            style.botIconType || "emoji"
                          )}
                        </div>
                        <div
                          className="p-3 rounded-2xl rounded-tl-sm shadow-sm max-w-[80%] border border-gray-200"
                          style={{
                            backgroundColor: style.botMessageBg,
                            color: style.botMessageText,
                          }}
                        >
                          <p className="text-sm">{style.greeting}</p>
                          <p className="text-xs opacity-60 mt-1">10:30</p>
                        </div>
                      </div>

                      {/* User message */}
                      <div className="flex items-start gap-2 justify-end">
                        <div
                          className="p-3 rounded-2xl rounded-tr-sm shadow-sm max-w-[80%]"
                          style={userMessageStyle}
                        >
                          <p className="text-sm">
                            Cho tôi xem sản phẩm mới nhất
                          </p>
                          <p className="text-xs opacity-80 mt-1">10:31</p>
                        </div>
                        <div className="text-xl">
                          {renderIconPreview(
                            style.userIcon,
                            style.userIconType || "emoji"
                          )}
                        </div>
                      </div>

                      {/* Bot response */}
                      <div className="flex items-start gap-2">
                        <div className="text-xl">
                          {renderIconPreview(
                            style.botIcon,
                            style.botIconType || "emoji"
                          )}
                        </div>
                        <div
                          className="p-3 rounded-2xl rounded-tl-sm shadow-sm max-w-[80%] border border-gray-200"
                          style={{
                            backgroundColor: style.botMessageBg,
                            color: style.botMessageText,
                          }}
                        >
                          <p className="text-sm">
                            Dạ, tôi có thể giới thiệu cho bạn các sản phẩm mới
                            nhất của chúng tôi!
                          </p>
                          <p className="text-xs opacity-60 mt-1">10:31</p>
                        </div>
                      </div>
                    </div>

                    {/* Input */}
                    <div className="p-4 bg-white border-t border-gray-200">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Nhập tin nhắn..."
                          className="flex-1 px-4 py-2 rounded-full text-sm outline-none"
                          style={{
                            backgroundColor: style.inputBg,
                            color: style.inputText,
                          }}
                          disabled
                        />
                        <button
                          className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
                          style={sendButtonStyle}
                          disabled
                        >
                          ➤
                        </button>
                      </div>
                      {style.poweredByText && (
                        <div className="text-center mt-3">
                          <p className="text-xs text-gray-500">
                            {style.poweredByText}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    className={`absolute rounded-full shadow-2xl flex items-center justify-center text-white cursor-pointer hover:scale-110 transition-transform ${animationClass}`}
                    style={{
                      ...chatButtonStyle,
                      ...(style.chatButtonPosition === "bottom-right" && {
                        bottom: "2rem",
                        right: "2rem",
                      }),
                      ...(style.chatButtonPosition === "bottom-left" && {
                        bottom: "2rem",
                        left: "2rem",
                      }),
                      ...(style.chatButtonPosition === "top-right" && {
                        top: "2rem",
                        right: "2rem",
                      }),
                      ...(style.chatButtonPosition === "top-left" && {
                        top: "2rem",
                        left: "2rem",
                      }),
                    }}
                  >
                    {style.chatButtonIconType === "image" ? (
                      <img
                        src={style.chatButtonIcon || "/placeholder.svg"}
                        alt="Chat"
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : style.chatButtonIconType === "boxicon" ? (
                      <i
                        className={style.chatButtonIcon}
                        style={{ fontSize: "24px", color: "white" }}
                      ></i>
                    ) : (
                      <span className="text-3xl">{style.chatButtonIcon}</span>
                    )}
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {themes.length > 0 && (
          <Card>
            <CardHeader>
              <Collapsible
                open={openSections.embedCode}
                onOpenChange={() => toggleSection("embedCode")}
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full">
                  <div>
                    <CardTitle>Mã nhúng Widget</CardTitle>
                    <CardDescription>
                      Sao chép mã này và dán vào website của bạn
                    </CardDescription>
                  </div>
                  {openSections.embedCode ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </CollapsibleTrigger>
              </Collapsible>
            </CardHeader>
            <Collapsible
              open={openSections.embedCode}
              onOpenChange={() => toggleSection("embedCode")}
            >
              <CollapsibleContent>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Chọn Theme để nhúng</Label>
                    <Select
                      value={embedThemeId}
                      onValueChange={setEmbedThemeId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn theme" />
                      </SelectTrigger>
                      <SelectContent>
                        {themes.map((theme) => (
                          <SelectItem
                            key={theme.id}
                            value={theme.id.toString()}
                          >
                            {theme.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="relative">
                    <div className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto">
                      <code className="text-primary">
                        {`<script src="https://your-domain.com/chat-widget.js?api_key=YOUR_API_KEY&theme_id=${embedThemeId}"></script>`}
                      </code>
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
