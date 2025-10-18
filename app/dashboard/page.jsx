"use client";

import { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/lib/api";
import {
  Loader2,
  Save,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronUp,
  Upload,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Palette } from "lucide-react";
import { ChatWidgetEmbed } from "@/components/chat-widget-embed";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ImageCropDialog } from "@/components/image-crop-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function useDebounce(callback, delay) {
  const timeoutRef = useRef(null);

  return (...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  };
}

export default function ThemePage() {
  const { toast } = useToast();
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [botIconType, setBotIconType] = useState("emoji");
  const [userIconType, setUserIconType] = useState("emoji");
  const [chatButtonIconType, setChatButtonIconType] = useState("emoji");
  const fileInputRef = useRef(null);
  const buttonImageInputRef = useRef(null);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);
  const [cropTarget, setCropTarget] = useState("logo"); // 'logo' or 'buttonIcon'

  const [openSections, setOpenSections] = useState({
    basic: true,
    colors: true,
    botMessage: false,
    userMessage: false,
    inputArea: false,
    chatButton: false,
    icons: false,
    content: false,
    userInfo: false,
  });

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    style: {
      primaryColor: "#6366f1",
      secondaryColor: "#8b5cf6",
      botIcon: "bx bx-bot",
      botIconType: "boxicon",
      userIcon: "bx bx-user",
      userIconType: "boxicon",
      title: "Trợ lý AI",
      greeting: "Chào bạn! Tôi có thể giúp gì cho bạn?",
      botMessageBg: "#ffffff",
      botMessageText: "#1f2937",
      userMessageBg: "gradient",
      userMessageText: "#ffffff",
      chatBackground: "#f9fafb",
      poweredByText: "Powered by 3do tech",
      logo: "",
      inputBg: "#f3f4f6",
      inputText: "#1f2937",
      inputPlaceholder: "#9ca3af",
      sendButtonBg: "gradient",
      sendButtonIcon: "#ffffff",
      chatButtonIcon: "bx bx-message",
      chatButtonIconType: "boxicon",
      chatButtonBg: "gradient",
      chatButtonSize: "60",
      chatButtonPosition: "bottom-right",
      chatButtonAnimation: "pulse",
      fontFamily: "system-ui",
      requireUserInfo: false,
      userInfoTitle: "Thông tin của bạn",
      userInfoMessage:
        "Vui lòng cung cấp thông tin để chúng tôi phục vụ bạn tốt hơn",
      userInfoFields: ["name", "email"],
      userInfoValidation: {
        name: { required: true, minLength: 2 },
        email: { required: true, pattern: "email" },
        phone: { required: false, pattern: "phone" },
        purpose: { required: false, minLength: 2 },
      },
      is_required_info: false,
      google_app_script_link: null,
    },
  });

  const updateStyle = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      style: { ...prev.style, [key]: value },
    }));
  };

  const debouncedUpdateStyle = useDebounce(updateStyle, 300);

  useEffect(() => {
    loadThemes();
  }, []);

  const loadThemes = async () => {
    try {
      const data = await api.getThemes();
      setThemes(data.data || []);
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

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Lỗi",
          description: "Vui lòng chọn file ảnh",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setImageToCrop(e.target.result);
        setCropTarget("logo");
        setCropDialogOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleButtonIconUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Lỗi",
          description: "Vui lòng chọn file ảnh",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setImageToCrop(e.target.result);
        setCropTarget("buttonIcon");
        setCropDialogOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedImageBase64) => {
    if (cropTarget === "logo") {
      updateStyle("logo", croppedImageBase64);
      toast({
        title: "Thành công",
        description: "Logo đã được tải lên",
      });
    } else if (cropTarget === "buttonIcon") {
      updateStyle("chatButtonIcon", croppedImageBase64);
      setChatButtonIconType("image");
      updateStyle("chatButtonIconType", "image");
      toast({
        title: "Thành công",
        description: "Icon nút chat đã được tải lên",
      });
    }
  };

  const handleRemoveLogo = () => {
    updateStyle("logo", "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveButtonIcon = () => {
    updateStyle("chatButtonIcon", "bx bx-message");
    setChatButtonIconType("boxicon");
    updateStyle("chatButtonIconType", "boxicon");
    if (buttonImageInputRef.current) {
      buttonImageInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (selectedTheme) {
        await api.updateTheme(selectedTheme.id, formData);
        toast({
          title: "Thành công",
          description: "Đã cập nhật theme",
        });
      } else {
        await api.createTheme(formData);
        toast({
          title: "Thành công",
          description: "Đã tạo theme mới",
        });
      }
      loadThemes();
      resetForm();
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể lưu theme",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Bạn có chắc muốn xóa theme này?")) return;

    try {
      await api.deleteTheme(id);
      toast({
        title: "Thành công",
        description: "Đã xóa theme",
      });
      loadThemes();
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xóa theme",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (theme) => {
    setSelectedTheme(theme);
    const style =
      typeof theme.style === "string" ? JSON.parse(theme.style) : theme.style;
    setBotIconType(style.botIconType || "emoji");
    setUserIconType(style.userIconType || "emoji");
    setChatButtonIconType(style.chatButtonIconType || "emoji");
    setFormData({
      name: theme.name,
      description: theme.description,
      style: {
        ...style,
        title: style.title || "Trợ lý AI",
        botMessageBg: style.botMessageBg || "#ffffff",
        botMessageText: style.botMessageText || "#1f2937",
        userMessageBg: style.userMessageBg || "gradient",
        userMessageText: style.userMessageText || "#ffffff",
        chatBackground: style.chatBackground || "#f9fafb",
        poweredByText: style.poweredByText || "Powered by 3do tech",
        logo: style.logo || "",
        inputBg: style.inputBg || "#f3f4f6",
        inputText: style.inputText || "#1f2937",
        inputPlaceholder: style.inputPlaceholder || "#9ca3af",
        sendButtonBg: style.sendButtonBg || "gradient",
        sendButtonIcon: style.sendButtonIcon || "#ffffff",
        chatButtonIcon: style.chatButtonIcon || "bx bx-message",
        chatButtonIconType: style.chatButtonIconType || "boxicon",
        chatButtonBg: style.chatButtonBg || "gradient",
        chatButtonSize: style.chatButtonSize || "60",
        chatButtonPosition: style.chatButtonPosition || "bottom-right",
        chatButtonAnimation: style.chatButtonAnimation || "pulse",
        fontFamily: style.fontFamily || "system-ui",
        requireUserInfo: style.requireUserInfo || false,
        userInfoTitle: style.userInfoTitle || "Thông tin của bạn",
        userInfoMessage:
          style.userInfoMessage ||
          "Vui lòng cung cấp thông tin để chúng tôi phục vụ bạn tốt hơn",
        userInfoFields: style.userInfoFields || ["name", "email"],
        userInfoValidation: style.userInfoValidation || {
          name: { required: true, minLength: 2 },
          email: { required: true, pattern: "email" },
          phone: { required: false, pattern: "phone" },
          purpose: { required: false, minLength: 2 },
        },
        is_required_info: style.is_required_info ?? false,
        google_app_script_link: style.google_app_script_link ?? null,
      },
    });
  };

  const resetForm = () => {
    setSelectedTheme(null);
    setBotIconType("boxicon");
    setUserIconType("boxicon");
    setChatButtonIconType("boxicon");
    setFormData({
      name: "",
      description: "",
      style: {
        primaryColor: "#6366f1",
        secondaryColor: "#8b5cf6",
        botIcon: "bx bx-bot",
        botIconType: "boxicon",
        userIcon: "bx bx-user",
        userIconType: "boxicon",
        title: "Trợ lý AI",
        greeting: "Chào bạn! Tôi có thể giúp gì cho bạn?",
        botMessageBg: "#ffffff",
        botMessageText: "#1f2937",
        userMessageBg: "gradient",
        userMessageText: "#ffffff",
        chatBackground: "#f9fafb",
        poweredByText: "Powered by 3do tech",
        logo: "",
        inputBg: "#f3f4f6",
        inputText: "#1f2937",
        inputPlaceholder: "#9ca3af",
        sendButtonBg: "gradient",
        sendButtonIcon: "#ffffff",
        chatButtonIcon: "bx bx-message",
        chatButtonIconType: "boxicon",
        chatButtonBg: "gradient",
        chatButtonSize: "60",
        chatButtonPosition: "bottom-right",
        chatButtonAnimation: "pulse",
        fontFamily: "system-ui",
        requireUserInfo: false,
        userInfoTitle: "Thông tin của bạn",
        userInfoMessage:
          "Vui lòng cung cấp thông tin để chúng tôi phục vụ bạn tốt hơn",
        userInfoFields: ["name", "email"],
        userInfoValidation: {
          name: { required: true, minLength: 2 },
          email: { required: true, pattern: "email" },
          phone: { required: false, pattern: "phone" },
          purpose: { required: false, minLength: 2 },
        },
        is_required_info: false,
        google_app_script_link: null,
      },
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (buttonImageInputRef.current) {
      buttonImageInputRef.current.value = "";
    }
  };

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const renderIconPreview = (icon, iconType) => {
    if (iconType === "emoji") {
      return <span className="text-2xl">{icon}</span>;
    } else if (iconType === "image") {
      return (
        <img
          src={icon || "/placeholder.svg"}
          alt="Icon"
          className="w-6 h-6 object-contain"
        />
      );
    } else if (iconType === "boxicon") {
      return <i className={`${icon} text-2xl`}></i>;
    }
    return <span className="text-2xl">{icon}</span>;
  };

  const RealtimePreview = ({ style }) => {
    const userMessageStyle =
      style.userMessageBg === "gradient"
        ? {
            background: `linear-gradient(135deg, ${style.primaryColor} 0%, ${style.secondaryColor} 100%)`,
            color: style.userMessageText,
          }
        : {
            backgroundColor: style.userMessageBg,
            color: style.userMessageText,
          };

    const sendButtonStyle =
      style.sendButtonBg === "gradient"
        ? {
            background: `linear-gradient(135deg, ${style.primaryColor} 0%, ${style.secondaryColor} 100%)`,
            color: style.sendButtonIcon,
          }
        : {
            backgroundColor: style.sendButtonBg,
            color: style.sendButtonIcon,
          };

    const chatButtonStyle =
      style.chatButtonIconType === "image"
        ? {
            width: `${style.chatButtonSize}px`,
            height: `${style.chatButtonSize}px`,
            borderRadius: "50%",
            overflow: "hidden",
            background: "none",
            border: "none",
            padding: "0",
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
          };

    const animationClass =
      style.chatButtonAnimation === "pulse"
        ? "animate-pulse"
        : style.chatButtonAnimation === "bounce"
        ? "animate-bounce"
        : style.chatButtonAnimation === "none"
        ? ""
        : "animate-pulse";

    return (
      <div className="sticky top-8">
        <div className="bg-muted/30 rounded-xl p-6">
          <div
            className="w-full max-w-sm mx-auto h-[600px] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            style={{
              backgroundColor: "#ffffff",
              fontFamily: style.fontFamily || "system-ui",
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
                    style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
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
                  <p className="text-sm">Cho tôi xem sản phẩm mới nhất</p>
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
                    Dạ, tôi có thể giới thiệu cho bạn các sản phẩm mới nhất của
                    chúng tôi!
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
                    backgroundColor: style.inputBg || "#f3f4f6",
                    color: style.inputText || "#1f2937",
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
                  <p className="text-xs text-gray-500">{style.poweredByText}</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              className={`rounded-full shadow-2xl flex items-center justify-center text-white cursor-pointer hover:scale-110 transition-transform ${animationClass}`}
              style={chatButtonStyle}
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
        </div>
      </div>
    );
  };

  const UserInfoFormPreview = ({ style }) => {
    return (
      <div className="bg-white rounded-lg border border-border p-6 space-y-4">
        <div className="space-y-2">
          <h3
            className="font-semibold text-lg"
            style={{ color: style.primaryColor }}
          >
            {style.userInfoTitle}
          </h3>
          <p className="text-sm text-muted-foreground">
            {style.userInfoMessage}
          </p>
        </div>

        <div className="space-y-3">
          {["name", "email", "phone", "purpose"].map((field) => {
            if (!style.userInfoFields.includes(field)) return null;
            const validation = style.userInfoValidation[field];
            const fieldLabel =
              field === "name"
                ? "Tên"
                : field === "email"
                ? "Email"
                : field === "phone"
                ? "Số điện thoại"
                : "Mục đích";

            return (
              <div key={field} className="space-y-1">
                <label className="text-sm font-medium">
                  {fieldLabel}
                  {validation?.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
                <input
                  type={field === "email" ? "email" : "text"}
                  placeholder={`Nhập ${fieldLabel.toLowerCase()}`}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-muted/50"
                  disabled
                />
              </div>
            );
          })}
        </div>

        <button
          className="w-full py-2 rounded-lg text-white font-medium text-sm"
          style={{
            background: `linear-gradient(135deg, ${style.primaryColor} 0%, ${style.secondaryColor} 100%)`,
          }}
          disabled
        >
          Bắt đầu Chat
        </button>
      </div>
    );
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

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-balance">Quản lý Theme</h1>
          <p className="text-muted-foreground mt-2 text-pretty">
            Tùy chỉnh giao diện chatbot với màu sắc, icon và lời chào
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedTheme ? "Chỉnh sửa Theme" : "Tạo Theme mới"}
                </CardTitle>
                <CardDescription>
                  Thiết lập màu sắc và nội dung cho chatbot
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Collapsible
                    open={openSections.basic}
                    onOpenChange={() => toggleSection("basic")}
                  >
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                      <h3 className="font-semibold">Thông tin cơ bản</h3>
                      {openSections.basic ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Tên Theme</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          placeholder="VD: Theme Xanh Dương"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Mô tả</Label>
                        <Input
                          id="description"
                          value={formData.description}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              description: e.target.value,
                            })
                          }
                          placeholder="Mô tả ngắn về theme"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="title">Tiêu đề Chat</Label>
                        <Input
                          id="title"
                          value={formData.style.title}
                          onChange={(e) => updateStyle("title", e.target.value)}
                          placeholder="Trợ lý AI"
                        />
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  <Collapsible
                    open={openSections.colors}
                    onOpenChange={() => toggleSection("colors")}
                  >
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                      <h3 className="font-semibold">Màu sắc chính</h3>
                      {openSections.colors ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-4 mt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="primaryColor">Màu chính</Label>
                          <div className="flex gap-2">
                            <Input
                              id="primaryColor"
                              type="color"
                              value={formData.style.primaryColor}
                              onChange={(e) =>
                                updateStyle("primaryColor", e.target.value)
                              }
                              className="w-16 h-10 p-1"
                            />
                            <Input
                              value={formData.style.primaryColor}
                              onChange={(e) =>
                                updateStyle("primaryColor", e.target.value)
                              }
                              placeholder="#6366f1"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="secondaryColor">Màu phụ</Label>
                          <div className="flex gap-2">
                            <Input
                              id="secondaryColor"
                              type="color"
                              value={formData.style.secondaryColor}
                              onChange={(e) =>
                                updateStyle("secondaryColor", e.target.value)
                              }
                              className="w-16 h-10 p-1"
                            />
                            <Input
                              value={formData.style.secondaryColor}
                              onChange={(e) =>
                                updateStyle("secondaryColor", e.target.value)
                              }
                              placeholder="#8b5cf6"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="chatBackground">
                          Màu nền khung chat
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            id="chatBackground"
                            type="color"
                            value={formData.style.chatBackground}
                            onChange={(e) =>
                              updateStyle("chatBackground", e.target.value)
                            }
                            className="w-16 h-10 p-1"
                          />
                          <Input
                            value={formData.style.chatBackground}
                            onChange={(e) =>
                              updateStyle("chatBackground", e.target.value)
                            }
                            placeholder="#f9fafb"
                          />
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  <Collapsible
                    open={openSections.botMessage}
                    onOpenChange={() => toggleSection("botMessage")}
                  >
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                      <h3 className="font-semibold">Màu tin nhắn Bot</h3>
                      {openSections.botMessage ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-4 mt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="botMessageBg">Nền</Label>
                          <div className="flex gap-2">
                            <Input
                              id="botMessageBg"
                              type="color"
                              value={formData.style.botMessageBg}
                              onChange={(e) =>
                                updateStyle("botMessageBg", e.target.value)
                              }
                              className="w-16 h-10 p-1"
                            />
                            <Input
                              value={formData.style.botMessageBg}
                              onChange={(e) =>
                                updateStyle("botMessageBg", e.target.value)
                              }
                              placeholder="#ffffff"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="botMessageText">Chữ</Label>
                          <div className="flex gap-2">
                            <Input
                              id="botMessageText"
                              type="color"
                              value={formData.style.botMessageText}
                              onChange={(e) =>
                                updateStyle("botMessageText", e.target.value)
                              }
                              className="w-16 h-10 p-1"
                            />
                            <Input
                              value={formData.style.botMessageText}
                              onChange={(e) =>
                                updateStyle("botMessageText", e.target.value)
                              }
                              placeholder="#1f2937"
                            />
                          </div>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  <Collapsible
                    open={openSections.userMessage}
                    onOpenChange={() => toggleSection("userMessage")}
                  >
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                      <h3 className="font-semibold">Màu tin nhắn User</h3>
                      {openSections.userMessage ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label>Kiểu nền</Label>
                        <Tabs
                          value={
                            formData.style.userMessageBg === "gradient"
                              ? "gradient"
                              : "solid"
                          }
                          onValueChange={(value) => {
                            if (value === "gradient") {
                              updateStyle("userMessageBg", "gradient");
                            } else {
                              updateStyle("userMessageBg", "#6366f1");
                            }
                          }}
                        >
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="gradient">Gradient</TabsTrigger>
                            <TabsTrigger value="solid">Màu đơn</TabsTrigger>
                          </TabsList>
                        </Tabs>
                      </div>
                      {formData.style.userMessageBg !== "gradient" && (
                        <div className="space-y-2">
                          <Label htmlFor="userMessageBg">Màu nền</Label>
                          <div className="flex gap-2">
                            <Input
                              id="userMessageBg"
                              type="color"
                              value={formData.style.userMessageBg}
                              onChange={(e) =>
                                updateStyle("userMessageBg", e.target.value)
                              }
                              className="w-16 h-10 p-1"
                            />
                            <Input
                              value={formData.style.userMessageBg}
                              onChange={(e) =>
                                updateStyle("userMessageBg", e.target.value)
                              }
                              placeholder="#6366f1"
                            />
                          </div>
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label htmlFor="userMessageText">Màu chữ</Label>
                        <div className="flex gap-2">
                          <Input
                            id="userMessageText"
                            type="color"
                            value={formData.style.userMessageText}
                            onChange={(e) =>
                              updateStyle("userMessageText", e.target.value)
                            }
                            className="w-16 h-10 p-1"
                          />
                          <Input
                            value={formData.style.userMessageText}
                            onChange={(e) =>
                              updateStyle("userMessageText", e.target.value)
                            }
                            placeholder="#ffffff"
                          />
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  <Collapsible
                    open={openSections.inputArea}
                    onOpenChange={() => toggleSection("inputArea")}
                  >
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                      <h3 className="font-semibold">Khung nhập & Nút gửi</h3>
                      {openSections.inputArea ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="inputBg">Màu nền khung nhập</Label>
                        <div className="flex gap-2">
                          <Input
                            id="inputBg"
                            type="color"
                            value={formData.style.inputBg}
                            onChange={(e) =>
                              updateStyle("inputBg", e.target.value)
                            }
                            className="w-16 h-10 p-1"
                          />
                          <Input
                            value={formData.style.inputBg}
                            onChange={(e) =>
                              updateStyle("inputBg", e.target.value)
                            }
                            placeholder="#f3f4f6"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="inputText">Màu chữ nhập</Label>
                        <div className="flex gap-2">
                          <Input
                            id="inputText"
                            type="color"
                            value={formData.style.inputText}
                            onChange={(e) =>
                              updateStyle("inputText", e.target.value)
                            }
                            className="w-16 h-10 p-1"
                          />
                          <Input
                            value={formData.style.inputText}
                            onChange={(e) =>
                              updateStyle("inputText", e.target.value)
                            }
                            placeholder="#1f2937"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="inputPlaceholder">
                          Màu placeholder
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            id="inputPlaceholder"
                            type="color"
                            value={formData.style.inputPlaceholder}
                            onChange={(e) =>
                              updateStyle("inputPlaceholder", e.target.value)
                            }
                            className="w-16 h-10 p-1"
                          />
                          <Input
                            value={formData.style.inputPlaceholder}
                            onChange={(e) =>
                              updateStyle("inputPlaceholder", e.target.value)
                            }
                            placeholder="#9ca3af"
                          />
                        </div>
                      </div>

                      <div className="border-t pt-4 mt-4">
                        <div className="space-y-2">
                          <Label>Kiểu nút gửi</Label>
                          <Tabs
                            value={
                              formData.style.sendButtonBg === "gradient"
                                ? "gradient"
                                : "solid"
                            }
                            onValueChange={(value) => {
                              if (value === "gradient") {
                                updateStyle("sendButtonBg", "gradient");
                              } else {
                                updateStyle("sendButtonBg", "#6366f1");
                              }
                            }}
                          >
                            <TabsList className="grid w-full grid-cols-2">
                              <TabsTrigger value="gradient">
                                Gradient
                              </TabsTrigger>
                              <TabsTrigger value="solid">Màu đơn</TabsTrigger>
                            </TabsList>
                          </Tabs>
                        </div>

                        {formData.style.sendButtonBg !== "gradient" && (
                          <div className="space-y-2 mt-4">
                            <Label htmlFor="sendButtonBg">Màu nền nút</Label>
                            <div className="flex gap-2">
                              <Input
                                id="sendButtonBg"
                                type="color"
                                value={formData.style.sendButtonBg}
                                onChange={(e) =>
                                  updateStyle("sendButtonBg", e.target.value)
                                }
                                className="w-16 h-10 p-1"
                              />
                              <Input
                                value={formData.style.sendButtonBg}
                                onChange={(e) =>
                                  updateStyle("sendButtonBg", e.target.value)
                                }
                                placeholder="#6366f1"
                              />
                            </div>
                          </div>
                        )}

                        <div className="space-y-2 mt-4">
                          <Label htmlFor="sendButtonIcon">Màu icon gửi</Label>
                          <div className="flex gap-2">
                            <Input
                              id="sendButtonIcon"
                              type="color"
                              value={formData.style.sendButtonIcon}
                              onChange={(e) =>
                                updateStyle("sendButtonIcon", e.target.value)
                              }
                              className="w-16 h-10 p-1"
                            />
                            <Input
                              value={formData.style.sendButtonIcon}
                              onChange={(e) =>
                                updateStyle("sendButtonIcon", e.target.value)
                              }
                              placeholder="#ffffff"
                            />
                          </div>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  <Collapsible
                    open={openSections.chatButton}
                    onOpenChange={() => toggleSection("chatButton")}
                  >
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                      <h3 className="font-semibold">Nút mở Chat</h3>
                      {openSections.chatButton ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label>Icon nút chat</Label>
                        <Tabs
                          value={chatButtonIconType}
                          onValueChange={(value) => {
                            setChatButtonIconType(value);
                            updateStyle("chatButtonIconType", value);
                            if (value === "emoji") {
                              updateStyle("chatButtonIcon", "💬");
                            }
                          }}
                        >
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="emoji">Emoji</TabsTrigger>
                            <TabsTrigger value="image">Hình ảnh</TabsTrigger>
                          </TabsList>
                          <TabsContent value="emoji" className="space-y-2">
                            <Input
                              value={formData.style.chatButtonIcon}
                              onChange={(e) =>
                                updateStyle("chatButtonIcon", e.target.value)
                              }
                              placeholder="💬"
                            />
                            <p className="text-xs text-muted-foreground">
                              Nhập emoji (VD: 💬, 💭, 🗨️, 💡)
                            </p>
                          </TabsContent>
                          <TabsContent value="image" className="space-y-2">
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                  buttonImageInputRef.current?.click()
                                }
                                className="flex-1"
                              >
                                <Upload className="mr-2 h-4 w-4" />
                                Upload Icon
                              </Button>
                              {chatButtonIconType === "image" &&
                                formData.style.chatButtonIcon &&
                                formData.style.chatButtonIcon.startsWith(
                                  "data:"
                                ) && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={handleRemoveButtonIcon}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                )}
                            </div>
                            <input
                              ref={buttonImageInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleButtonIconUpload}
                              className="hidden"
                            />
                            {chatButtonIconType === "image" &&
                              formData.style.chatButtonIcon && (
                                <div className="p-4 border rounded-lg bg-muted/50 flex items-center justify-center">
                                  <img
                                    src={
                                      formData.style.chatButtonIcon ||
                                      "/placeholder.svg" ||
                                      "/placeholder.svg"
                                    }
                                    alt="Button icon preview"
                                    className="h-12 w-12 object-contain rounded"
                                  />
                                </div>
                              )}
                          </TabsContent>
                        </Tabs>
                      </div>

                      <div className="space-y-2">
                        <Label>Kiểu nền nút</Label>
                        <Tabs
                          value={
                            formData.style.chatButtonBg === "gradient"
                              ? "gradient"
                              : "solid"
                          }
                          onValueChange={(value) => {
                            if (value === "gradient") {
                              updateStyle("chatButtonBg", "gradient");
                            } else {
                              updateStyle("chatButtonBg", "#6366f1");
                            }
                          }}
                        >
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="gradient">Gradient</TabsTrigger>
                            <TabsTrigger value="solid">Màu đơn</TabsTrigger>
                          </TabsList>
                        </Tabs>
                      </div>

                      {formData.style.chatButtonBg !== "gradient" && (
                        <div className="space-y-2">
                          <Label htmlFor="chatButtonBg">Màu nền nút</Label>
                          <div className="flex gap-2">
                            <Input
                              id="chatButtonBg"
                              type="color"
                              value={formData.style.chatButtonBg}
                              onChange={(e) =>
                                updateStyle("chatButtonBg", e.target.value)
                              }
                              className="w-16 h-10 p-1"
                            />
                            <Input
                              value={formData.style.chatButtonBg}
                              onChange={(e) =>
                                updateStyle("chatButtonBg", e.target.value)
                              }
                              placeholder="#6366f1"
                            />
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="chatButtonSize">
                          Kích thước nút (px)
                        </Label>
                        <Input
                          id="chatButtonSize"
                          type="number"
                          min="40"
                          max="100"
                          value={formData.style.chatButtonSize}
                          onChange={(e) =>
                            updateStyle("chatButtonSize", e.target.value)
                          }
                          placeholder="60"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="chatButtonPosition">Vị trí nút</Label>
                        <Select
                          value={formData.style.chatButtonPosition}
                          onValueChange={(value) =>
                            updateStyle("chatButtonPosition", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bottom-right">
                              Góc phải dưới
                            </SelectItem>
                            <SelectItem value="bottom-left">
                              Góc trái dưới
                            </SelectItem>
                            <SelectItem value="top-right">
                              Góc phải trên
                            </SelectItem>
                            <SelectItem value="top-left">
                              Góc trái trên
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="chatButtonAnimation">Hiệu ứng</Label>
                        <Select
                          value={formData.style.chatButtonAnimation}
                          onValueChange={(value) =>
                            updateStyle("chatButtonAnimation", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pulse">
                              Pulse (Nhấp nháy)
                            </SelectItem>
                            <SelectItem value="bounce">Bounce (Nảy)</SelectItem>
                            <SelectItem value="none">Không có</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  <Collapsible
                    open={openSections.icons}
                    onOpenChange={() => toggleSection("icons")}
                  >
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                      <h3 className="font-semibold">Icons & Logo</h3>
                      {openSections.icons ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label>Logo</Label>
                        <div className="space-y-3">
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => fileInputRef.current?.click()}
                              className="flex-1"
                            >
                              <Upload className="mr-2 h-4 w-4" />
                              Upload Logo
                            </Button>
                            {formData.style.logo && (
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={handleRemoveLogo}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                          />
                          <Input
                            value={
                              formData.style.logo.startsWith("data:")
                                ? ""
                                : formData.style.logo
                            }
                            onChange={(e) =>
                              updateStyle("logo", e.target.value)
                            }
                            placeholder="Hoặc nhập URL logo"
                          />
                          {formData.style.logo && (
                            <div className="p-4 border rounded-lg bg-muted/50 flex items-center justify-center">
                              <img
                                src={formData.style.logo || "/placeholder.svg"}
                                alt="Logo preview"
                                className="h-16 w-16 object-contain rounded"
                              />
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Logo sẽ hiển thị trong header của chat widget.
                            Khuyến nghị: ảnh vuông, tối thiểu 100x100px
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Icon Bot</Label>
                        <Tabs
                          value={botIconType}
                          onValueChange={(value) => {
                            setBotIconType(value);
                            updateStyle("botIconType", value);
                            if (value === "emoji") {
                              updateStyle("botIcon", "🤖");
                            } else {
                              updateStyle("botIcon", "bx bx-bot");
                            }
                          }}
                        >
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="emoji">Emoji</TabsTrigger>
                            <TabsTrigger value="boxicon">Box Icon</TabsTrigger>
                          </TabsList>
                          <TabsContent value="emoji" className="space-y-2">
                            <Input
                              value={formData.style.botIcon}
                              onChange={(e) =>
                                updateStyle("botIcon", e.target.value)
                              }
                              placeholder="🤖"
                            />
                            <p className="text-xs text-muted-foreground">
                              Nhập emoji (VD: 🤖, 💬, 🎯)
                            </p>
                          </TabsContent>
                          <TabsContent value="boxicon" className="space-y-2">
                            <Input
                              value={formData.style.botIcon}
                              onChange={(e) =>
                                updateStyle("botIcon", e.target.value)
                              }
                              placeholder="bx bx-bot"
                            />
                            <p className="text-xs text-muted-foreground">
                              Nhập class boxicon (VD: bx bx-bot, bx
                              bx-message-dots)
                              <br />
                              <a
                                href="https://boxicons.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                              >
                                Xem danh sách icon →
                              </a>
                            </p>
                          </TabsContent>
                        </Tabs>
                        <div className="flex items-center gap-2 p-3 border rounded-lg bg-muted/50">
                          <span className="text-sm text-muted-foreground">
                            Preview:
                          </span>
                          {renderIconPreview(
                            formData.style.botIcon,
                            botIconType
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Icon User</Label>
                        <Tabs
                          value={userIconType}
                          onValueChange={(value) => {
                            setUserIconType(value);
                            updateStyle("userIconType", value);
                            if (value === "emoji") {
                              updateStyle("userIcon", "👤");
                            } else {
                              updateStyle("userIcon", "bx bx-user");
                            }
                          }}
                        >
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="emoji">Emoji</TabsTrigger>
                            <TabsTrigger value="boxicon">Box Icon</TabsTrigger>
                          </TabsList>
                          <TabsContent value="emoji" className="space-y-2">
                            <Input
                              value={formData.style.userIcon}
                              onChange={(e) =>
                                updateStyle("userIcon", e.target.value)
                              }
                              placeholder="👤"
                            />
                            <p className="text-xs text-muted-foreground">
                              Nhập emoji (VD: 👤, 😊, 👨)
                            </p>
                          </TabsContent>
                          <TabsContent value="boxicon" className="space-y-2">
                            <Input
                              value={formData.style.userIcon}
                              onChange={(e) =>
                                updateStyle("userIcon", e.target.value)
                              }
                              placeholder="bx bx-user"
                            />
                            <p className="text-xs text-muted-foreground">
                              Nhập class boxicon (VD: bx bx-user, bx
                              bx-user-circle)
                              <br />
                              <a
                                href="https://boxicons.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                              >
                                Xem danh sách icon →
                              </a>
                            </p>
                          </TabsContent>
                        </Tabs>
                        <div className="flex items-center gap-2 p-3 border rounded-lg bg-muted/50">
                          <span className="text-sm text-muted-foreground">
                            Preview:
                          </span>
                          {renderIconPreview(
                            formData.style.userIcon,
                            userIconType
                          )}
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  <Collapsible
                    open={openSections.content}
                    onOpenChange={() => toggleSection("content")}
                  >
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                      <h3 className="font-semibold">Nội dung & Text</h3>
                      {openSections.content ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="fontFamily">Font chữ</Label>
                        <Select
                          value={formData.style.fontFamily}
                          onValueChange={(value) =>
                            updateStyle("fontFamily", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="system-ui">
                              System UI (Mặc định)
                            </SelectItem>
                            <SelectItem value="Arial, sans-serif">
                              Arial
                            </SelectItem>
                            <SelectItem value="'Segoe UI', sans-serif">
                              Segoe UI
                            </SelectItem>
                            <SelectItem value="'Roboto', sans-serif">
                              Roboto
                            </SelectItem>
                            <SelectItem value="'Open Sans', sans-serif">
                              Open Sans
                            </SelectItem>
                            <SelectItem value="'Lato', sans-serif">
                              Lato
                            </SelectItem>
                            <SelectItem value="'Montserrat', sans-serif">
                              Montserrat
                            </SelectItem>
                            <SelectItem value="'Poppins', sans-serif">
                              Poppins
                            </SelectItem>
                            <SelectItem value="'Inter', sans-serif">
                              Inter
                            </SelectItem>
                            <SelectItem value="Georgia, serif">
                              Georgia
                            </SelectItem>
                            <SelectItem value="'Times New Roman', serif">
                              Times New Roman
                            </SelectItem>
                            <SelectItem value="'Courier New', monospace">
                              Courier New
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          Font chữ sẽ áp dụng cho toàn bộ chat widget
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="greeting">Lời chào</Label>
                        <Input
                          id="greeting"
                          value={formData.style.greeting}
                          onChange={(e) =>
                            updateStyle("greeting", e.target.value)
                          }
                          placeholder="Chào bạn! Tôi có thể giúp gì cho bạn?"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="poweredByText">Powered By Text</Label>
                        <Input
                          id="poweredByText"
                          value={formData.style.poweredByText}
                          onChange={(e) =>
                            updateStyle("poweredByText", e.target.value)
                          }
                          placeholder="Powered by 3do tech"
                        />
                        <p className="text-xs text-muted-foreground">
                          Hiển thị ở cuối khung chat
                        </p>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  <Collapsible
                    open={openSections.userInfo}
                    onOpenChange={() => toggleSection("userInfo")}
                  >
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                      <h3 className="font-semibold">
                        Thu thập thông tin người dùng
                      </h3>
                      {openSections.userInfo ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formData.style.requireUserInfo}
                            onChange={(e) =>
                              updateStyle("requireUserInfo", e.target.checked)
                            }
                            className="w-4 h-4"
                          />
                          Yêu cầu thông tin trước khi chat
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Nếu bật, người dùng phải điền form thông tin trước khi
                          bắt đầu chat
                        </p>
                      </div>

                      {formData.style.requireUserInfo && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="userInfoTitle">Tiêu đề Form</Label>
                            <Input
                              id="userInfoTitle"
                              value={formData.style.userInfoTitle}
                              onChange={(e) =>
                                updateStyle("userInfoTitle", e.target.value)
                              }
                              placeholder="Thông tin của bạn"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="userInfoMessage">
                              Thông điệp Form
                            </Label>
                            <Input
                              id="userInfoMessage"
                              value={formData.style.userInfoMessage}
                              onChange={(e) =>
                                updateStyle("userInfoMessage", e.target.value)
                              }
                              placeholder="Vui lòng cung cấp thông tin để chúng tôi phục vụ bạn tốt hơn"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Chọn các trường thông tin</Label>
                            <div className="space-y-2">
                              {["name", "email", "phone", "purpose"].map(
                                (field) => (
                                  <label
                                    key={field}
                                    className="flex items-center gap-2"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={formData.style.userInfoFields.includes(
                                        field
                                      )}
                                      onChange={(e) => {
                                        const fields = e.target.checked
                                          ? [
                                              ...formData.style.userInfoFields,
                                              field,
                                            ]
                                          : formData.style.userInfoFields.filter(
                                              (f) => f !== field
                                            );
                                        updateStyle("userInfoFields", fields);
                                      }}
                                      className="w-4 h-4"
                                    />
                                    <span className="text-sm">
                                      {field === "name" && "Tên"}
                                      {field === "email" && "Email"}
                                      {field === "phone" && "Số điện thoại"}
                                      {field === "purpose" && "Mục đích"}
                                    </span>
                                  </label>
                                )
                              )}
                            </div>
                          </div>

                          <div className="border-t pt-4 mt-4">
                            <Label className="text-sm font-semibold mb-3 block">
                              Cấu hình Validation
                            </Label>
                            {["name", "email", "phone", "purpose"].map(
                              (field) =>
                                formData.style.userInfoFields.includes(
                                  field
                                ) && (
                                  <div
                                    key={field}
                                    className="space-y-2 mb-4 p-3 bg-muted/50 rounded-lg"
                                  >
                                    <Label className="text-xs font-semibold">
                                      {field === "name" && "Tên"}
                                      {field === "email" && "Email"}
                                      {field === "phone" && "Số điện thoại"}
                                      {field === "purpose" && "Mục đích"}
                                    </Label>
                                    <label className="flex items-center gap-2">
                                      <input
                                        type="checkbox"
                                        checked={
                                          formData.style.userInfoValidation[
                                            field
                                          ]?.required || false
                                        }
                                        onChange={(e) => {
                                          updateStyle("userInfoValidation", {
                                            ...formData.style
                                              .userInfoValidation,
                                            [field]: {
                                              ...formData.style
                                                .userInfoValidation[field],
                                              required: e.target.checked,
                                            },
                                          });
                                        }}
                                        className="w-4 h-4"
                                      />
                                      <span className="text-xs">Bắt buộc</span>
                                    </label>
                                    {(field === "name" ||
                                      field === "purpose") && (
                                      <div className="flex items-center gap-2">
                                        <Label className="text-xs">
                                          Độ dài tối thiểu:
                                        </Label>
                                        <Input
                                          type="number"
                                          min="1"
                                          value={
                                            formData.style.userInfoValidation[
                                              field
                                            ]?.minLength || 2
                                          }
                                          onChange={(e) => {
                                            updateStyle("userInfoValidation", {
                                              ...formData.style
                                                .userInfoValidation,
                                              [field]: {
                                                ...formData.style
                                                  .userInfoValidation[field],
                                                minLength: Number.parseInt(
                                                  e.target.value
                                                ),
                                              },
                                            });
                                          }}
                                          className="w-16"
                                        />
                                      </div>
                                    )}
                                  </div>
                                )
                            )}
                          </div>

                          <div className="border-t pt-4 mt-4 space-y-3">
                            <div className="space-y-2">
                              <Label className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={formData.style.is_required_info}
                                  onChange={(e) =>
                                    updateStyle(
                                      "is_required_info",
                                      e.target.checked
                                    )
                                  }
                                  className="w-4 h-4"
                                />
                                Bắt buộc yêu cầu thông tin
                              </Label>
                              <p className="text-xs text-muted-foreground">
                                Người dùng phải điền thông tin mới có thể chat
                              </p>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="googleAppScriptLink">
                                Google Apps Script Link (tùy chọn)
                              </Label>
                              <Input
                                id="googleAppScriptLink"
                                value={
                                  formData.style.google_app_script_link || ""
                                }
                                onChange={(e) =>
                                  updateStyle(
                                    "google_app_script_link",
                                    e.target.value || null
                                  )
                                }
                                placeholder="https://script.google.com/macros/d/..."
                              />
                              <p className="text-xs text-muted-foreground">
                                Để gửi dữ liệu form đến Google Sheets, nhập link
                                Google Apps Script
                              </p>
                            </div>
                          </div>

                          <div className="border-t pt-4 mt-4">
                            <Label className="text-sm font-semibold mb-3 block">
                              Preview Form
                            </Label>
                            <UserInfoFormPreview style={formData.style} />
                          </div>
                        </>
                      )}
                    </CollapsibleContent>
                  </Collapsible>

                  <div className="flex gap-3 pt-4">
                    <Button type="submit" disabled={saving} className="flex-1">
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Đang lưu...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          {selectedTheme ? "Cập nhật" : "Tạo mới"}
                        </>
                      )}
                    </Button>
                    {selectedTheme && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={resetForm}
                      >
                        Hủy
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Theme List */}
            <Card>
              <CardHeader>
                <CardTitle>Danh sách Theme</CardTitle>
                <CardDescription>{themes.length} theme đã tạo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {themes.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Palette className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Chưa có theme nào</p>
                    </div>
                  ) : (
                    themes.map((theme) => {
                      const style =
                        typeof theme.style === "string"
                          ? JSON.parse(theme.style)
                          : theme.style;
                      return (
                        <div
                          key={theme.id}
                          className="p-4 border border-border rounded-lg hover:border-primary/50 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-balance">
                                {theme.name}
                              </h3>
                              <p className="text-sm text-muted-foreground text-pretty mt-1">
                                {theme.description || "Không có mô tả"}
                              </p>
                              <div className="flex items-center gap-2 mt-3">
                                <div
                                  className="w-6 h-6 rounded border border-border"
                                  style={{
                                    backgroundColor: style.primaryColor,
                                  }}
                                />
                                <div
                                  className="w-6 h-6 rounded border border-border"
                                  style={{
                                    backgroundColor: style.secondaryColor,
                                  }}
                                />
                                <span className="text-lg">
                                  {renderIconPreview(
                                    style.botIcon,
                                    style.botIconType || "emoji"
                                  )}
                                </span>
                                <span className="text-lg">
                                  {renderIconPreview(
                                    style.userIcon,
                                    style.userIconType || "emoji"
                                  )}
                                </span>
                                {style.logo && (
                                  <img
                                    src={style.logo || "/placeholder.svg"}
                                    alt="Logo"
                                    className="w-6 h-6 object-contain rounded"
                                  />
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={() => handleEdit(theme)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={() => handleDelete(theme.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Preview Realtime</CardTitle>
                <CardDescription>
                  Xem trước thay đổi ngay lập tức
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RealtimePreview style={formData.style} />
              </CardContent>
            </Card>
          </div>
        </div>

        {themes.length > 0 && (
          <ChatWidgetEmbed apiKey={api.getApiKey()} themeId={themes[0]?.id} />
        )}
      </div>

      <ImageCropDialog
        open={cropDialogOpen}
        onOpenChange={setCropDialogOpen}
        imageSrc={imageToCrop}
        onCropComplete={handleCropComplete}
      />
    </DashboardLayout>
  );
}
