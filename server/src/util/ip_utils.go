package util

import (
	"net"
	"net/http"
	"strings"
)

// IPConfig 配置真实IP获取的优先级
type IPConfig struct {
	// 信任的代理服务器IP列表
	TrustedProxies []string
	// 是否信任X-Forwarded-For头
	TrustXForwardedFor bool
	// 是否信任X-Real-IP头
	TrustXRealIP bool
	// 是否信任CF-Connecting-IP头（Cloudflare）
	TrustCFConnectingIP bool
	// 是否信任X-Forwarded-For链中的最后一个IP
	TrustLastXForwardedFor bool
}

// DefaultIPConfig 默认配置
func DefaultIPConfig() *IPConfig {
	return &IPConfig{
		TrustedProxies: []string{
			"127.0.0.1",      // localhost
			"::1",            // localhost IPv6
			"10.0.0.0/8",    // 内网A类
			"172.16.0.0/12", // 内网B类
			"192.168.0.0/16", // 内网C类
		},
		TrustXForwardedFor:      true,
		TrustXRealIP:            true,
		TrustCFConnectingIP:     true,
		TrustLastXForwardedFor:  false, // 默认不信任，因为可能被伪造
	}
}

// GetRealIP 获取真实IP地址
func GetRealIP(r *http.Request, config *IPConfig) string {
	if config == nil {
		config = DefaultIPConfig()
	}

	// 1. 尝试获取X-Real-IP头
	if config.TrustXRealIP {
		if realIP := r.Header.Get("X-Real-IP"); realIP != "" {
			if isValidIP(realIP) {
				return realIP
			}
		}
	}

	// 2. 尝试获取CF-Connecting-IP头（Cloudflare）
	if config.TrustCFConnectingIP {
		if cfIP := r.Header.Get("CF-Connecting-IP"); cfIP != "" {
			if isValidIP(cfIP) {
				return cfIP
			}
		}
	}

	// 3. 尝试获取X-Forwarded-For头
	if config.TrustXForwardedFor {
		if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
			ips := parseXForwardedFor(xff)
			if len(ips) > 0 {
				// 根据配置决定信任哪个IP
				if config.TrustLastXForwardedFor {
					// 信任链中的最后一个IP（最接近客户端的）
					for i := len(ips) - 1; i >= 0; i-- {
						if isValidIP(ips[i]) && !isPrivateIP(ips[i]) {
							return ips[i]
						}
					}
				} else {
					// 信任链中的第一个IP（最接近代理的）
					for _, ip := range ips {
						if isValidIP(ip) && !isPrivateIP(ip) {
							return ip
						}
					}
				}
			}
		}
	}

	// 4. 尝试获取X-Forwarded头
	if xf := r.Header.Get("X-Forwarded"); xf != "" {
		if ip := extractIPFromXForwarded(xf); ip != "" {
			if isValidIP(ip) {
				return ip
			}
		}
	}

	// 5. 尝试获取X-Client-IP头
	if clientIP := r.Header.Get("X-Client-IP"); clientIP != "" {
		if isValidIP(clientIP) {
			return clientIP
		}
	}

	// 6. 尝试获取X-Cluster-Client-IP头
	if clusterIP := r.Header.Get("X-Cluster-Client-IP"); clusterIP != "" {
		if isValidIP(clusterIP) {
			return clusterIP
		}
	}

	// 7. 最后使用RemoteAddr
	if r.RemoteAddr != "" {
		if ip, _, err := net.SplitHostPort(r.RemoteAddr); err == nil {
			if isValidIP(ip) {
				return ip
			}
		}
		// 如果没有端口号，直接使用
		if isValidIP(r.RemoteAddr) {
			return r.RemoteAddr
		}
	}

	return "unknown"
}

// GetClientIP 获取客户端IP（简化版本）
func GetClientIP(r *http.Request) string {
	return GetRealIP(r, DefaultIPConfig())
}

// parseXForwardedFor 解析X-Forwarded-For头
func parseXForwardedFor(xff string) []string {
	ips := strings.Split(xff, ",")
	var result []string
	
	for _, ip := range ips {
		ip = strings.TrimSpace(ip)
		if ip != "" {
			result = append(result, ip)
		}
	}
	
	return result
}

// extractIPFromXForwarded 从X-Forwarded头中提取IP
func extractIPFromXForwarded(xf string) string {
	// X-Forwarded格式: for=192.0.2.60;proto=http;by=203.0.113.43
	parts := strings.Split(xf, ";")
	for _, part := range parts {
		if strings.HasPrefix(part, "for=") {
			ip := strings.TrimPrefix(part, "for=")
			return strings.TrimSpace(ip)
		}
	}
	return ""
}

// isValidIP 验证IP地址是否有效
func isValidIP(ip string) bool {
	if ip == "" {
		return false
	}
	
	// 检查是否为有效IP地址
	if parsedIP := net.ParseIP(ip); parsedIP != nil {
		return true
	}
	
	return false
}

// isPrivateIP 检查是否为私有IP地址
func isPrivateIP(ip string) bool {
	parsedIP := net.ParseIP(ip)
	if parsedIP == nil {
		return false
	}
	
	// 检查是否为私有IP
	if parsedIP.IsPrivate() {
		return true
	}
	
	// 检查是否为回环地址
	if parsedIP.IsLoopback() {
		return true
	}
	
	// 检查是否为链路本地地址
	if parsedIP.IsLinkLocalUnicast() {
		return true
	}
	
	return false
}

// IsTrustedProxy 检查IP是否为受信任的代理
func IsTrustedProxy(ip string, config *IPConfig) bool {
	if config == nil {
		config = DefaultIPConfig()
	}
	
	for _, trusted := range config.TrustedProxies {
		if strings.Contains(trusted, "/") {
			// CIDR格式
			if isIPInCIDR(ip, trusted) {
				return true
			}
		} else {
			// 直接IP匹配
			if ip == trusted {
				return true
			}
		}
	}
	
	return false
}

// isIPInCIDR 检查IP是否在CIDR范围内
func isIPInCIDR(ip, cidr string) bool {
	parsedIP := net.ParseIP(ip)
	if parsedIP == nil {
		return false
	}
	
	_, network, err := net.ParseCIDR(cidr)
	if err != nil {
		return false
	}
	
	return network.Contains(parsedIP)
}

// GetIPInfo 获取IP的详细信息
func GetIPInfo(ip string) map[string]interface{} {
	parsedIP := net.ParseIP(ip)
	if parsedIP == nil {
		return map[string]interface{}{
			"ip":      ip,
			"valid":   false,
			"version": "unknown",
		}
	}
	
	info := map[string]interface{}{
		"ip":      ip,
		"valid":   true,
		"version": "IPv4",
		"private": parsedIP.IsPrivate(),
		"loopback": parsedIP.IsLoopback(),
		"link_local": parsedIP.IsLinkLocalUnicast(),
	}
	
	if parsedIP.To4() == nil {
		info["version"] = "IPv6"
	}
	
	return info
}
