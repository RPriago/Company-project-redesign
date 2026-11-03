package controllers

import (
	"bytes"
	"context"
	"fmt"
	"image"
	_ "image/gif"
	_ "image/jpeg"
	_ "image/png"
	"io"
	"log"
	"net/url"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
	"github.com/gofiber/fiber/v2"
	_ "golang.org/x/image/webp"
)

const maxImageBytes = 5 * 1024 * 1024

// A small boundary permits provider failure/success verification without real uploads.
var uploadToProvider = uploadCloudinary

func uploadCloudinary(ctx context.Context, data []byte, publicID string) (string, error) {
	client, err := cloudinary.NewFromURL(strings.TrimSpace(os.Getenv("CLOUDINARY_URL")))
	if err != nil {
		return "", err
	}
	result, err := client.Upload.Upload(ctx, bytes.NewReader(data), uploader.UploadParams{
		PublicID: publicID, ResourceType: "image", Folder: "petronesia",
	})
	if err != nil {
		return "", err
	}
	if result == nil {
		return "", fmt.Errorf("provider returned no image")
	}
	return result.SecureURL, nil
}

// SDK errors can contain configuration URLs or credentials. Only log a redacted,
// bounded single line; never send provider diagnostics back to the browser.
func safeUploadError(err error) string {
	message := err.Error()
	configuration := strings.TrimSpace(os.Getenv("CLOUDINARY_URL"))
	if configuration != "" {
		message = strings.ReplaceAll(message, configuration, "[redacted]")
		if parsed, parseErr := url.Parse(configuration); parseErr == nil && parsed.User != nil {
			credentials := []string{parsed.User.Username()}
			if password, ok := parsed.User.Password(); ok {
				credentials = append(credentials, password)
			}
			for _, credential := range credentials {
				if credential != "" {
					message = strings.ReplaceAll(message, credential, "[redacted]")
					message = strings.ReplaceAll(message, url.QueryEscape(credential), "[redacted]")
				}
			}
		}
	}
	message = strings.Join(strings.Fields(message), " ")
	if len(message) > 1000 {
		message = message[:1000] + "..."
	}
	return message
}

// POST /api/admin/upload. Image bytes go directly to Cloudinary, never local disk.
func UploadImage(c *fiber.Ctx) error {
	fail := func(status int, message string) error {
		return c.Status(status).JSON(fiber.Map{"success": false, "message": message})
	}
	file, err := c.FormFile("image")
	if err != nil {
		return fail(400, "File gambar tidak ditemukan (field 'image')")
	}
	ext := strings.ToLower(filepath.Ext(file.Filename))
	formats := map[string]string{".jpg": "jpeg", ".jpeg": "jpeg", ".png": "png", ".gif": "gif", ".webp": "webp"}
	expected, supported := formats[ext]
	if !supported {
		return fail(400, "Gunakan JPG, PNG, WEBP, atau GIF")
	}
	if file.Size > maxImageBytes {
		return fail(400, "Ukuran file maksimal 5MB")
	}
	stream, err := file.Open()
	if err != nil {
		return fail(400, "File gambar tidak dapat dibaca")
	}
	defer stream.Close()
	data, err := io.ReadAll(io.LimitReader(stream, maxImageBytes+1))
	if err != nil || len(data) > maxImageBytes {
		return fail(400, "Ukuran file maksimal 5MB")
	}
	cfg, format, err := image.DecodeConfig(bytes.NewReader(data))
	if err != nil || format != expected || cfg.Width < 1 || cfg.Height < 1 || int64(cfg.Width)*int64(cfg.Height) > 40000000 {
		return fail(400, "Isi file bukan gambar valid atau dimensi terlalu besar")
	}
	if _, _, err := image.Decode(bytes.NewReader(data)); err != nil {
		return fail(400, "Gambar rusak atau tidak dapat dibaca")
	}
	if strings.TrimSpace(os.Getenv("CLOUDINARY_URL")) == "" {
		return fail(503, "Penyimpanan gambar belum dikonfigurasi")
	}
	filename := fmt.Sprintf("petronesia_%d", time.Now().UnixNano())
	ctx, cancel := context.WithTimeout(c.UserContext(), 30*time.Second)
	defer cancel()
	secureURL, err := uploadToProvider(ctx, data, filename)
	if err != nil {
		log.Printf("image upload failed provider=cloudinary detail=%q", safeUploadError(err))
		return fail(502, "Penyimpanan gambar tidak tersedia. Silakan coba lagi.")
	}
	parsed, parseErr := url.Parse(secureURL)
	if parseErr != nil || parsed.Scheme != "https" || parsed.Host == "" {
		log.Print("image upload failed provider=cloudinary detail=invalid_secure_url")
		return fail(502, "Penyimpanan gambar tidak tersedia. Silakan coba lagi.")
	}
	return c.JSON(fiber.Map{"success": true, "message": "Gambar berhasil diunggah", "url": secureURL, "filename": filename + ext})
}
