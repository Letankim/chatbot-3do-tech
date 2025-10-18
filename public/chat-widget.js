; (() => {
  const scriptSrc = document.currentScript.src
  const urlParams = new URLSearchParams(scriptSrc.split("?")[1])
  const API_KEY = urlParams.get("api_key") || ""
  const THEME_ID = urlParams.get("theme_id") || ""
  const API_BASE = urlParams.get("api_base") || "https://3docorp.id.vn/rental"
  const INCLUDE_PRODUCTS = urlParams.get("include_products") === "true"

  if (!API_KEY) {
    console.error("Chat Widget Error: Missing api_key in script src")
    return
  }

  const boxIconsLink = document.createElement("link")
  boxIconsLink.href = "https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css"
  boxIconsLink.rel = "stylesheet"
  document.head.appendChild(boxIconsLink)

  const lucideScript = document.createElement("script")
  lucideScript.src = "https://unpkg.com/lucide@latest"
  document.head.appendChild(lucideScript)

  let currentTheme = {
    primaryColor: "#6366f1",
    secondaryColor: "#8b5cf6",
    botIcon: "bx bx-bot",
    botIconType: "boxicon",
    userIcon: "bx bx-user",
    userIconType: "boxicon",
    title: "Trợ lý AI",
    greeting: "Chào bạn! Tôi có thể giúp gì cho bạn?",
    logo: "",
    botMessageBg: "#ffffff",
    botMessageText: "#1f2937",
    userMessageBg: "gradient",
    userMessageText: "#ffffff",
    chatBackground: "#f9fafb",
    poweredByText: "Powered by 3do tech",
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
    userInfoMessage: "Vui lòng cung cấp thông tin để chúng tôi phục vụ bạn tốt hơn",
    userInfoFields: ["name","email"],
    userInfoValidation: {
      name: { required: true,minLength: 2 },
      email: { required: true,pattern: "email" },
      phone: { required: false,pattern: "phone" },
      purpose: { required: false,minLength: 2 },
    },
    is_required_info: false,
    google_app_script_link: null,
  }

  let isThemeLoaded = false

  // Fetch theme from API
  async function loadTheme() {
    if (!THEME_ID) {
      console.log("[Chat Widget] No theme_id provided, using default theme")
      initializeWidget()
      return
    }

    try {
      const response = await fetch(`${API_BASE}/user/themes`,{
        headers: {
          "X-API-Key": API_KEY,
        },
      })
      const data = await response.json()

      if (data.data && Array.isArray(data.data)) {
        const theme = data.data.find((t) => t.id === Number.parseInt(THEME_ID))
        if (theme && theme.style) {
          const style = typeof theme.style === "string" ? JSON.parse(theme.style) : theme.style
          currentTheme = { ...currentTheme,...style }
          console.log("[Chat Widget] Theme loaded successfully:",currentTheme)
        } else {
          console.warn("[Chat Widget] Theme not found, using default")
        }
      }
    } catch (error) {
      console.error("[Chat Widget] Failed to load theme:",error)
    } finally {
      isThemeLoaded = true
      initializeWidget()
    }
  }

  function renderIcon(icon,iconType) {
    if (iconType === "boxicon") {
      return `<i class="${icon}" style="font-size: 20px; display: flex; align-items: center; justify-content: center; color: inherit;"></i>`
    } else if (iconType === "lucide") {
      return `<svg class="lucide-icon" style="width: 20px; height: 20px;" data-icon="${icon}"></svg>`
    } else if (iconType === "image") {
      return `<img src="${icon}" alt="Icon" style="width: 20px; height: 20px; object-fit: contain;" />`
    }
    // Default emoji
    return `<span style="font-size: 20px; display: flex; align-items: center; justify-content: center;">${icon}</span>`
  }

  function initializeWidget() {
    const getButtonPosition = () => {
      const pos = currentTheme.chatButtonPosition || "bottom-right"
      const positions = {
        "bottom-right": "bottom: 24px; right: 24px;",
        "bottom-left": "bottom: 24px; left: 24px;",
        "top-right": "top: 24px; right: 24px;",
        "top-left": "top: 24px; left: 24px;",
      }
      return positions[pos] || positions["bottom-right"]
    }

    const getButtonAnimation = () => {
      const anim = currentTheme.chatButtonAnimation || "pulse"
      if (anim === "pulse") {
        return `
          @keyframes chatButtonPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          #chat-widget-btn {
            animation: chatButtonPulse 2s ease-in-out infinite;
          }
        `
      } else if (anim === "bounce") {
        return `
          @keyframes chatButtonBounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          #chat-widget-btn {
            animation: chatButtonBounce 1s ease-in-out infinite;
          }
        `
      }
      return ""
    }

    const getButtonBgStyle = () => {
      if (currentTheme.chatButtonIconType === "image") {
        return "background: none; border: none; padding: 0; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);"
      }
      if (currentTheme.chatButtonBg === "gradient") {
        return `background: linear-gradient(135deg, ${currentTheme.primaryColor} 0%, ${currentTheme.secondaryColor} 100%); border: none;`
      }
      return `background: ${currentTheme.chatButtonBg}; border: none;`
    }

    const getUserMessageBg = () => {
      if (currentTheme.userMessageBg === "gradient") {
        return `background: linear-gradient(135deg, ${currentTheme.primaryColor} 0%, ${currentTheme.secondaryColor} 100%);`
      }
      return `background: ${currentTheme.userMessageBg};`
    }

    const getSendButtonBg = () => {
      if (currentTheme.sendButtonBg === "gradient") {
        return `background: linear-gradient(135deg, ${currentTheme.primaryColor} 0%, ${currentTheme.secondaryColor} 100%);`
      }
      return `background: ${currentTheme.sendButtonBg};`
    }

    // Dynamic styles based on theme
    const styles = `
      * {
        font-family: ${currentTheme.fontFamily || "system-ui"}, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      }
      #chat-widget-btn {
        position: fixed;
        ${getButtonPosition()}
        width: ${currentTheme.chatButtonSize || 60}px;
        height: ${currentTheme.chatButtonSize || 60}px;
        border-radius: 50%;
        ${getButtonBgStyle()}
        color: white;
        font-size: 24px;
        cursor: pointer;
        z-index: 10000;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      }
      ${getButtonAnimation()}
      #chat-widget-btn:hover { 
        transform: scale(1.1);
        box-shadow: 0 12px 32px rgba(99, 102, 241, 0.5);
      }
      #chat-widget-btn.open {
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
        border: none !important;
      }
      #chat-widget-btn img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 50%;
      }
      #chat-widget-btn i {
        font-size: 24px;
        color: white;
      }
      #chat-widget-modal {
        display: none;
        position: fixed;
        bottom: 90px;
        right: 24px;
        z-index: 10001;
        animation: slideUp 0.3s ease-out;
      }
      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      #chat-widget-chat {
        width: 380px;
        height: 600px;
        background: white;
        border-radius: 16px;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
      }
      @media (max-width: 480px) {
        #chat-widget-modal {
          bottom: 0;
          right: 0;
          left: 0;
          top: 0;
        }
        #chat-widget-chat {
          width: 100%;
          height: 100%;
          border-radius: 0;
        }
      }
      #chat-header {
        background: linear-gradient(135deg, ${currentTheme.primaryColor} 0%, ${currentTheme.secondaryColor} 100%);
        color: white;
        padding: 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
      #chat-header-content {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      #chat-header-logo {
        width: 40px;
        height: 40px;
        object-fit: contain;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.2);
        padding: 4px;
      }
      #chat-header-icon {
        width: 40px;
        height: 40px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
      }
      #chat-header-text h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
      }
      #chat-header-text p {
        margin: 0;
        font-size: 12px;
        opacity: 0.9;
      }
      #chat-header-actions {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      #chat-clear {
        background: rgba(255, 255, 255, 0.15);
        border: none;
        color: white;
        font-size: 18px;
        cursor: pointer;
        padding: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        opacity: 0.8;
        transition: all 0.2s;
      }
      #chat-clear:hover {
        opacity: 1;
        background: rgba(255, 255, 255, 0.25);
      }
      #chat-close {
        background: none;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
        padding: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0.8;
        transition: opacity 0.2s;
      }
      #chat-close:hover {
        opacity: 1;
      }
      #chat-messages {
        flex: 1;
        padding: 20px;
        overflow-y: auto;
        background: ${currentTheme.chatBackground || "#f8fafc"};
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      #chat-messages::-webkit-scrollbar {
        width: 6px;
      }
      #chat-messages::-webkit-scrollbar-track {
        background: transparent;
      }
      #chat-messages::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 3px;
      }
      .message {
        padding: 12px 16px;
        border-radius: 16px;
        max-width: 75%;
        word-wrap: break-word;
        animation: messageIn 0.3s ease-out;
        display: flex;
        align-items: flex-start;
        gap: 8px;
      }
      @keyframes messageIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .message-icon {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        flex-shrink: 0;
      }
      .user-message {
        ${getUserMessageBg()}
        color: ${currentTheme.userMessageText || "#ffffff"};
        margin-left: auto;
        border-bottom-right-radius: 4px;
        box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
        flex-direction: row-reverse;
      }
      .user-message .message-icon {
        background: rgba(255, 255, 255, 0.2);
      }
      .bot-message {
        background: ${currentTheme.botMessageBg || "#ffffff"};
        color: ${currentTheme.botMessageText || "#1e293b"};
        margin-right: auto;
        border: 1px solid #e2e8f0;
        border-bottom-left-radius: 4px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        line-height: 1.6;
      }
      .bot-message .message-icon {
        background: linear-gradient(135deg, ${currentTheme.primaryColor} 0%, ${currentTheme.secondaryColor} 100%);
        color: white;
      }
      .message-content-wrapper {
        flex: 1;
        min-width: 0;
      }
      .message-content {
        word-wrap: break-word;
      }
      .timestamp {
        font-size: 10px;
        opacity: 0.6;
        margin-top: 4px;
      }
      #chat-input-container {
        display: flex;
        padding: 16px;
        border-top: 1px solid #e2e8f0;
        background: white;
        gap: 8px;
        align-items: center;
        flex-direction: column;
      }
      #chat-input-wrapper {
        display: flex;
        width: 100%;
        gap: 8px;
        align-items: center;
      }
      #chat-input {
        flex: 1;
        border: 2px solid #e2e8f0;
        border-radius: 24px;
        padding: 12px 20px;
        outline: none;
        font-size: 14px;
        transition: border-color 0.2s;
        background: ${currentTheme.inputBg || "#f8fafc"};
        color: ${currentTheme.inputText || "#1f2937"};
      }
      #chat-input::placeholder {
        color: ${currentTheme.inputPlaceholder || "#9ca3af"};
      }
      #chat-input:focus {
        border-color: ${currentTheme.primaryColor};
        background: white;
      }
      #chat-send {
        ${getSendButtonBg()}
        color: ${currentTheme.sendButtonIcon || "white"};
        border: none;
        border-radius: 50%;
        width: 44px;
        height: 44px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        transition: all 0.2s;
        flex-shrink: 0;
      }
      #chat-send:hover { 
        transform: scale(1.05);
        box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
      }
      #chat-send:disabled { 
        opacity: 0.5;
        cursor: not-allowed;
        transform: scale(1);
      }
      #chat-powered-by {
        text-align: center;
        font-size: 11px;
        color: #9ca3af;
        margin-top: 8px;
      }
      .loading-dots {
        display: flex;
        gap: 4px;
        padding: 12px 16px;
      }
      .loading-dot {
        width: 8px;
        height: 8px;
        background: #94a3b8;
        border-radius: 50%;
        animation: bounce 1.4s infinite ease-in-out both;
      }
      .loading-dot:nth-child(1) { animation-delay: -0.32s; }
      .loading-dot:nth-child(2) { animation-delay: -0.16s; }
      @keyframes bounce {
        0%, 80%, 100% { transform: scale(0); }
        40% { transform: scale(1); }
      }
      .recommended-products {
        margin-top: 12px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .recommended-product {
        background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
        border-left: 3px solid #0ea5e9;
        padding: 12px;
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        gap: 6px;
        transition: transform 0.2s;
      }
      .recommended-product:hover {
        transform: translateX(4px);
      }
      .product-name { 
        font-weight: 600;
        color: #0f172a;
        font-size: 14px;
      }
      .product-price { 
        color: #10b981;
        font-weight: 600;
        font-size: 14px;
      }
      
      #user-info-form {
        display: none;
        position: fixed;
        bottom: 90px;
        right: 24px;
        z-index: 10001;
        animation: slideUp 0.3s ease-out;
      }
      #user-info-form.show {
        display: block;
      }
      #user-info-container {
        width: 380px;
        background: white;
        border-radius: 16px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
        overflow: hidden;
        display: flex;
        flex-direction: column;
        max-height: 600px;
      }
      #user-info-header {
        background: linear-gradient(135deg, ${currentTheme.primaryColor} 0%, ${currentTheme.secondaryColor} 100%);
        color: white;
        padding: 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      #user-info-header h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        flex: 1;
      }
      #user-info-header p {
        margin: 8px 0 0 0;
        font-size: 13px;
        opacity: 0.9;
      }
      #user-info-close-btn {
        background: rgba(255, 255, 255, 0.15);
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        padding: 4px 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 6px;
        opacity: 0.8;
        transition: all 0.2s;
      }
      #user-info-close-btn:hover {
        opacity: 1;
        background: rgba(255, 255, 255, 0.25);
      }
      #user-info-body {
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        overflow-y: auto;
        flex: 1;
      }
      .user-info-field {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .user-info-field label {
        font-size: 13px;
        font-weight: 500;
        color: #1f2937;
      }
      .user-info-field input,
      .user-info-field textarea {
        padding: 10px 12px;
        border: 2px solid #e2e8f0;
        border-radius: 8px;
        font-size: 14px;
        outline: none;
        transition: border-color 0.2s;
        background: white;
        color: ${currentTheme.inputText || "#1f2937"};
        font-family: inherit;
      }
      .user-info-field textarea {
        resize: vertical;
        min-height: 80px;
        max-height: 120px;
      }
      .user-info-field input:focus,
      .user-info-field textarea:focus {
        border-color: ${currentTheme.primaryColor};
      }
      .user-info-field input::placeholder,
      .user-info-field textarea::placeholder {
        color: ${currentTheme.inputPlaceholder || "#9ca3af"};
      }
      .user-info-error {
        font-size: 12px;
        color: #ef4444;
        margin-top: 4px;
      }
      #user-info-footer {
        padding: 16px 20px;
        border-top: 1px solid #e2e8f0;
        display: flex;
        gap: 8px;
      }
      #user-info-submit {
        flex: 1;
        padding: 10px 16px;
        background: linear-gradient(135deg, ${currentTheme.primaryColor} 0%, ${currentTheme.secondaryColor} 100%);
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
      }
      #user-info-submit:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
      }
      #user-info-submit:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
      }
    `

    const styleSheet = document.createElement("style")
    styleSheet.textContent = styles
    document.head.appendChild(styleSheet)

    const button = document.createElement("button")
    button.id = "chat-widget-btn"

    if (currentTheme.chatButtonIconType === "image" && currentTheme.chatButtonIcon) {
      button.innerHTML = `<img src="${currentTheme.chatButtonIcon}" alt="Chat" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" />`
    } else if (currentTheme.chatButtonIconType === "boxicon") {
      button.innerHTML = `<i class="${currentTheme.chatButtonIcon}" style="font-size: 24px; color: white; display: flex; align-items: center; justify-content: center;"></i>`
    } else if (currentTheme.chatButtonIconType === "lucide") {
      button.innerHTML = `<svg class="lucide-icon" style="width: 24px; height: 24px; color: white;" data-icon="${currentTheme.chatButtonIcon}"></svg>`
    } else {
      button.innerHTML = `<span style="font-size: 24px;">${currentTheme.chatButtonIcon || "💬"}</span>`
    }

    button.title = "Chat với trợ lý AI"
    button.onclick = toggleChat
    document.body.appendChild(button)

    const modal = document.createElement("div")
    modal.id = "chat-widget-modal"

    const headerIconHtml = currentTheme.logo
      ? `<img id="chat-header-logo" src="${currentTheme.logo}" alt="Logo" onerror="this.style.display='none'">`
      : `<div id="chat-header-icon">${renderIcon(currentTheme.botIcon,currentTheme.botIconType)}</div>`

    modal.innerHTML = `
      <div id="chat-widget-chat">
        <div id="chat-header">
          <div id="chat-header-content">
            ${headerIconHtml}
            <div id="chat-header-text">
              <h3>${currentTheme.title || "Trợ lý AI"}</h3>
              <p>Luôn sẵn sàng hỗ trợ bạn</p>
            </div>
          </div>
          <div id="chat-header-actions">
            <button id="chat-clear" onclick="window.clearChatSession()" title="Xóa lịch sử chat">
              <i class="bx bx-trash"></i>
            </button>
            <button id="chat-close" onclick="window.toggleChatWidget()">
              <i class="bx bx-x"></i>
            </button>
          </div>
        </div>
        <div id="chat-messages"></div>
        <div id="chat-input-container">
          <div id="chat-input-wrapper">
            <input type="text" id="chat-input" placeholder="Nhập tin nhắn của bạn..." onkeypress="window.handleChatKeyPress(event)">
            <button id="chat-send" onclick="window.sendChatMessage()">
              <i class="bx bx-send"></i>
            </button>
          </div>
          ${currentTheme.poweredByText ? `<div id="chat-powered-by">${currentTheme.poweredByText}</div>` : ""}
        </div>
      </div>
    `
    document.body.appendChild(modal)

    const userInfoForm = document.createElement("div")
    userInfoForm.id = "user-info-form"
    userInfoForm.innerHTML = `
      <div id="user-info-container">
        <div id="user-info-header">
          <div>
            <h3>${currentTheme.userInfoTitle}</h3>
            <p>${currentTheme.userInfoMessage}</p>
          </div>
          <button id="user-info-close-btn" onclick="window.closeUserInfoForm()" title="Đóng">
            <i class="bx bx-x"></i>
          </button>
        </div>
        <div id="user-info-body"></div>
        <div id="user-info-footer">
          <button id="user-info-submit">Bắt đầu Chat</button>
        </div>
      </div>
    `
    document.body.appendChild(userInfoForm)

    let isOpen = false
    let messages = []
    let userInfoSubmitted = false
    let userInfoFormOpen = false

    function checkUserInfoStatus() {
      try {
        const stored = localStorage.getItem(`user_info_submitted_${API_KEY}`)
        userInfoSubmitted = stored === "true"
      } catch (e) {
        console.error("[Chat Widget] Error checking user info status:",e)
      }
    }

    function validateUserInfo(data) {
      const errors = {}
      const validation = currentTheme.userInfoValidation

      for (const field of currentTheme.userInfoFields) {
        const value = data[field]?.trim() || ""
        const rules = validation[field]

        if (rules.required && !value) {
          errors[field] =
            `${field === "name" ? "Tên" : field === "email" ? "Email" : field === "phone" ? "Số điện thoại" : "Mục đích"} là bắt buộc`
        } else if (value) {
          if (rules.minLength && value.length < rules.minLength) {
            errors[field] = `Tối thiểu ${rules.minLength} ký tự`
          }
          if (rules.pattern === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            errors[field] = "Email không hợp lệ"
          }
          if (rules.pattern === "phone" && !/^[\d\s\-+$$$$]+$/.test(value)) {
            errors[field] = "Số điện thoại không hợp lệ"
          }
        }
      }

      return errors
    }

    function renderUserInfoForm() {
      const body = document.getElementById("user-info-body")
      if (!body) return

      body.innerHTML = ""

      for (const field of currentTheme.userInfoFields) {
        const fieldDiv = document.createElement("div")
        fieldDiv.className = "user-info-field"

        const label = document.createElement("label")
        label.textContent =
          field === "name"
            ? "Tên của bạn"
            : field === "email"
              ? "Email"
              : field === "phone"
                ? "Số điện thoại"
                : "Mục đích"

        const input = field === "purpose" ? document.createElement("textarea") : document.createElement("input")

        if (field !== "purpose") {
          input.type = field === "email" ? "email" : "text"
        }

        input.id = `user-info-${field}`
        input.placeholder =
          field === "name"
            ? "Nhập tên của bạn"
            : field === "email"
              ? "Nhập email"
              : field === "phone"
                ? "Nhập số điện thoại"
                : "Nhập mục đích sử dụng..."

        fieldDiv.appendChild(label)
        fieldDiv.appendChild(input)
        body.appendChild(fieldDiv)
      }
    }

    function showUserInfoForm() {
      if (!currentTheme.requireUserInfo || userInfoSubmitted) {
        return
      }

      renderUserInfoForm()
      const form = document.getElementById("user-info-form")
      if (form) {
        form.classList.add("show")
        userInfoFormOpen = true
      }

      const submitBtn = document.getElementById("user-info-submit")
      if (submitBtn) {
        submitBtn.onclick = handleUserInfoSubmit
      }
    }

    window.closeUserInfoForm = () => {
      const form = document.getElementById("user-info-form")
      if (form) {
        form.classList.remove("show")
        userInfoFormOpen = false
      }
    }

    function handleUserInfoSubmit() {
      const data = {}
      const errors = {}

      for (const field of currentTheme.userInfoFields) {
        const input = document.getElementById(`user-info-${field}`)
        if (input) {
          data[field] = input.value
        }
      }

      const validationErrors = validateUserInfo(data)

      if (Object.keys(validationErrors).length > 0) {
        for (const field in validationErrors) {
          const input = document.getElementById(`user-info-${field}`)
          if (input) {
            const errorDiv = input.parentElement.querySelector(".user-info-error")
            if (errorDiv) {
              errorDiv.textContent = validationErrors[field]
            } else {
              const newErrorDiv = document.createElement("div")
              newErrorDiv.className = "user-info-error"
              newErrorDiv.textContent = validationErrors[field]
              input.parentElement.appendChild(newErrorDiv)
            }
          }
        }
        return
      }

      if (currentTheme.google_app_script_link) {
        fetch(currentTheme.google_app_script_link,{
          method: "POST",
          mode: "no-cors",
          body: JSON.stringify(data),
        }).catch((e) => console.error("[Chat Widget] Error sending to Google Apps Script:",e))
      }

      try {
        localStorage.setItem(`user_info_submitted_${API_KEY}`,"true")
        localStorage.setItem(`user_info_data_${API_KEY}`,JSON.stringify(data))
        userInfoSubmitted = true

        const form = document.getElementById("user-info-form")
        if (form) {
          form.classList.remove("show")
          userInfoFormOpen = false
        }

        modal.style.display = "block"
        const messagesDiv = document.getElementById("chat-messages")
        if (messagesDiv) {
          messagesDiv.innerHTML = ""
        }
        addMessage("bot",currentTheme.greeting)
        document.getElementById("chat-input")?.focus()
      } catch (e) {
        console.error("[Chat Widget] Error saving user info:",e)
      }
    }

    function loadMessagesFromStorage() {
      try {
        const stored = localStorage.getItem(`chat_widget_messages_${API_KEY}`)
        if (stored) {
          messages = JSON.parse(stored)
          messages.forEach((msg) => {
            addMessageToUI(msg.type,msg.text,msg.products || [],msg.timestamp)
          })
        }
      } catch (e) {
        console.error("[Chat Widget] Error loading messages:",e)
      }
    }

    function saveMessagesToStorage() {
      try {
        localStorage.setItem(`chat_widget_messages_${API_KEY}`,JSON.stringify(messages))
      } catch (e) {
        console.error("[Chat Widget] Error saving messages:",e)
      }
    }

    function toggleChat() {
      isOpen = !isOpen

      if (isOpen) {
        if (currentTheme.requireUserInfo && !userInfoSubmitted) {
          modal.style.display = "none"
          showUserInfoForm()
        } else {
          modal.style.display = "block"
          if (messages.length === 0) {
            loadMessagesFromStorage()
            if (messages.length === 0) {
              addMessage("bot",currentTheme.greeting)
            }
          }
          document.getElementById("chat-input")?.focus()
        }
      } else {
        modal.style.display = "none"
        window.closeUserInfoForm()
      }

      button.classList.toggle("open",isOpen)

      if (isOpen) {
        button.innerHTML = '<i class="bx bx-x" style="font-size: 24px; color: white;"></i>'
      } else {
        if (currentTheme.chatButtonIconType === "image" && currentTheme.chatButtonIcon) {
          button.innerHTML = `<img src="${currentTheme.chatButtonIcon}" alt="Chat" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" />`
        } else if (currentTheme.chatButtonIconType === "boxicon") {
          button.innerHTML = `<i class="${currentTheme.chatButtonIcon}" style="font-size: 24px; color: white; display: flex; align-items: center; justify-content: center;"></i>`
        } else if (currentTheme.chatButtonIconType === "lucide") {
          button.innerHTML = `<svg class="lucide-icon" style="width: 24px; height: 24px; color: white;" data-icon="${currentTheme.chatButtonIcon}"></svg>`
        } else {
          button.innerHTML = `<span style="font-size: 24px;">${currentTheme.chatButtonIcon || "💬"}</span>`
        }
      }
    }

    function addMessageToUI(type,text,products = [],timestamp = null) {
      const messagesDiv = document.getElementById("chat-messages")
      if (!messagesDiv) return

      const messageDiv = document.createElement("div")
      messageDiv.className = `message ${type}-message`

      const time = timestamp || new Date().toLocaleTimeString("vi-VN",{ hour: "2-digit",minute: "2-digit" })

      const icon =
        type === "user"
          ? renderIcon(currentTheme.userIcon,currentTheme.userIconType)
          : renderIcon(currentTheme.botIcon,currentTheme.botIconType)

      let html = `
        <div class="message-icon">${icon}</div>
        <div class="message-content-wrapper">
          <div class="message-content">${formatMessage(text)}</div>
          <div class="timestamp">${time}</div>
      `

      if (products && products.length > 0) {
        html += '<div class="recommended-products">'
        products.forEach((p) => {
          html += `
            <div class="recommended-product">
              <div class="product-name"><i class="bx bx-package"></i> ${escapeHtml(p.name)}</div>
              <div class="product-price"><i class="bx bx-dollar-circle"></i> ${p.price.toLocaleString("vi-VN")} VNĐ</div>
              ${p.image ? `<img src="${p.image}" alt="${escapeHtml(p.name)}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 6px; margin: 4px 0;" onerror="this.style.display='none'">` : ""}
              ${p.reason ? `<div class="product-reason"><i class="bx bx-info-circle"></i> ${escapeHtml(p.reason)}</div>` : ""}
            </div>
          `
        })
        html += "</div>"
      }

      html += "</div>"
      messageDiv.innerHTML = html
      messagesDiv.appendChild(messageDiv)
      messagesDiv.scrollTop = messagesDiv.scrollHeight
    }

    function addMessage(type,text,products = []) {
      const timestamp = new Date().toLocaleTimeString("vi-VN",{ hour: "2-digit",minute: "2-digit" })
      const messageData = { type,text,products,timestamp }

      messages.push(messageData)
      saveMessagesToStorage()
      addMessageToUI(type,text,products,timestamp)

      if (type === "user") {
        const input = document.getElementById("chat-input")
        if (input) input.value = ""
      }
    }

    function showLoading() {
      const messagesDiv = document.getElementById("chat-messages")
      if (!messagesDiv) return

      const loadingDiv = document.createElement("div")
      loadingDiv.id = "loading-indicator"
      loadingDiv.className = "message bot-message"
      loadingDiv.innerHTML = `
        <div class="message-icon">${renderIcon(currentTheme.botIcon,currentTheme.botIconType)}</div>
        <div class="loading-dots">
          <div class="loading-dot"></div>
          <div class="loading-dot"></div>
          <div class="loading-dot"></div>
        </div>
      `
      messagesDiv.appendChild(loadingDiv)
      messagesDiv.scrollTop = messagesDiv.scrollHeight
    }

    function hideLoading() {
      const loadingDiv = document.getElementById("loading-indicator")
      if (loadingDiv) {
        loadingDiv.remove()
      }
    }

    function escapeHtml(text) {
      const div = document.createElement("div")
      div.textContent = text
      return div.innerHTML
    }

    function formatMessage(text) {
      let formatted = text
        .replace(/&/g,"&amp;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;")
        .replace(/'/g,"&#039;")

      formatted = formatted.replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>")
      formatted = formatted.replace(/__(.+?)__/g,"<strong>$1</strong>")
      formatted = formatted.replace(/\*(.+?)\*/g,"<em>$1</em>")
      formatted = formatted.replace(/_(.+?)_/g,"<em>$1</em>")
      formatted = formatted.replace(/\n/g,"<br>")
      formatted = formatted.replace(/^[*-]\s+(.+)$/gm,"<li>$1</li>")
      formatted = formatted.replace(/(<li>.*<\/li>)/s,"<ul>$1</ul>")

      return formatted
    }

    function clearSession() {
      if (confirm("Bạn có chắc muốn xóa toàn bộ lịch sử chat?")) {
        messages = []
        localStorage.removeItem(`chat_widget_messages_${API_KEY}`)
        const messagesDiv = document.getElementById("chat-messages")
        if (messagesDiv) messagesDiv.innerHTML = ""
        addMessage("bot",currentTheme.greeting)
      }
    }

    window.handleChatKeyPress = (event) => {
      if (event.key === "Enter") {
        window.sendChatMessage()
      }
    }

    window.sendChatMessage = () => {
      const input = document.getElementById("chat-input")
      if (!input) return

      const message = input.value.trim()
      if (!message) return

      addMessage("user",message)
      input.disabled = true
      const sendBtn = document.getElementById("chat-send")
      if (sendBtn) sendBtn.disabled = true

      showLoading()

      const history = messages.map((m) => ({
        role: m.type === "user" ? "user" : "assistant",
        content: m.text,
      }))

      fetch(`${API_BASE}/api/chat`,{
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: API_KEY,
          message: message,
          history: history,
          include_products: INCLUDE_PRODUCTS,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          hideLoading()
          if (data.error) {
            addMessage("bot",`Lỗi: ${data.error}`)
          } else {
            addMessage("bot",data.reply,data.recommended_products || [])
          }
        })
        .catch((err) => {
          console.error("[Chat Widget] Chat API Error:",err)
          hideLoading()
          addMessage("bot","Xin lỗi, có lỗi kết nối. Thử lại nhé!")
        })
        .finally(() => {
          input.disabled = false
          input.focus()
          if (sendBtn) sendBtn.disabled = false
        })
    }

    window.toggleChatWidget = toggleChat
    window.clearChatSession = clearSession

    checkUserInfoStatus()
  }

  loadTheme()
})()
