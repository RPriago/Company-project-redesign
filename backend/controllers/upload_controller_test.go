package controllers

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"github.com/gofiber/fiber/v2"
	"image"
	"image/png"
	"mime/multipart"
	"net/http/httptest"
	"testing"
)

func TestUploadValidationAndProviderOutcomes(t *testing.T) {
	var valid bytes.Buffer
	if err := png.Encode(&valid, image.NewRGBA(image.Rect(0, 0, 1, 1))); err != nil {
		t.Fatal(err)
	}
	old := uploadToProvider
	defer func() { uploadToProvider = old }()
	calls := 0
	uploadToProvider = func(ctx context.Context, data []byte, id string) (string, error) {
		calls++
		if !bytes.Equal(data, valid.Bytes()) || id == "" {
			t.Fatal("unexpected upload payload")
		}
		return "https://res.cloudinary.com/test/image/upload/image.png", nil
	}
	app := fiber.New(fiber.Config{BodyLimit: 6 * 1024 * 1024})
	app.Post("/upload", UploadImage)
	request := func(name string, data []byte) (int, map[string]any) {
		t.Helper()
		var body bytes.Buffer
		writer := multipart.NewWriter(&body)
		part, err := writer.CreateFormFile("image", name)
		if err != nil {
			t.Fatal(err)
		}
		if _, err := part.Write(data); err != nil {
			t.Fatal(err)
		}
		writer.Close()
		req := httptest.NewRequest("POST", "/upload", &body)
		req.Header.Set("Content-Type", writer.FormDataContentType())
		res, err := app.Test(req)
		if err != nil {
			t.Fatal(err)
		}
		defer res.Body.Close()
		var payload map[string]any
		if err := json.NewDecoder(res.Body).Decode(&payload); err != nil {
			t.Fatal(err)
		}
		return res.StatusCode, payload
	}
	t.Setenv("CLOUDINARY_URL", "cloudinary://test:test@test")
	for _, sample := range []struct {
		name string
		data []byte
	}{
		{"fake.png", []byte("not an image")}, {"image.jpg", valid.Bytes()},
		{"image.svg", valid.Bytes()}, {"image.png", bytes.Repeat([]byte{0}, maxImageBytes+1)},
	} {
		if code, _ := request(sample.name, sample.data); code != 400 {
			t.Fatalf("expected validation error for %s, got %d", sample.name, code)
		}
	}
	if calls != 0 {
		t.Fatal("invalid content reached provider")
	}
	if code, data := request("image.png", valid.Bytes()); code != 200 || data["success"] != true || data["filename"] == "" || data["url"] == "" {
		t.Fatalf("upload contract: %d %v", code, data)
	}
	uploadToProvider = func(context.Context, []byte, string) (string, error) { return "", errors.New("provider offline") }
	if code, _ := request("image.png", valid.Bytes()); code != 502 {
		t.Fatalf("expected provider failure, got %d", code)
	}
	t.Setenv("CLOUDINARY_URL", "")
	if code, _ := request("image.png", valid.Bytes()); code != 503 {
		t.Fatalf("expected missing-storage failure, got %d", code)
	}
}
