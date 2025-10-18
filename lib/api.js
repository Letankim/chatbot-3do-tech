const API_BASE = "https://3docorp.id.vn/rental"

class ApiClient {
  constructor() {
    this.apiKey = null
  }

  setApiKey(key) {
    this.apiKey = key
    if (typeof window !== "undefined") {
      localStorage.setItem("api_key",key)
    }
  }

  getApiKey() {
    if (!this.apiKey && typeof window !== "undefined") {
      this.apiKey = localStorage.getItem("api_key")
    }
    return this.apiKey
  }

  clearApiKey() {
    this.apiKey = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("api_key")
    }
  }

  async request(endpoint,options = {}) {
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    }

    const apiKey = this.getApiKey()
    if (apiKey && !endpoint.includes("/login")) {
      headers["X-API-Key"] = apiKey
    }

    try {
      const response = await fetch(`${API_BASE}${endpoint}`,{
        ...options,
        headers,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Request failed")
      }

      return data
    } catch (error) {
      console.error("API Error:",error)
      throw error
    }
  }

  async login(email,password) {
    const data = await this.request("/user/login",{
      method: "POST",
      body: JSON.stringify({ email,password }),
    })
    if (data.api_key) {
      this.setApiKey(data.api_key)
    }
    return data
  }

  async getPolicies() {
    return this.request("/user/policies")
  }

  async updatePolicies(policies) {
    return this.request("/user/policies",{
      method: "PUT",
      body: JSON.stringify(policies),
    })
  }

  async getProducts(params = {}) {
    const query = new URLSearchParams(params).toString()
    return this.request(`/user/products${query ? `?${query}` : ""}`)
  }

  async createProduct(product) {
    return this.request("/user/products",{
      method: "POST",
      body: JSON.stringify(product),
    })
  }

  async updateProduct(id,product) {
    return this.request(`/user/products/${id}`,{
      method: "PUT",
      body: JSON.stringify(product),
    })
  }

  async deleteProduct(id) {
    return this.request(`/user/products/${id}`,{
      method: "DELETE",
    })
  }

  async getThemes() {
    return this.request("/user/themes")
  }

  async createTheme(theme) {
    return this.request("/user/themes",{
      method: "POST",
      body: JSON.stringify(theme),
    })
  }

  async updateTheme(id,theme) {
    return this.request(`/user/themes/${id}`,{
      method: "PUT",
      body: JSON.stringify(theme),
    })
  }

  async deleteTheme(id) {
    return this.request(`/user/themes/${id}`,{
      method: "DELETE",
    })
  }
}

export const api = new ApiClient()
