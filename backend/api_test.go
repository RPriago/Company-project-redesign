package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"golang.org/x/crypto/bcrypt"
	"path/filepath"
	"petronesia-backend/config"
	"petronesia-backend/models"
	"petronesia-backend/routes"
	"petronesia-backend/utils"

	"github.com/gofiber/fiber/v2"
)

func setupTestApp(t *testing.T) *fiber.App {
	t.Helper()
	t.Setenv("APP_ENV", "test")
	t.Setenv("ADMIN_GATEWAY_SECRET", "test-gateway-secret-at-least-32-bytes")
	t.Setenv("DATABASE_URL", "")
	t.Setenv("DB_TYPE", "sqlite")
	t.Setenv("SQLITE_FILE", filepath.Join(t.TempDir(), "api.db"))
	db, err := config.OpenDatabase()
	if err != nil {
		t.Fatal(err)
	}
	config.DB = db
	// Fixtures are explicit and test-local, never application startup seeds.
	hash, err := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
	if err != nil {
		t.Fatal(err)
	}
	if err := db.Create(&models.Admin{Username: "admin", Password: string(hash), Role: "superadmin", TokenVersion: 1}).Error; err != nil {
		t.Fatal(err)
	}
	if err := db.Create(&models.SiteContent{Key: "hero_headline", Section: "home", Type: "text", Label: "Hero", Value: "Test fixture"}).Error; err != nil {
		t.Fatal(err)
	}
	app := fiber.New()
	routes.SetupRoutes(app)
	return app
}

func TestPublicEndpoints(t *testing.T) {
	app := setupTestApp(t)

	req := httptest.NewRequest("GET", "/api/content", nil)
	req.Header.Set("X-Admin-Gateway-Secret", "test-gateway-secret-at-least-32-bytes")
	resp, err := app.Test(req, -1)
	if err != nil || responseStatus(resp) != 200 {
		t.Fatalf("GET /api/content failed: status=%d, err=%v", responseStatus(resp), err)
	}

	var contentData struct {
		Success bool              `json:"success"`
		Map     map[string]string `json:"map"`
	}
	_ = json.NewDecoder(resp.Body).Decode(&contentData)
	if !contentData.Success || len(contentData.Map) == 0 {
		t.Fatalf("Content data empty or not success")
	}

	reqJobs := httptest.NewRequest("GET", "/api/jobs", nil)
	reqJobs.Header.Set("X-Admin-Gateway-Secret", "test-gateway-secret-at-least-32-bytes")
	respJobs, err := app.Test(reqJobs, -1)
	if err != nil || responseStatus(respJobs) != 200 {
		t.Fatalf("GET /api/jobs failed: status=%d, err=%v", responseStatus(respJobs), err)
	}
}

func TestAdminAuthAndCRUD(t *testing.T) {
	app := setupTestApp(t)

	loginBody, _ := json.Marshal(map[string]string{
		"username": "admin",
		"password": "admin123",
	})
	reqLogin := httptest.NewRequest("POST", "/api/auth/login", bytes.NewReader(loginBody))
	reqLogin.Header.Set("X-Admin-Gateway-Secret", "test-gateway-secret-at-least-32-bytes")
	reqLogin.Header.Set("Content-Type", "application/json")
	respLogin, err := app.Test(reqLogin, -1)
	if err != nil || responseStatus(respLogin) != 200 {
		t.Fatalf("Admin login failed: status=%d, err=%v", responseStatus(respLogin), err)
	}

	var loginData struct {
		Success bool   `json:"success"`
		Token   string `json:"token"`
	}
	_ = json.NewDecoder(respLogin.Body).Decode(&loginData)
	token := loginData.Token

	updatePayload, _ := json.Marshal(map[string]interface{}{
		"map": map[string]string{
			"hero_headline": "Inovasi Energi Teruji",
		},
	})
	reqUpdate := httptest.NewRequest("PUT", "/api/admin/content", bytes.NewReader(updatePayload))
	reqUpdate.Header.Set("X-Admin-Gateway-Secret", "test-gateway-secret-at-least-32-bytes")
	reqUpdate.Header.Set("Content-Type", "application/json")
	reqUpdate.Header.Set("Authorization", "Bearer "+token)
	respUpdate, err := app.Test(reqUpdate, -1)
	if err != nil || responseStatus(respUpdate) != 200 {
		t.Fatalf("Admin PUT /api/admin/content failed: status=%d, err=%v", responseStatus(respUpdate), err)
	}
}

func TestSecVulnerabilities_008_to_014(t *testing.T) {
	app := setupTestApp(t)

	// 1. SEC-008: Verify Job Lookup with numeric ID vs slug without DB cast errors
	reqJobNum := httptest.NewRequest("GET", "/api/jobs/99999", nil)
	reqJobNum.Header.Set("X-Admin-Gateway-Secret", "test-gateway-secret-at-least-32-bytes")
	respJobNum, err := app.Test(reqJobNum, -1)
	if err != nil || responseStatus(respJobNum) != 404 {
		t.Fatalf("SEC-008: Expected 404 for non-existent numeric job ID, got %d (err: %v)", responseStatus(respJobNum), err)
	}

	reqJobSlug := httptest.NewRequest("GET", "/api/jobs/non-existent-slug", nil)
	reqJobSlug.Header.Set("X-Admin-Gateway-Secret", "test-gateway-secret-at-least-32-bytes")
	respJobSlug, err := app.Test(reqJobSlug, -1)
	if err != nil || responseStatus(respJobSlug) != 404 {
		t.Fatalf("SEC-008: Expected 404 for non-existent slug, got %d (err: %v)", responseStatus(respJobSlug), err)
	}

	// 2. SEC-010: Verify Contact Email Validation (RFC 5322)
	invalidContactBody, _ := json.Marshal(map[string]string{
		"name":    "Attacker",
		"email":   "not-an-email",
		"subject": "Inquiry",
		"message": "Testing injection",
	})
	reqInvalidEmail := httptest.NewRequest("POST", "/api/contact", bytes.NewReader(invalidContactBody))
	reqInvalidEmail.Header.Set("X-Admin-Gateway-Secret", "test-gateway-secret-at-least-32-bytes")
	reqInvalidEmail.Header.Set("Content-Type", "application/json")
	respInvalidEmail, _ := app.Test(reqInvalidEmail, -1)
	if responseStatus(respInvalidEmail) != 400 {
		t.Fatalf("SEC-010: Expected 400 Bad Request for invalid email format, got %d", responseStatus(respInvalidEmail))
	}

	validContactBody, _ := json.Marshal(map[string]string{
		"name":    "Pertamina Partner",
		"email":   "partner@pertamina.com",
		"subject": "Kerjasama Energi Bersih",
		"message": "Kami berminat berkolaborasi dalam proyek energi baru terbarukan.",
	})
	reqValidEmail := httptest.NewRequest("POST", "/api/contact", bytes.NewReader(validContactBody))
	reqValidEmail.Header.Set("X-Admin-Gateway-Secret", "test-gateway-secret-at-least-32-bytes")
	reqValidEmail.Header.Set("Content-Type", "application/json")
	respValidEmail, _ := app.Test(reqValidEmail, -1)
	if responseStatus(respValidEmail) != 201 {
		t.Fatalf("SEC-010: Expected 201 Created for valid email, got %d", responseStatus(respValidEmail))
	}

	// 3. SEC-012: Verify Content Key Validation (Regex ^[a-z0-9_]{2,80}$)
	// Login as admin first
	loginBody, _ := json.Marshal(map[string]string{
		"username": "admin",
		"password": "admin123",
	})
	reqLogin := httptest.NewRequest("POST", "/api/auth/login", bytes.NewReader(loginBody))
	reqLogin.Header.Set("X-Admin-Gateway-Secret", "test-gateway-secret-at-least-32-bytes")
	reqLogin.Header.Set("Content-Type", "application/json")
	respLogin, _ := app.Test(reqLogin, -1)
	var loginData struct {
		Token string `json:"token"`
	}
	_ = json.NewDecoder(respLogin.Body).Decode(&loginData)
	token := loginData.Token

	// Invalid key with spaces and special characters
	invalidKeyBody, _ := json.Marshal(map[string]string{
		"key":   "invalid key with spaces!#$",
		"value": "some test value",
	})
	reqInvalidKey := httptest.NewRequest("POST", "/api/admin/content", bytes.NewReader(invalidKeyBody))
	reqInvalidKey.Header.Set("X-Admin-Gateway-Secret", "test-gateway-secret-at-least-32-bytes")
	reqInvalidKey.Header.Set("Content-Type", "application/json")
	reqInvalidKey.Header.Set("Authorization", "Bearer "+token)
	respInvalidKey, _ := app.Test(reqInvalidKey, -1)
	if responseStatus(respInvalidKey) != 400 {
		t.Fatalf("SEC-012: Expected 400 for key with invalid regex, got %d", responseStatus(respInvalidKey))
	}

	// 4. SEC-013: Verify Audit Logs Endpoint
	reqAudit := httptest.NewRequest("GET", "/api/admin/audit-logs", nil)
	reqAudit.Header.Set("X-Admin-Gateway-Secret", "test-gateway-secret-at-least-32-bytes")
	reqAudit.Header.Set("Authorization", "Bearer "+token)
	respAudit, _ := app.Test(reqAudit, -1)
	if responseStatus(respAudit) != 200 {
		t.Fatalf("SEC-013: Expected 200 OK for /api/admin/audit-logs, got %d", responseStatus(respAudit))
	}

	// 5. SEC-014: Verify Logout Token Revocation (Session Invalidation)
	// Verify current token works
	reqMeBefore := httptest.NewRequest("GET", "/api/admin/me", nil)
	reqMeBefore.Header.Set("X-Admin-Gateway-Secret", "test-gateway-secret-at-least-32-bytes")
	reqMeBefore.Header.Set("Authorization", "Bearer "+token)
	respMeBefore, _ := app.Test(reqMeBefore, -1)
	if responseStatus(respMeBefore) != 200 {
		t.Fatalf("Expected 200 OK before logout, got %d", responseStatus(respMeBefore))
	}

	// Execute Logout
	reqLogout := httptest.NewRequest("POST", "/api/admin/logout", nil)
	reqLogout.Header.Set("X-Admin-Gateway-Secret", "test-gateway-secret-at-least-32-bytes")
	reqLogout.Header.Set("Authorization", "Bearer "+token)
	respLogout, _ := app.Test(reqLogout, -1)
	if responseStatus(respLogout) != 200 {
		t.Fatalf("SEC-014: Expected 200 OK for logout, got %d", responseStatus(respLogout))
	}

	// Verify token is now REVOKED
	reqMeAfter := httptest.NewRequest("GET", "/api/admin/me", nil)
	reqMeAfter.Header.Set("X-Admin-Gateway-Secret", "test-gateway-secret-at-least-32-bytes")
	reqMeAfter.Header.Set("Authorization", "Bearer "+token)
	respMeAfter, _ := app.Test(reqMeAfter, -1)
	if responseStatus(respMeAfter) != 401 {
		t.Fatalf("SEC-014: Expected 401 Unauthorized for revoked token, got %d", responseStatus(respMeAfter))
	}

	// 6. Test Non-numeric ID validation on Update/Delete
	reqLogin2 := httptest.NewRequest("POST", "/api/auth/login", bytes.NewReader(loginBody))
	reqLogin2.Header.Set("X-Admin-Gateway-Secret", "test-gateway-secret-at-least-32-bytes")
	reqLogin2.Header.Set("Content-Type", "application/json")
	respLogin2, _ := app.Test(reqLogin2, -1)
	var loginData2 struct {
		Token string `json:"token"`
	}
	_ = json.NewDecoder(respLogin2.Body).Decode(&loginData2)
	newToken := loginData2.Token

	reqInvalidID := httptest.NewRequest("DELETE", "/api/admin/events/not-a-number", nil)
	reqInvalidID.Header.Set("X-Admin-Gateway-Secret", "test-gateway-secret-at-least-32-bytes")
	reqInvalidID.Header.Set("Authorization", "Bearer "+newToken)
	respInvalidID, _ := app.Test(reqInvalidID, -1)
	if responseStatus(respInvalidID) != 400 {
		t.Fatalf("Expected 400 Bad Request for non-numeric event ID, got %d", responseStatus(respInvalidID))
	}

	reqInvalidJobID := httptest.NewRequest("DELETE", "/api/admin/jobs/invalid-id-xyz", nil)
	reqInvalidJobID.Header.Set("X-Admin-Gateway-Secret", "test-gateway-secret-at-least-32-bytes")
	reqInvalidJobID.Header.Set("Authorization", "Bearer "+newToken)
	respInvalidJobID, _ := app.Test(reqInvalidJobID, -1)
	if responseStatus(respInvalidJobID) != 400 {
		t.Fatalf("Expected 400 Bad Request for non-numeric job ID, got %d", responseStatus(respInvalidJobID))
	}

	// 7. Test Registration Password Policy (<8 characters rejected)
	weakRegisterBody, _ := json.Marshal(map[string]string{
		"username": "newtestadmin",
		"password": "123",
	})
	reqWeakRegister := httptest.NewRequest("POST", "/api/admin/register", bytes.NewReader(weakRegisterBody))
	reqWeakRegister.Header.Set("X-Admin-Gateway-Secret", "test-gateway-secret-at-least-32-bytes")
	reqWeakRegister.Header.Set("Content-Type", "application/json")
	reqWeakRegister.Header.Set("Authorization", "Bearer "+newToken)
	respWeakRegister, _ := app.Test(reqWeakRegister, -1)
	if responseStatus(respWeakRegister) != 400 {
		t.Fatalf("Expected 400 Bad Request for weak password during registration, got %d", responseStatus(respWeakRegister))
	}

	// 8. Test SEC-JWT: Production Secret Enforcement (OWASP A02 Cryptographic Failures)
	origAppEnv := os.Getenv("APP_ENV")
	origJwtSecret := os.Getenv("JWT_SECRET")
	defer func() {
		_ = os.Setenv("APP_ENV", origAppEnv)
		_ = os.Setenv("JWT_SECRET", origJwtSecret)
	}()

	_ = os.Setenv("APP_ENV", "production")
	_ = os.Setenv("JWT_SECRET", "")

	func() {
		defer func() {
			r := recover()
			if r == nil {
				t.Fatalf("Expected panic when generating token in production with empty JWT_SECRET, but did not panic")
			}
		}()
		_, _ = utils.GenerateToken(1, "admin", "admin", 1)
	}()
}

func responseStatus(response *http.Response) int {
	if response == nil {
		return 0
	}
	return response.StatusCode
}
