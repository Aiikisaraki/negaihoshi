/*
 * @Author: Aii如樱如月 morikawa@kimisui56.work
 * @Date: 2025-01-20 20:30:00
 * @Description: API文档和测试接口
 */
package web

import (
	"encoding/json"
	"negaihoshi/server/config"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// API接口信息结构
type APIEndpoint struct {
	Method      string                    `json:"method"`
	Path        string                    `json:"path"`
	Description string                    `json:"description"`
	Parameters  []APIParameter            `json:"parameters,omitempty"`
	RequestBody *APIRequestBody           `json:"request_body,omitempty"`
	Responses   map[string]APIResponseDoc `json:"responses"`
	Tags        []string                  `json:"tags"`
}

type APIParameter struct {
	Name        string `json:"name"`
	In          string `json:"in"` // query, path, header
	Type        string `json:"type"`
	Required    bool   `json:"required"`
	Description string `json:"description"`
	Example     string `json:"example,omitempty"`
}

type APIRequestBody struct {
	ContentType string                 `json:"content_type"`
	Schema      map[string]interface{} `json:"schema"`
	Example     map[string]interface{} `json:"example,omitempty"`
}

type APIResponseDoc struct {
	Description string                 `json:"description"`
	Schema      map[string]interface{} `json:"schema,omitempty"`
	Example     map[string]interface{} `json:"example,omitempty"`
}

type APIDocsHandler struct {
	config *config.ConfigFunction
}

func NewAPIDocsHandler(config *config.ConfigFunction) *APIDocsHandler {
	return &APIDocsHandler{
		config: config,
	}
}

// 注册API文档路由
func (a *APIDocsHandler) RegisterAPIDocsRoutes(server *gin.Engine) {
	server.GET("/", a.ShowHomePage)
	server.GET("/api/docs", a.GetAPIDocumentation)
	server.GET("/api/docs/json", a.GetAPIDocumentationJSON)
	server.GET("/api/test", a.ShowAPITestPage)
	server.POST("/api/test/execute", a.ExecuteAPITest)
}

// 显示主页
func (a *APIDocsHandler) ShowHomePage(ctx *gin.Context) {
	if !a.config.IsApiDocsEnabled() {
		ctx.String(http.StatusOK, "Hi, this is Aii's Private API~")
		return
	}

	enabled, title, description, version, contactName, contactEmail := a.config.GetApiDocsConfig()
	if !enabled {
		ctx.String(http.StatusOK, "Hi, this is Aii's Private API~")
		return
	}

	html := `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>` + title + `</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #4a90e2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
        }
        .container {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 40px;
            max-width: 800px;
            width: 90%;
            text-align: center;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            background: linear-gradient(45deg, #4a90e2, #87ceeb);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .subtitle {
            font-size: 1.2rem;
            margin-bottom: 30px;
            opacity: 0.9;
        }
        .version {
            display: inline-block;
            background: rgba(74, 144, 226, 0.3);
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 0.9rem;
            margin-bottom: 30px;
        }
        .nav-buttons {
            display: flex;
            gap: 20px;
            justify-content: center;
            flex-wrap: wrap;
            margin-bottom: 30px;
        }
        .btn {
            background: rgba(74, 144, 226, 0.2);
            border: 1px solid rgba(74, 144, 226, 0.4);
            color: white;
            padding: 12px 24px;
            border-radius: 10px;
            text-decoration: none;
            transition: all 0.3s ease;
            backdrop-filter: blur(5px);
        }
        .btn:hover {
            background: rgba(74, 144, 226, 0.4);
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(74, 144, 226, 0.3);
        }
        .btn-primary {
            background: linear-gradient(45deg, #2a5298, #4a90e2);
        }
        .contact {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid rgba(74, 144, 226, 0.3);
            opacity: 0.8;
        }
        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        .feature {
            background: rgba(74, 144, 226, 0.1);
            padding: 20px;
            border-radius: 10px;
            border: 1px solid rgba(74, 144, 226, 0.3);
        }
        .feature h3 {
            margin-bottom: 10px;
            color: #87ceeb;
        }
        @media (max-width: 600px) {
            .nav-buttons { flex-direction: column; align-items: center; }
            h1 { font-size: 2rem; }
            .container { padding: 20px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🌟 ` + title + `</h1>
        <p class="subtitle">` + description + `</p>
        <div class="version">版本 ` + version + `</div>
        
        <div class="features">
            <div class="feature">
                <h3>🌙 树洞系统</h3>
                <p>匿名分享心情和想法</p>
            </div>
            <div class="feature">
                <h3>👤 用户管理</h3>
                <p>注册、登录、权限控制</p>
            </div>
            <div class="feature">
                <h3>🔗 WordPress集成</h3>
                <p>内容转发到WordPress站点</p>
            </div>
        </div>

        <div class="nav-buttons">
            <a href="/api/docs" class="btn btn-primary">📚 API文档</a>
            <a href="/api/test" class="btn">🧪 API测试</a>
            <a href="https://github.com" class="btn">📦 源码仓库</a>
        </div>

        <div class="contact">
            <p>👨‍💻 维护者: ` + contactName + `</p>
            <p>📧 联系邮箱: ` + contactEmail + `</p>
        </div>
    </div>
</body>
</html>`

	ctx.Header("Content-Type", "text/html; charset=utf-8")
	ctx.String(http.StatusOK, html)
}

// 获取API文档数据
func (a *APIDocsHandler) GetAPIDocumentation(ctx *gin.Context) {
	if !a.config.IsApiDocsEnabled() {
		ctx.String(http.StatusForbidden, "API文档功能未启用")
		return
	}

	apis := a.getAPIEndpoints()
	_, title, description, version, contactName, contactEmail := a.config.GetApiDocsConfig()

	html := `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>` + title + ` - API文档</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #4a90e2 100%);
            min-height: 100vh;
            padding: 20px;
            color: white;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: rgba(74, 144, 226, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 30px;
            box-shadow: 0 8px 32px rgba(74, 144, 226, 0.3);
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 30px;
            border-bottom: 1px solid rgba(74, 144, 226, 0.3);
        }
        h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            background: linear-gradient(45deg, #4a90e2, #87ceeb);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .subtitle {
            font-size: 1.2rem;
            margin-bottom: 20px;
            opacity: 0.9;
        }
        .version {
            display: inline-block;
            background: rgba(74, 144, 226, 0.3);
            padding: 8px 20px;
            border-radius: 25px;
            font-size: 0.9rem;
            margin-bottom: 20px;
        }
        .contact {
            margin-top: 20px;
            opacity: 0.8;
        }
        .back-btn {
            display: inline-block;
            background: rgba(74, 144, 226, 0.2);
            padding: 10px 20px;
            border-radius: 10px;
            text-decoration: none;
            color: white;
            margin-bottom: 30px;
            transition: all 0.3s;
        }
        .back-btn:hover {
            background: rgba(74, 144, 226, 0.4);
            transform: translateY(-2px);
        }
        .tags-nav {
            display: flex;
            gap: 15px;
            margin-bottom: 30px;
            flex-wrap: wrap;
            justify-content: center;
        }
        .tag-btn {
            background: rgba(74, 144, 226, 0.2);
            border: 1px solid rgba(74, 144, 226, 0.4);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            cursor: pointer;
            transition: all 0.3s;
        }
        .tag-btn:hover, .tag-btn.active {
            background: rgba(74, 144, 226, 0.4);
            transform: translateY(-2px);
        }
        .api-section {
            background: rgba(74, 144, 226, 0.1);
            border-radius: 15px;
            padding: 25px;
            margin-bottom: 25px;
            border: 1px solid rgba(74, 144, 226, 0.3);
            transition: all 0.3s;
        }
        .api-section:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(74, 144, 226, 0.3);
        }
        .api-header {
            display: flex;
            align-items: center;
            gap: 15px;
            margin-bottom: 20px;
            flex-wrap: wrap;
        }
        .method {
            padding: 6px 12px;
            border-radius: 8px;
            font-weight: bold;
            font-size: 0.8rem;
            min-width: 60px;
            text-align: center;
        }
        .method.GET { background: #4a90e2; }
        .method.POST { background: #2a5298; }
        .method.PUT { background: #87ceeb; color: #1e3c72; }
        .method.DELETE { background: #1e3c72; }
        .api-path {
            font-family: 'Courier New', monospace;
            font-size: 1.1rem;
            background: rgba(74, 144, 226, 0.3);
            padding: 8px 12px;
            border-radius: 6px;
            flex: 1;
        }
        .api-description {
            color: #87ceeb;
            font-weight: 500;
            font-size: 1.1rem;
        }
        .api-details {
            background: rgba(74, 144, 226, 0.2);
            border-radius: 10px;
            padding: 20px;
            margin-top: 15px;
        }
        .detail-section {
            margin-bottom: 20px;
        }
        .detail-section:last-child {
            margin-bottom: 0;
        }
        .detail-title {
            font-weight: bold;
            margin-bottom: 10px;
            color: #4a90e2;
            font-size: 1rem;
        }
        .parameters-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
        }
        .parameter-item {
            background: rgba(74, 144, 226, 0.1);
            padding: 15px;
            border-radius: 8px;
            border: 1px solid rgba(74, 144, 226, 0.3);
        }
        .param-name {
            font-weight: bold;
            color: #87ceeb;
            margin-bottom: 5px;
        }
        .param-type {
            font-size: 0.9rem;
            opacity: 0.8;
            margin-bottom: 5px;
        }
        .param-required {
            display: inline-block;
            background: #1e3c72;
            color: white;
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 0.7rem;
            margin-left: 10px;
        }
        .param-optional {
            display: inline-block;
            background: #4a90e2;
            color: white;
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 0.7rem;
            margin-left: 10px;
        }
        .request-body, .response-example {
            background: rgba(74, 144, 226, 0.2);
            padding: 15px;
            border-radius: 8px;
            font-family: 'Courier New', monospace;
            font-size: 0.9rem;
            white-space: pre-wrap;
            overflow-x: auto;
        }
        .tag-indicator {
            display: inline-block;
            background: rgba(74, 144, 226, 0.3);
            padding: 4px 12px;
            border-radius: 15px;
            font-size: 0.8rem;
            margin-left: 10px;
        }
        @media (max-width: 768px) {
            .container { padding: 20px; }
            .api-header { flex-direction: column; align-items: flex-start; }
            .tags-nav { justify-content: flex-start; }
            .parameters-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <a href="/" class="back-btn">← 返回首页</a>
        
        <div class="header">
            <h1>📚 ` + title + `</h1>
            <p class="subtitle">` + description + `</p>
            <div class="version">版本 ` + version + `</div>
            <div class="contact">
                <p>👨‍💻 维护者: ` + contactName + ` | 📧 联系邮箱: ` + contactEmail + `</p>
            </div>
        </div>

        <div class="tags-nav">
            <button class="tag-btn active" onclick="filterByTag('all')">全部</button>
            <button class="tag-btn" onclick="filterByTag('auth')">认证</button>
            <button class="tag-btn" onclick="filterByTag('treehole')">树洞</button>
            <button class="tag-btn" onclick="filterByTag('wordpress')">WordPress</button>
            <button class="tag-btn" onclick="filterByTag('system')">系统</button>
        </div>

        <div id="api-list">`

	// 生成API文档内容
	for _, api := range apis {
		html += a.generateAPISection(api)
	}

	html += `
        </div>
    </div>

    <script>
        function filterByTag(tag) {
            const sections = document.querySelectorAll('.api-section');
            const tagBtns = document.querySelectorAll('.tag-btn');
            
            // 更新按钮状态
            tagBtns.forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');
            
            sections.forEach(section => {
                if (tag === 'all' || section.dataset.tags.includes(tag)) {
                    section.style.display = 'block';
                } else {
                    section.style.display = 'none';
                }
            });
        }
    </script>
</body>
</html>`

	ctx.Header("Content-Type", "text/html; charset=utf-8")
	ctx.String(http.StatusOK, html)
}

// 生成单个API部分的HTML
func (a *APIDocsHandler) generateAPISection(api APIEndpoint) string {
	html := `<div class="api-section" data-tags="` + strings.Join(api.Tags, " ") + `">
        <div class="api-header">
            <span class="method ` + api.Method + `">` + api.Method + `</span>
            <span class="api-path">` + api.Path + `</span>
            <span class="api-description">` + api.Description + `</span>
            <span class="tag-indicator">` + strings.Join(api.Tags, ", ") + `</span>
        </div>
        
        <div class="api-details">`

	// 添加参数信息
	if len(api.Parameters) > 0 {
		html += `
            <div class="detail-section">
                <div class="detail-title">📋 参数</div>
                <div class="parameters-grid">`

		for _, param := range api.Parameters {
			requiredClass := "param-optional"
			requiredText := "可选"
			if param.Required {
				requiredClass = "param-required"
				requiredText = "必需"
			}

			html += `
                    <div class="parameter-item">
                        <div class="param-name">` + param.Name + ` <span class="` + requiredClass + `">` + requiredText + `</span></div>
                        <div class="param-type">类型: ` + param.Type + `</div>
                        <div class="param-type">位置: ` + param.In + `</div>
                        <div class="param-type">描述: ` + param.Description + `</div>`

			if param.Example != "" {
				html += `
                        <div class="param-type">示例: ` + param.Example + `</div>`
			}

			html += `
                    </div>`
		}

		html += `
                </div>
            </div>`
	}

	// 添加请求体信息
	if api.RequestBody != nil {
		html += `
            <div class="detail-section">
                <div class="detail-title">📤 请求体</div>
                <div class="param-type">内容类型: ` + api.RequestBody.ContentType + `</div>`

		if api.RequestBody.Example != nil {
			exampleJSON, _ := json.MarshalIndent(api.RequestBody.Example, "", "  ")
			html += `
                <div class="request-body">` + string(exampleJSON) + `</div>`
		}

		html += `
            </div>`
	}

	// 添加响应信息
	if len(api.Responses) > 0 {
		html += `
            <div class="detail-section">
                <div class="detail-title">📥 响应</div>`

		for statusCode, response := range api.Responses {
			html += `
                <div class="param-type">状态码: ` + statusCode + ` - ` + response.Description + `</div>`

			if response.Example != nil {
				exampleJSON, _ := json.MarshalIndent(response.Example, "", "  ")
				html += `
                <div class="response-example">` + string(exampleJSON) + `</div>`
			}
		}

		html += `
            </div>`
	}

	html += `
        </div>
    </div>`

	return html
}

// 显示API测试页面
func (a *APIDocsHandler) ShowAPITestPage(ctx *gin.Context) {
	if !a.config.IsApiDocsEnabled() {
		ctx.String(http.StatusForbidden, "API测试功能未启用")
		return
	}

	// 获取当前请求的协议和主机
	protocol := "http"
	if ctx.Request.TLS != nil {
		protocol = "https"
	}
	host := ctx.Request.Host
	if host == "" {
		host = "localhost:9292" // 默认值
	}
	apiBaseURL := protocol + "://" + host

	html := `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>API测试工具</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #4a90e2 100%);
            min-height: 100vh;
            padding: 20px;
            color: white;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: rgba(74, 144, 226, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 30px;
            box-shadow: 0 8px 32px rgba(74, 144, 226, 0.3);
        }
        h1 { text-align: center; margin-bottom: 30px; color: #4a90e2; }
        .api-section {
            background: rgba(74, 144, 226, 0.1);
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 20px;
            border: 1px solid rgba(74, 144, 226, 0.3);
        }
        .api-header {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 15px;
        }
        .method {
            padding: 5px 10px;
            border-radius: 5px;
            font-weight: bold;
            font-size: 0.8rem;
        }
        .method.GET { background: #4a90e2; }
        .method.POST { background: #2a5298; }
        .method.PUT { background: #87ceeb; color: #1e3c72; }
        .method.DELETE { background: #1e3c72; }
        .api-path { font-family: monospace; font-size: 1.1rem; }
        .test-form {
            background: rgba(74, 144, 226, 0.2);
            padding: 15px;
            border-radius: 8px;
            margin-top: 10px;
        }
        .form-group {
            margin-bottom: 15px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }
        input, textarea, select {
            width: 100%;
            padding: 10px;
            border: 1px solid rgba(74, 144, 226, 0.4);
            border-radius: 5px;
            background: rgba(74, 144, 226, 0.1);
            color: white;
        }
        input::placeholder, textarea::placeholder {
            color: rgba(255, 255, 255, 0.7);
        }
        .btn {
            background: #2a5298;
            border: none;
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            transition: background 0.3s;
        }
        .btn:hover { background: #1e3c72; }
        .response {
            background: rgba(74, 144, 226, 0.2);
            padding: 15px;
            border-radius: 8px;
            margin-top: 15px;
            font-family: monospace;
            white-space: pre-wrap;
            max-height: 300px;
            overflow-y: auto;
        }
        .api-base-url {
            background: rgba(74, 144, 226, 0.2);
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            text-align: center;
            font-family: monospace;
            font-size: 1.1rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>API测试工具</h1>
        
        <div class="api-base-url">
            <strong>API基础URL:</strong> ` + apiBaseURL + `
        </div>
        
        <div id="api-list">
            <p>正在加载API列表...</p>
        </div>
    </div>

    <script>
        // 设置API基础URL
        const API_BASE_URL = '` + apiBaseURL + `';
        
        // 加载API列表
        fetch('/api/docs/json')
            .then(response => response.json())
            .then(data => {
                renderAPIList(data.endpoints);
            })
            .catch(error => {
                document.getElementById('api-list').innerHTML = '<p>加载失败: ' + error.message + '</p>';
            });

        function renderAPIList(endpoints) {
            const container = document.getElementById('api-list');
            container.innerHTML = '';

            endpoints.forEach(api => {
                const section = document.createElement('div');
                section.className = 'api-section';
                
                const methodClass = api.method;
                const methodText = api.method;
                const path = api.path;
                const description = api.description;
                const hasRequestBody = api.request_body;
                const requestBodyExample = hasRequestBody ? JSON.stringify(api.request_body.example || {}, null, 2) : '{}';
                
                section.innerHTML = '<div class="api-header">' +
                    '<span class="method ' + methodClass + '">' + methodText + '</span>' +
                    '<span class="api-path">' + path + '</span>' +
                    '<span style="margin-left: auto;">' + description + '</span>' +
                    '</div>' +
                    '<div class="test-form">' +
                    '<div class="form-group">' +
                    '<label>请求URL:</label>' +
                    '<input type="text" value="' + API_BASE_URL + path + '" readonly>' +
                    '</div>';
                
                if (hasRequestBody) {
                    section.innerHTML += '<div class="form-group">' +
                        '<label>请求体 (JSON):</label>' +
                        '<textarea rows="4" placeholder=\'' + requestBodyExample + '\'></textarea>' +
                        '</div>';
                }
                
                section.innerHTML += '<button class="btn" onclick="testAPI(\'' + methodText + '\', \'' + path + '\', this)">测试接口</button>' +
                    '<div class="response" style="display: none;"></div>' +
                    '</div>';
                
                container.appendChild(section);
            });
        }

        function testAPI(method, path, button) {
            const section = button.closest('.api-section');
            const responseDiv = section.querySelector('.response');
            const textarea = section.querySelector('textarea');
            
            let url = API_BASE_URL + path;
            let options = {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                }
            };

            if (textarea && textarea.value) {
                try {
                    options.body = JSON.stringify(JSON.parse(textarea.value));
                } catch (e) {
                    responseDiv.style.display = 'block';
                    responseDiv.textContent = '请求体JSON格式错误: ' + e.message;
                    return;
                }
            }

            button.textContent = '测试中...';
            button.disabled = true;

            fetch(url, options)
                .then(response => {
                    return response.text().then(text => ({
                        status: response.status,
                        statusText: response.statusText,
                        headers: Object.fromEntries(response.headers.entries()),
                        body: text
                    }));
                })
                .then(result => {
                    responseDiv.style.display = 'block';
                    responseDiv.textContent = '状态码: ' + result.status + ' ' + result.statusText + '\n\n' +
                        '响应头:\n' + JSON.stringify(result.headers, null, 2) + '\n\n' +
                        '响应体:\n' + result.body;
                })
                .catch(error => {
                    responseDiv.style.display = 'block';
                    responseDiv.textContent = '请求失败: ' + error.message;
                })
                .finally(() => {
                    button.textContent = '测试接口';
                    button.disabled = false;
                });
        }
    </script>
</body>
</html>`

	ctx.Header("Content-Type", "text/html; charset=utf-8")
	ctx.String(http.StatusOK, html)
}

// GetAPIDocumentationJSON 返回JSON格式的API文档
func (a *APIDocsHandler) GetAPIDocumentationJSON(ctx *gin.Context) {
	if !a.config.IsApiDocsEnabled() {
		ctx.JSON(http.StatusForbidden, gin.H{"error": "API文档功能未启用"})
		return
	}

	enabled, title, description, version, contactName, contactEmail := a.config.GetApiDocsConfig()
	if !enabled {
		ctx.JSON(http.StatusForbidden, gin.H{"error": "API文档功能未启用"})
		return
	}

	apis := a.getAPIEndpoints()

	docs := gin.H{
		"title":       title,
		"description": description,
		"version":     version,
		"contact": gin.H{
			"name":  contactName,
			"email": contactEmail,
		},
		"endpoints": apis,
	}

	ctx.JSON(http.StatusOK, docs)
}

// 执行API测试
func (a *APIDocsHandler) ExecuteAPITest(ctx *gin.Context) {
	if !a.config.IsApiDocsEnabled() {
		ErrorResponse(ctx, 403, "API测试功能未启用")
		return
	}

	type TestRequest struct {
		Method string                 `json:"method"`
		Path   string                 `json:"path"`
		Body   map[string]interface{} `json:"body,omitempty"`
	}

	var req TestRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ValidationError(ctx, "请求参数错误")
		return
	}

	SuccessResponse(ctx, gin.H{
		"message": "API测试请求已接收",
		"request": req,
	})
}

// 获取所有API端点定义
func (a *APIDocsHandler) getAPIEndpoints() []APIEndpoint {
	return []APIEndpoint{
		// 用户认证相关
		{
			Method:      "POST",
			Path:        "/api/users/signup",
			Description: "用户注册",
			Tags:        []string{"auth"},
			RequestBody: &APIRequestBody{
				ContentType: "application/json",
				Schema: map[string]interface{}{
					"type": "object",
					"properties": map[string]interface{}{
						"username": map[string]interface{}{"type": "string", "description": "用户名"},
						"password": map[string]interface{}{"type": "string", "description": "密码"},
						"email":    map[string]interface{}{"type": "string", "description": "邮箱"},
					},
					"required": []string{"username", "password", "email"},
				},
				Example: map[string]interface{}{
					"username": "testuser",
					"password": "123456",
					"email":    "test@example.com",
				},
			},
			Responses: map[string]APIResponseDoc{
				"200": {
					Description: "注册成功",
					Example: map[string]interface{}{
						"code":    200,
						"message": "注册成功",
						"data":    map[string]interface{}{"user_id": 1},
					},
				},
			},
		},
		{
			Method:      "POST",
			Path:        "/api/users/login",
			Description: "用户登录",
			Tags:        []string{"auth"},
			RequestBody: &APIRequestBody{
				ContentType: "application/json",
				Schema: map[string]interface{}{
					"type": "object",
					"properties": map[string]interface{}{
						"username": map[string]interface{}{"type": "string", "description": "用户名"},
						"password": map[string]interface{}{"type": "string", "description": "密码"},
					},
					"required": []string{"username", "password"},
				},
				Example: map[string]interface{}{
					"username": "testuser",
					"password": "123456",
				},
			},
			Responses: map[string]APIResponseDoc{
				"200": {
					Description: "登录成功",
					Example: map[string]interface{}{
						"code":    200,
						"message": "登录成功",
						"data":    map[string]interface{}{"token": "jwt_token_here"},
					},
				},
			},
		},
		{
			Method:      "POST",
			Path:        "/api/users/logout",
			Description: "用户登出",
			Tags:        []string{"auth"},
			Responses: map[string]APIResponseDoc{
				"200": {
					Description: "登出成功",
					Example: map[string]interface{}{
						"code":    200,
						"message": "登出成功",
						"data":    nil,
					},
				},
			},
		},

		// 树洞相关
		{
			Method:      "GET",
			Path:        "/api/treehole/list",
			Description: "获取树洞消息列表",
			Tags:        []string{"treehole"},
			Parameters: []APIParameter{
				{Name: "page", In: "query", Type: "integer", Required: false, Description: "页码", Example: "1"},
				{Name: "size", In: "query", Type: "integer", Required: false, Description: "每页数量", Example: "10"},
			},
			Responses: map[string]APIResponseDoc{
				"200": {
					Description: "获取成功",
					Example: map[string]interface{}{
						"code":    200,
						"message": "操作成功",
						"data": map[string]interface{}{
							"messages": []map[string]interface{}{
								{
									"id":      1,
									"content": "测试消息",
									"ctime":   "2025-01-20T10:00:00Z",
								},
							},
							"page": 1,
							"size": 10,
						},
					},
				},
			},
		},
		{
			Method:      "POST",
			Path:        "/api/treehole/create",
			Description: "创建树洞消息",
			Tags:        []string{"treehole"},
			RequestBody: &APIRequestBody{
				ContentType: "application/json",
				Schema: map[string]interface{}{
					"type": "object",
					"properties": map[string]interface{}{
						"content": map[string]interface{}{"type": "string", "description": "消息内容", "maxLength": 1000},
					},
					"required": []string{"content"},
				},
				Example: map[string]interface{}{
					"content": "这是一条测试树洞消息",
				},
			},
			Responses: map[string]APIResponseDoc{
				"200": {
					Description: "创建成功",
					Example: map[string]interface{}{
						"code":    200,
						"message": "发布成功",
						"data": map[string]interface{}{
							"id":      1,
							"content": "这是一条测试树洞消息",
							"ctime":   "2025-01-20T10:00:00Z",
						},
					},
				},
			},
		},
		{
			Method:      "GET",
			Path:        "/api/treehole/{id}",
			Description: "获取单个树洞消息",
			Tags:        []string{"treehole"},
			Parameters: []APIParameter{
				{Name: "id", In: "path", Type: "integer", Required: true, Description: "消息ID", Example: "1"},
			},
			Responses: map[string]APIResponseDoc{
				"200": {
					Description: "获取成功",
					Example: map[string]interface{}{
						"code":    200,
						"message": "操作成功",
						"data": map[string]interface{}{
							"id":      1,
							"content": "测试消息",
							"ctime":   "2025-01-20T10:00:00Z",
						},
					},
				},
			},
		},
		{
			Method:      "DELETE",
			Path:        "/api/treehole/{id}",
			Description: "删除树洞消息",
			Tags:        []string{"treehole"},
			Parameters: []APIParameter{
				{Name: "id", In: "path", Type: "integer", Required: true, Description: "消息ID", Example: "1"},
			},
			Responses: map[string]APIResponseDoc{
				"200": {
					Description: "删除成功",
					Example: map[string]interface{}{
						"code":    200,
						"message": "删除成功",
						"data":    nil,
					},
				},
			},
		},

		// WordPress集成相关
		{
			Method:      "POST",
			Path:        "/api/wordpress/bind",
			Description: "绑定WordPress站点",
			Tags:        []string{"wordpress"},
			RequestBody: &APIRequestBody{
				ContentType: "application/json",
				Schema: map[string]interface{}{
					"type": "object",
					"properties": map[string]interface{}{
						"site_url":  map[string]interface{}{"type": "string", "description": "WordPress站点URL"},
						"username":  map[string]interface{}{"type": "string", "description": "WordPress用户名"},
						"api_key":   map[string]interface{}{"type": "string", "description": "WordPress应用密码"},
						"site_name": map[string]interface{}{"type": "string", "description": "站点名称"},
					},
					"required": []string{"site_url", "username", "api_key"},
				},
				Example: map[string]interface{}{
					"site_url":  "https://blog.example.com",
					"username":  "admin",
					"api_key":   "your_app_password",
					"site_name": "我的博客",
				},
			},
			Responses: map[string]APIResponseDoc{
				"200": {
					Description: "绑定成功",
					Example: map[string]interface{}{
						"code":    200,
						"message": "WordPress站点绑定成功",
						"data":    map[string]interface{}{"site": "https://blog.example.com"},
					},
				},
			},
		},
		{
			Method:      "GET",
			Path:        "/api/wordpress/sites",
			Description: "获取已绑定的WordPress站点",
			Tags:        []string{"wordpress"},
			Responses: map[string]APIResponseDoc{
				"200": {
					Description: "获取成功",
					Example: map[string]interface{}{
						"code":    200,
						"message": "操作成功",
						"data": map[string]interface{}{
							"sites": []map[string]interface{}{
								{
									"id":        1,
									"site_url":  "https://blog.example.com",
									"site_name": "我的博客",
									"username":  "admin",
									"bind_time": "2025-01-20T10:00:00Z",
								},
							},
						},
					},
				},
			},
		},
		{
			Method:      "DELETE",
			Path:        "/api/wordpress/sites/{id}",
			Description: "解绑WordPress站点",
			Tags:        []string{"wordpress"},
			Parameters: []APIParameter{
				{Name: "id", In: "path", Type: "integer", Required: true, Description: "站点ID", Example: "1"},
			},
			Responses: map[string]APIResponseDoc{
				"200": {
					Description: "解绑成功",
					Example: map[string]interface{}{
						"code":    200,
						"message": "站点解绑成功",
						"data":    map[string]interface{}{"site_id": 1},
					},
				},
			},
		},
		{
			Method:      "POST",
			Path:        "/api/wordpress/transfer",
			Description: "转发内容到WordPress",
			Tags:        []string{"wordpress"},
			RequestBody: &APIRequestBody{
				ContentType: "application/json",
				Schema: map[string]interface{}{
					"type": "object",
					"properties": map[string]interface{}{
						"content_id":   map[string]interface{}{"type": "integer", "description": "内容ID"},
						"content_type": map[string]interface{}{"type": "string", "enum": []string{"treehole", "status", "post"}, "description": "内容类型"},
						"site_ids":     map[string]interface{}{"type": "array", "items": map[string]interface{}{"type": "integer"}, "description": "目标站点ID列表"},
						"title":        map[string]interface{}{"type": "string", "description": "文章标题（可选）"},
						"as_private":   map[string]interface{}{"type": "boolean", "description": "是否设为私有"},
					},
					"required": []string{"content_id", "content_type", "site_ids"},
				},
				Example: map[string]interface{}{
					"content_id":   1,
					"content_type": "treehole",
					"site_ids":     []int{1, 2},
					"title":        "转发的树洞内容",
					"as_private":   false,
				},
			},
			Responses: map[string]APIResponseDoc{
				"200": {
					Description: "转发成功",
					Example: map[string]interface{}{
						"code":    200,
						"message": "内容转发成功",
						"data": map[string]interface{}{
							"content_id":     1,
							"content_type":   "treehole",
							"transferred_to": 2,
							"results": []map[string]interface{}{
								{
									"site_id":     1,
									"success":     true,
									"wp_post_id":  123,
									"wp_post_url": "https://example.com/post/123",
								},
							},
						},
					},
				},
			},
		},
	}
}
