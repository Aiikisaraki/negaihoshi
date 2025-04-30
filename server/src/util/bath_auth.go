/*
 * @Author: Aii 如樱如月 morikawa@kimisui56.work
 * @Date: 2025-04-24 11:56:44
 * @LastEditors: Aii 如樱如月 morikawa@kimisui56.work
 * @LastEditTime: 2025-04-24 12:02:27
 * @FilePath: \nekaihoshi\server\src\util\bath_auth.go
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
package util

import (
	"encoding/base64"
)

type BasicAuth struct{}

func (bathAuth *BasicAuth) EncodeBasicAuthString(username string, password string) string {
	encodeString := base64.StdEncoding.EncodeToString([]byte(username + ":" + password))
	return "Basic " + encodeString
}

// func (bathAuth *BasicAuth) DecodeBasicAuthString(authString string) (string, string) {
// 	decodeString, _ := base64.StdEncoding.DecodeString(authString[6:])
// 	username := string(decodeString[:strings.Index(string(decodeString), ":")])
// 	password := string(decodeString[strings.Index(string(decodeString), ":")+1:])
// 	return username, password
// }
