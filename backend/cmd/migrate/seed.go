package main

// Legacy demo seeding is intentionally available only in this local utility.
import (
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
	"log"
	"os"
	"petronesia-backend/models"
	"time"
)

func SeedData(db *gorm.DB) {
	// 1. Seed Admin
	var adminCount int64
	db.Model(&models.Admin{}).Count(&adminCount)
	if adminCount == 0 {
		initialPass := os.Getenv("ADMIN_INITIAL_PASSWORD")
		if initialPass == "" {
			initialPass = "admin123"
		}
		hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(initialPass), bcrypt.DefaultCost)
		defaultAdmin := models.Admin{
			Username: "admin",
			Password: string(hashedPassword),
			Name:     "Administrator Petronesia",
			Role:     "superadmin",
		}
		db.Create(&defaultAdmin)
		log.Println("🌱 Seed Admin dibuat: Username = 'admin'")
	}

	// 2. Seed Events/News
	var eventCount int64
	db.Model(&models.Event{}).Count(&eventCount)
	if eventCount == 0 {
		now := time.Now()
		publishedAt := now.Add(-48 * time.Hour)

		seedEvents := []models.Event{
			{
				Title:       "Pertamina Pimpin Akselerasi Dekarbonisasi Menuju Net Zero Emission 2060 Lewat Teknologi CCUS",
				Slug:        "pertamina-akselerasi-dekarbonisasi-net-zero-2060-ccus",
				Excerpt:     "Langkah konkret transisi energi hijau nasional untuk memperkuat pasokan listrik bersih berbasis panas bumi bagi 180.000 rumah tangga.",
				Description: "Sebagai wujud komitmen nyata mendukung target Net Zero Emission Indonesia tahun 2060, PT Pertamina (Persero) secara resmi memperluas implementasi Carbon Capture, Utilization, and Storage (CCUS) di Lapangan Jatibarang dan Sukowati.\n\nProyek strategis nasional ini ditargetkan mereduksi emisi karbon hingga jutaan ton CO2 per tahun sekaligus meningkatkan lifting migas nasional.",
				Category:    "Transisi Energi & ESG",
				EventDate:   now.Add(-2 * 24 * time.Hour),
				Location:    "Jakarta & Jawa Barat",
				ImageURL:    "/images/sustainability_ccus_plant.jpg",
				IsPublished: true,
				Views:       1420,
				PublishedAt: &publishedAt,
				CreatedBy:   1,
			},
			{
				Title:       "Subholding Upstream Pertamina Catat Produksi Migas 1,04 Juta BOEPD Topang 68% Lifting Nasional",
				Slug:        "subholding-upstream-pertamina-catat-produksi-migas-1-04-juta-boepd",
				Excerpt:     "Penerapan teknologi Enhanced Oil Recovery (EOR) mutakhir di Blok Rokan berhasil mendorong produksi minyak mentah melampaui target tahunan.",
				Description: "PT Pertamina Hulu Energi (PHE) membukukan capaian produksi minyak dan gas bumi terintegrasi sebesar 1,04 juta BOEPD menopang 68% pasokan lifting minyak nasional.",
				Category:    "Operasional Hulu",
				EventDate:   now.Add(-5 * 24 * time.Hour),
				Location:    "Wilayah Kerja Rokan, Riau",
				ImageURL:    "/images/offshore_rig_pertamina.jpg",
				IsPublished: true,
				Views:       980,
				PublishedAt: &publishedAt,
				CreatedBy:   1,
			},
			{
				Title:       "Kilang Pertamina Siap Pasok Biofuel B40 dan Perluas Produksi Bioavtur Ramah Lingkungan SAF",
				Slug:        "kilang-pertamina-pasok-biofuel-b40-perluas-bioavtur-saf",
				Excerpt:     "Fasilitas Green Refinery Cilacap dan Balongan berhasil mengolah feedstock nabati menjadi bahan bakar ramah lingkungan berstandar aviasi dan otomotif dunia.",
				Description: "PT Kilang Pertamina Internasional (KPI) menegaskan kesiapan penuh infrastruktur pengolahan kilang dalam mendukung mandatori Biodiesel B40 nasional serta penyediaan Sustainable Aviation Fuel (SAF).",
				Category:    "Kilang & Petrokimia",
				EventDate:   now.Add(-8 * 24 * time.Hour),
				Location:    "Cilacap & Balongan",
				ImageURL:    "/images/refinery_unit_balongan.jpg",
				IsPublished: true,
				Views:       2150,
				PublishedAt: &publishedAt,
				CreatedBy:   1,
			},
			{
				Title:       "Pertamina Geothermal Energy (PGE) Kembangkan Potensi Panas Bumi Menuju Kapasitas 3 GW",
				Slug:        "pertamina-geothermal-energy-pge-kembangkan-potensi-panas-bumi-3-gw",
				Excerpt:     "Portofolio panas bumi terbesar di Indonesia mempercepat transisi energi bersih dengan ekspansi di Kamojang, Ulubelu, Lahendong, dan Lumut Balai.",
				Description: "PT Pertamina Geothermal Energy Tbk (PGE) terus mengoptimalkan aset panas bumi di 13 wilayah kerja di Indonesia untuk menjadi jangkar dekarbonisasi ketenagalistrikan nasional.",
				Category:    "Energi Baru Terbarukan",
				EventDate:   now.Add(-12 * 24 * time.Hour),
				Location:    "Kamojang, Jawa Barat",
				ImageURL:    "/images/geothermal_plant_kamojang.jpg",
				IsPublished: true,
				Views:       1630,
				PublishedAt: &publishedAt,
				CreatedBy:   1,
			},
			{
				Title:       "Perluas Akses Energi Adil, Pertamina Realisasikan Lebih dari 500 Titik BBM Satu Harga di Wilayah 3T",
				Slug:        "pertamina-realisasikan-500-titik-bbm-satu-harga-wilayah-3t",
				Excerpt:     "Komitmen pemerataan energi di pelosok Nusantara dari Sabang sampai Merauke, memastikan masyarakat perbatasan menikmati harga BBM yang setara.",
				Description: "PT Pertamina Patra Niaga telah mengoperasikan lebih dari 500 titik penyalur BBM Satu Harga di wilayah Tertinggal, Terdepan, dan Terluar (3T) di seluruh kepulauan Indonesia.",
				Category:    "Hilir & Ritel",
				EventDate:   now.Add(-18 * 24 * time.Hour),
				Location:    "Kepulauan Maluku & Papua",
				ImageURL:    "/images/spbu_pertamina_modern.jpg",
				IsPublished: true,
				Views:       840,
				PublishedAt: &publishedAt,
				CreatedBy:   1,
			},
			{
				Title:       "Program Desa Energi Berdikari (DEB) Pertamina Berdayakan Ratusan Komunitas dengan Listrik Bersih",
				Slug:        "program-desa-energi-berdikari-pertamina-listrik-bersih",
				Excerpt:     "Inisiatif TJSL memberdayakan masyarakat desa memanfaatkan potensi panel surya, biogas, dan mikrohidro untuk menggerakkan perekonomian lokal secara mandiri.",
				Description: "Program TJSL unggulan 'Desa Energi Berdikari' (DEB) telah menjangkau ratusan desa di seluruh Indonesia untuk mendorong kemandirian energi dan ekonomi pedesaan.",
				Category:    "TJSL & Berkelanjutan",
				EventDate:   now.Add(-22 * 24 * time.Hour),
				Location:    "Nusantara",
				ImageURL:    "/images/desa_energi_berdikari.jpg",
				IsPublished: true,
				Views:       1290,
				PublishedAt: &publishedAt,
				CreatedBy:   1,
			},
		}

		for _, ev := range seedEvents {
			db.Create(&ev)
		}
		log.Printf("🌱 Berhasil menabur %d data berita & event awal Petronesia!", len(seedEvents))
	}

	// 3. Seed Job Vacancies
	var jobCount int64
	db.Model(&models.JobVacancy{}).Count(&jobCount)
	if jobCount == 0 {
		seedJobs := []models.JobVacancy{
			{
				Title:        "Senior Reservoir Geologist",
				Slug:         "senior-reservoir-geologist",
				Department:   "Eksplorasi & Hulu",
				Location:     "Balikpapan, Kalimantan Timur",
				Type:         "Full-time",
				Experience:   "5+ Tahun",
				Description:  "Memimpin pemodelan geologi 3D reservoir migas matang, evaluasi subsurface, dan perencanaan sumur pengembangan lapangan lepas pantai.",
				Requirements: "S1/S2 Teknik Geologi atau Geofisika. Menguasai software pemodelan Petrel atau sejenisnya. Pengalaman min. 5 tahun di industri eksplorasi migas.",
				Deadline:     "31 Desember 2026",
				IsActive:     true,
			},
			{
				Title:        "Renewable Energy Project Manager (Geothermal)",
				Slug:         "renewable-energy-project-manager",
				Department:   "Energi Baru Terbarukan (EBT)",
				Location:     "Bandung / Proyek Kamojang",
				Type:         "Full-time",
				Experience:   "4 - 6 Tahun",
				Description:  "Mengelola eksekusi EPC proyek pembangkit listrik tenaga panas bumi, koordinasi stakeholder, pemantauan timeline dan keselamatan kerja.",
				Requirements: "S1 Teknik Mesin / Elektro / Energi Terbarukan. Sertifikasi PMP diutamakan. Pengalaman proyek konstruksi pembangkit min. 4 tahun.",
				Deadline:     "15 November 2026",
				IsActive:     true,
			},
			{
				Title:        "HSE Specialist (Health, Safety & Environment)",
				Slug:         "hse-specialist-refinery",
				Department:   "Keselamatan Kerja & HSE",
				Location:     "Balongan, Jawa Barat",
				Type:         "Full-time",
				Experience:   "3 - 5 Tahun",
				Description:  "Mengawasi kepatuhan standar K3 migas, investigasi insiden, audit SMK3, dan memimpin program budaya keselamatan Zero Accident di lingkungan kilang.",
				Requirements: "S1 Kesehatan Masyarakat / Teknik Lingkungan. Sertifikasi Ahli K3 Umum & K3 Migas Kemnaker/BNSP. Teliti dan berintegritas tinggi.",
				Deadline:     "20 Desember 2026",
				IsActive:     true,
			},
			{
				Title:        "Senior Fullstack Software Engineer (IoT & Smart Grid)",
				Slug:         "senior-fullstack-software-engineer",
				Department:   "Teknologi Informasi & Digital",
				Location:     "Jakarta Pusat (Hybrid)",
				Type:         "Full-time",
				Experience:   "3+ Tahun",
				Description:  "Membangun arsitektur platform IoT monitoring real-time untuk jaringan smart grid, SPBU Green Hub, dan telemetri kilang berbasis Golang dan Next.js/React.",
				Requirements: "Menguasai Golang/Fiber, PostgreSQL, Next.js/TypeScript, Docker, dan event streaming (MQTT/Kafka). Portofolio nyata diutamakan.",
				Deadline:     "30 November 2026",
				IsActive:     true,
			},
			{
				Title:        "Sustainability & ESG Analyst",
				Slug:         "sustainability-esg-analyst",
				Department:   "Keberlanjutan & Hubungan Korporat",
				Location:     "Jakarta Pusat",
				Type:         "Full-time",
				Experience:   "2 - 4 Tahun",
				Description:  "Menghitung jejak karbon korporasi (Scope 1, 2, 3), menyusun laporan keberlanjutan sesuai standar GRI & ISSB, dan mengawal audit ESG tahunan.",
				Requirements: "S1 Teknik Lingkungan / Manajemen Keberlanjutan. Memahami standar GRI, TCFD, dan regulasi Nilai Ekonomi Karbon (NEK) Indonesia.",
				Deadline:     "31 Januari 2027",
				IsActive:     true,
			},
		}

		for _, j := range seedJobs {
			db.Create(&j)
		}
		log.Printf("🌱 Berhasil menabur %d data lowongan kerja awal Petronesia!", len(seedJobs))
	}

	// 4. Seed Dynamic Site Content (Images & Texts)
	var contentCount int64
	db.Model(&models.SiteContent{}).Count(&contentCount)
	if contentCount == 0 {
		now := time.Now()
		seedContents := []models.SiteContent{
			// HERO HOME
			{
				Key:       "hero_headline",
				Section:   "home_hero",
				Label:     "Judul Utama Hero (H1)",
				Type:      "text",
				Value:     "Energi Berkelanjutan Menggerakkan Kemajuan Bangsa",
				UpdatedAt: now,
			},
			{
				Key:       "hero_subheadline",
				Section:   "home_hero",
				Label:     "Subjudul / Deskripsi Hero",
				Type:      "textarea",
				Value:     "PT Petronesia Energi Nusantara menghadirkan inovasi eksplorasi hulu migas, keandalan distribusi energi hilir, dan akselerasi energi baru terbarukan di seluruh penjuru negeri.",
				UpdatedAt: now,
			},
			{
				Key:       "hero_badge",
				Section:   "home_hero",
				Label:     "Teks Badge Hero",
				Type:      "text",
				Value:     "Inovasi Energi Masa Depan",
				UpdatedAt: now,
			},
			{
				Key:       "hero_bg_image",
				Section:   "home_hero",
				Label:     "Foto Background Hero Utama",
				Type:      "image",
				Value:     "/images/pertamina_hero_refinery.jpg",
				UpdatedAt: now,
			},
			{
				Key:       "hero_cta_text",
				Section:   "home_hero",
				Label:     "Teks Tombol Utama Hero",
				Type:      "text",
				Value:     "Jelajahi Lini Bisnis",
				UpdatedAt: now,
			},
			{
				Key:       "hero_secondary_text",
				Section:   "home_hero",
				Label:     "Teks Tombol Sekunder Hero",
				Type:      "text",
				Value:     "Tentang Pertamina",
				UpdatedAt: now,
			},

			// INTRO & SUMMARY
			{
				Key:       "intro_eyebrow",
				Section:   "home_intro",
				Label:     "Badge Eyebrow Intro",
				Type:      "text",
				Value:     "Pilar Ketahanan Nasional",
				UpdatedAt: now,
			},
			{
				Key:       "intro_title",
				Section:   "home_intro",
				Label:     "Judul Seksi Intro (H2)",
				Type:      "text",
				Value:     "Menjawab Tantangan Kebutuhan Energi dengan Standar Keunggulan Tertinggi",
				UpdatedAt: now,
			},
			{
				Key:       "intro_desc",
				Section:   "home_intro",
				Label:     "Paragraf Deskripsi Intro",
				Type:      "textarea",
				Value:     "Dengan integritas, teknologi mutakhir, dan komitmen keselamatan kerja tanpa kompromi, kami memastikan setiap tetes energi bertransformasi menjadi pertumbuhan ekonomi yang merata dan berkelanjutan bagi Indonesia.",
				UpdatedAt: now,
			},

			// PROJECT GALLERY (Real project photos)
			{
				Key:       "gallery_img_1",
				Section:   "home_gallery",
				Label:     "Galeri Foto 1 (Offshore Rig)",
				Type:      "image",
				Value:     "/images/offshore_rig_pertamina.jpg",
				UpdatedAt: now,
			},
			{
				Key:       "gallery_label_1",
				Section:   "home_gallery",
				Label:     "Keterangan Galeri Foto 1",
				Type:      "text",
				Value:     "Offshore Rig Hulu Lepas Pantai (PHE)",
				UpdatedAt: now,
			},
			{
				Key:       "gallery_img_2",
				Section:   "home_gallery",
				Label:     "Galeri Foto 2 (Geothermal)",
				Type:      "image",
				Value:     "/images/geothermal_plant_kamojang.jpg",
				UpdatedAt: now,
			},
			{
				Key:       "gallery_label_2",
				Section:   "home_gallery",
				Label:     "Keterangan Galeri Foto 2",
				Type:      "text",
				Value:     "PLTP Kamojang Geothermal 120 MW (PGE)",
				UpdatedAt: now,
			},
			{
				Key:       "gallery_img_3",
				Section:   "home_gallery",
				Label:     "Galeri Foto 3 (Green SPBU)",
				Type:      "image",
				Value:     "/images/spbu_pertamina_modern.jpg",
				UpdatedAt: now,
			},
			{
				Key:       "gallery_label_3",
				Section:   "home_gallery",
				Label:     "Keterangan Galeri Foto 3",
				Type:      "text",
				Value:     "SPBU Green Energy Hub & Fast Charging (Patra Niaga)",
				UpdatedAt: now,
			},
			{
				Key:       "gallery_img_4",
				Section:   "home_gallery",
				Label:     "Galeri Foto 4 (Smart Refinery)",
				Type:      "image",
				Value:     "/images/refinery_unit_balongan.jpg",
				UpdatedAt: now,
			},
			{
				Key:       "gallery_label_4",
				Section:   "home_gallery",
				Label:     "Keterangan Galeri Foto 4",
				Type:      "text",
				Value:     "Refinery Unit Balongan Modern Plant (KPI)",
				UpdatedAt: now,
			},

			// SINGLE DARK BLOCK STATEMENT (#161B22)
			{
				Key:       "dark_block_badge",
				Section:   "home_dark_block",
				Label:     "Badge Pernyataan Kunci (Blok Gelap)",
				Type:      "text",
				Value:     "Komitmen Dekarbonisasi",
				UpdatedAt: now,
			},
			{
				Key:       "dark_block_title",
				Section:   "home_dark_block",
				Label:     "Judul Utama Blok Gelap (H2)",
				Type:      "text",
				Value:     "Menuju Net Zero Emission 2060 dengan Transisi Energi Terukur",
				UpdatedAt: now,
			},
			{
				Key:       "dark_block_desc",
				Section:   "home_dark_block",
				Label:     "Deskripsi Blok Gelap",
				Type:      "textarea",
				Value:     "Kami menginvestasikan lebih dari 35% belanja modal tahunan untuk pengembangan portofolio energi rendah karbon, penangkapan emisi karbon (CCUS), serta efisiensi operasional menyeluruh.",
				UpdatedAt: now,
			},
			{
				Key:       "dark_block_image",
				Section:   "home_dark_block",
				Label:     "Foto Utama di Dalam Blok Gelap",
				Type:      "image",
				Value:     "/images/sustainability_ccus_plant.jpg",
				UpdatedAt: now,
			},
			{
				Key:       "dark_block_stat_1_val",
				Section:   "home_dark_block",
				Label:     "Statistik 1 Angka",
				Type:      "text",
				Value:     "35%",
				UpdatedAt: now,
			},
			{
				Key:       "dark_block_stat_1_lbl",
				Section:   "home_dark_block",
				Label:     "Statistik 1 Keterangan",
				Type:      "text",
				Value:     "Alokasi Capex Portofolio Hijau",
				UpdatedAt: now,
			},
			{
				Key:       "dark_block_stat_2_val",
				Section:   "home_dark_block",
				Label:     "Statistik 2 Angka",
				Type:      "text",
				Value:     "650K+",
				UpdatedAt: now,
			},
			{
				Key:       "dark_block_stat_2_lbl",
				Section:   "home_dark_block",
				Label:     "Statistik 2 Keterangan",
				Type:      "text",
				Value:     "Ton CO2 Mereduksi per Tahun",
				UpdatedAt: now,
			},
			{
				Key:       "dark_block_stat_3_val",
				Section:   "home_dark_block",
				Label:     "Statistik 3 Angka",
				Type:      "text",
				Value:     "100%",
				UpdatedAt: now,
			},
			{
				Key:       "dark_block_stat_3_lbl",
				Section:   "home_dark_block",
				Label:     "Statistik 3 Keterangan",
				Type:      "text",
				Value:     "Sertifikasi Standar ISO 14001",
				UpdatedAt: now,
			},

			// BUSINESS UNITS & SERVICES
			{
				Key:       "upstream_title",
				Section:   "home_services",
				Label:     "Kartu 1: Judul Bisnis Hulu",
				Type:      "text",
				Value:     "Eksplorasi & Produksi Hulu",
				UpdatedAt: now,
			},
			{
				Key:       "upstream_desc",
				Section:   "home_services",
				Label:     "Kartu 1: Deskripsi Bisnis Hulu",
				Type:      "textarea",
				Value:     "Eksplorasi dan lifting migas lepas pantai serta darat dengan teknologi Enhanced Oil Recovery (EOR) presisi tinggi dan zero fatal accident.",
				UpdatedAt: now,
			},
			{
				Key:       "upstream_img",
				Section:   "home_services",
				Label:     "Kartu 1: Gambar Bisnis Hulu",
				Type:      "image",
				Value:     "/images/offshore_rig_pertamina.jpg",
				UpdatedAt: now,
			},
			{
				Key:       "downstream_title",
				Section:   "home_services",
				Label:     "Kartu 2: Judul Bisnis Hilir",
				Type:      "text",
				Value:     "Pengolahan & Distribusi Hilir",
				UpdatedAt: now,
			},
			{
				Key:       "downstream_desc",
				Section:   "home_services",
				Label:     "Kartu 2: Deskripsi Bisnis Hilir",
				Type:      "textarea",
				Value:     "Jaringan kilang modern cerdas dan stasiun SPBU Green Energy Hub yang menjamin ketersediaan BBM dan listrik kendaraan di seluruh Nusantara.",
				UpdatedAt: now,
			},
			{
				Key:       "downstream_img",
				Section:   "home_services",
				Label:     "Kartu 2: Gambar Bisnis Hilir",
				Type:      "image",
				Value:     "/images/refinery_unit_balongan.jpg",
				UpdatedAt: now,
			},
			{
				Key:       "renewable_title",
				Section:   "home_services",
				Label:     "Kartu 3: Judul Energi Terbarukan",
				Type:      "text",
				Value:     "Energi Baru & Terbarukan (EBT)",
				UpdatedAt: now,
			},
			{
				Key:       "renewable_desc",
				Section:   "home_services",
				Label:     "Kartu 3: Deskripsi Energi Terbarukan",
				Type:      "textarea",
				Value:     "Pembangkit panas bumi (geothermal), solar farm skala gigawatt, dan riset bio-avtur untuk memasok energi bersih bagi industri masa depan.",
				UpdatedAt: now,
			},
			{
				Key:       "renewable_img",
				Section:   "home_services",
				Label:     "Kartu 3: Gambar Energi Terbarukan",
				Type:      "image",
				Value:     "/images/geothermal_plant_kamojang.jpg",
				UpdatedAt: now,
			},

			// LARGE RED CTA BANNER
			{
				Key:       "cta_banner_title",
				Section:   "home_cta",
				Label:     "Judul Banner Merah CTA",
				Type:      "text",
				Value:     "Siap Berkolaborasi Membangun Ketahanan Energi Bersama Kami?",
				UpdatedAt: now,
			},
			{
				Key:       "cta_banner_subtitle",
				Section:   "home_cta",
				Label:     "Subjudul Banner Merah CTA",
				Type:      "textarea",
				Value:     "Diskusikan kemitraan rantai pasok industri, peluang investasi hijau, atau pengadaan energi terintegrasi dengan tim eksekutif Petronesia.",
				UpdatedAt: now,
			},
			{
				Key:       "cta_banner_button_text",
				Section:   "home_cta",
				Label:     "Teks Tombol Banner Merah CTA",
				Type:      "text",
				Value:     "Hubungi Tim Kemitraan Kami",
				UpdatedAt: now,
			},

			// ABOUT PAGE ASSETS
			{
				Key:       "about_hero_title",
				Section:   "about_page",
				Label:     "Tentang Kami: Judul Utama",
				Type:      "text",
				Value:     "Dedikasi Tanpa Henti untuk Kemandirian Energi Indonesia",
				UpdatedAt: now,
			},
			{
				Key:       "about_hero_desc",
				Section:   "about_page",
				Label:     "Tentang Kami: Paragraf Utama",
				Type:      "textarea",
				Value:     "Lebih dari tiga dekade mengabdi sebagai katalisator pertumbuhan industri energi nasional yang tangguh, adaptif, dan berwawasan masa depan.",
				UpdatedAt: now,
			},
			{
				Key:       "about_hero_img",
				Section:   "about_page",
				Label:     "Tentang Kami: Foto Utama",
				Type:      "image",
				Value:     "/images/grha_pertamina_jakarta.jpg",
				UpdatedAt: now,
			},
			{
				Key:       "about_vision",
				Section:   "about_page",
				Label:     "Visi Perusahaan",
				Type:      "textarea",
				Value:     "Menjadi perusahaan energi terdepan di Asia Tenggara yang memimpin inovasi rendah karbon dan kedaulatan sumber daya nasional.",
				UpdatedAt: now,
			},
			{
				Key:       "about_mission",
				Section:   "about_page",
				Label:     "Misi Perusahaan",
				Type:      "textarea",
				Value:     "1. Menyediakan pasokan energi terpercaya dengan efisiensi tinggi.\n2. Mengakselerasi diversifikasi portofolio energi hijau.\n3. Memberdayakan masyarakat dan menjaga kelestarian lingkungan secara berkelanjutan.",
				UpdatedAt: now,
			},
		}

		for _, sc := range seedContents {
			db.Create(&sc)
		}
		log.Printf("🌱 Berhasil menabur %d data konten dan media awal Petronesia!", len(seedContents))
	}

	// 5. Seed Fuel Prices (Seluruh 38 Provinsi & 2 FTZ di Indonesia)
	seedFuelPrices(db)
}

func seedFuelPrices(db *gorm.DB) {
	var count int64
	db.Model(&models.FuelPrice{}).Count(&count)
	if count > 0 {
		return
	}

	type RegionDef struct {
		Province  string
		Zone      string
		PbbkbRate string
		PbbkbTier string // "5", "7.5", "10", "batam", "sabang"
		HasGreen  bool
		HasTurbo  bool
		HasDex    bool
	}

	regions := []RegionDef{
		// Jawa & Bali (PBBKB 5%)
		{"DKI Jakarta", "Jawa & Bali", "5%", "5", true, true, true},
		{"Banten", "Jawa & Bali", "5%", "5", true, true, true},
		{"Jawa Barat", "Jawa & Bali", "5%", "5", true, true, true},
		{"Jawa Tengah", "Jawa & Bali", "5%", "5", false, true, true},
		{"D.I. Yogyakarta", "Jawa & Bali", "5%", "5", false, true, true},
		{"Jawa Timur", "Jawa & Bali", "5%", "5", true, true, true},
		{"Bali", "Jawa & Bali", "5%", "5", false, true, true},

		// Sumatera
		{"Aceh", "Sumatera", "5%", "5", false, true, true},
		{"Sumatera Utara", "Sumatera", "7.5%", "7.5", false, true, true},
		{"Sumatera Barat", "Sumatera", "7.5%", "7.5", false, true, true},
		{"Riau", "Sumatera", "10%", "10", false, true, true},
		{"Kepulauan Riau", "Sumatera", "10%", "10", false, true, true},
		{"Jambi", "Sumatera", "7.5%", "7.5", false, true, true},
		{"Bengkulu", "Sumatera", "10%", "10", false, true, true},
		{"Sumatera Selatan", "Sumatera", "7.5%", "7.5", false, true, true},
		{"Bangka Belitung", "Sumatera", "7.5%", "7.5", false, true, true},
		{"Lampung", "Sumatera", "7.5%", "7.5", false, true, true},

		// Nusa Tenggara
		{"Nusa Tenggara Barat (NTB)", "Nusa Tenggara", "5%", "5", false, true, true},
		{"Nusa Tenggara Timur (NTT)", "Nusa Tenggara", "5%", "5", false, true, true},

		// Kalimantan
		{"Kalimantan Barat", "Kalimantan", "7.5%", "7.5", false, true, true},
		{"Kalimantan Tengah", "Kalimantan", "7.5%", "7.5", false, true, true},
		{"Kalimantan Selatan", "Kalimantan", "10%", "10", false, true, true},
		{"Kalimantan Timur", "Kalimantan", "7.5%", "7.5", false, true, true},
		{"Kalimantan Utara", "Kalimantan", "7.5%", "7.5", false, true, true},

		// Sulawesi
		{"Sulawesi Utara", "Sulawesi", "7.5%", "7.5", false, true, true},
		{"Gorontalo", "Sulawesi", "7.5%", "7.5", false, true, true},
		{"Sulawesi Tengah", "Sulawesi", "7.5%", "7.5", false, true, true},
		{"Sulawesi Barat", "Sulawesi", "7.5%", "7.5", false, false, false},
		{"Sulawesi Selatan", "Sulawesi", "7.5%", "7.5", false, true, true},
		{"Sulawesi Tenggara", "Sulawesi", "7.5%", "7.5", false, true, true},

		// Maluku & Papua
		{"Maluku", "Maluku & Papua", "7.5%", "7.5", false, false, false},
		{"Maluku Utara", "Maluku & Papua", "7.5%", "7.5", false, false, false},
		{"Papua", "Maluku & Papua", "7.5%", "7.5", false, true, true},
		{"Papua Barat", "Maluku & Papua", "7.5%", "7.5", false, false, false},
		{"Papua Selatan", "Maluku & Papua", "7.5%", "7.5", false, false, false},
		{"Papua Tengah", "Maluku & Papua", "7.5%", "7.5", false, false, false},
		{"Papua Pegunungan", "Maluku & Papua", "7.5%", "7.5", false, false, false},
		{"Papua Barat Daya", "Maluku & Papua", "7.5%", "7.5", false, false, false},

		// Kawasan Bebas FTZ
		{"Kawasan Bebas Batam", "Kawasan Bebas FTZ", "Bebas Pajak (0%)", "batam", false, true, true},
		{"Kawasan Bebas Sabang", "Kawasan Bebas FTZ", "Bebas Pajak (0%)", "sabang", false, false, false},
	}

	effectiveDate := "1 Oktober 2026"
	now := time.Now()
	var allPrices []models.FuelPrice

	for _, reg := range regions {
		// 1. Pertalite (Seluruh Indonesia seragam Rp 10.000)
		allPrices = append(allPrices, models.FuelPrice{
			Province:      reg.Province,
			Zone:          reg.Zone,
			FuelType:      "Pertalite",
			Category:      "bensin",
			OctaneCetane:  "RON 90",
			Color:         "#16A34A",
			Price:         10000,
			Unit:          "liter",
			Description:   "BBM Penugasan (JBKP) dengan harga seragam nasional yang disubsidi pemerintah.",
			IsSubsidized:  true,
			PbbkbRate:     reg.PbbkbRate,
			EffectiveDate: effectiveDate,
			CreatedAt:     now,
			UpdatedAt:     now,
		})

		// 2. Biosolar (Seluruh Indonesia seragam Rp 6.800)
		allPrices = append(allPrices, models.FuelPrice{
			Province:      reg.Province,
			Zone:          reg.Zone,
			FuelType:      "Biosolar",
			Category:      "diesel",
			OctaneCetane:  "CN 48 (B35)",
			Color:         "#64748B",
			Price:         6800,
			Unit:          "liter",
			Description:   "Bahan bakar solar subsidi (JBT) dengan campuran mandatori 35% ester minyak sawit.",
			IsSubsidized:  true,
			PbbkbRate:     reg.PbbkbRate,
			EffectiveDate: effectiveDate,
			CreatedAt:     now,
			UpdatedAt:     now,
		})

		// 3. Pertamax (Bervariasi berdasarkan PBBKB)
		pertamaxPrice := 15950
		switch reg.PbbkbTier {
		case "7.5":
			pertamaxPrice = 16300
		case "10":
			pertamaxPrice = 16650
		case "batam":
			pertamaxPrice = 15200
		case "sabang":
			pertamaxPrice = 14800
		}
		allPrices = append(allPrices, models.FuelPrice{
			Province:      reg.Province,
			Zone:          reg.Zone,
			FuelType:      "Pertamax",
			Category:      "bensin",
			OctaneCetane:  "RON 92",
			Color:         "#006BB8",
			Price:         pertamaxPrice,
			Unit:          "liter",
			Description:   "BBM berkualitas dengan teknologi PERTATEC menjaga kemurnian mesin injeksi.",
			IsSubsidized:  false,
			PbbkbRate:     reg.PbbkbRate,
			EffectiveDate: effectiveDate,
			CreatedAt:     now,
			UpdatedAt:     now,
		})

		// 4. Pertamax Green 95 (Khusus wilayah tertentu)
		if reg.HasGreen {
			allPrices = append(allPrices, models.FuelPrice{
				Province:      reg.Province,
				Zone:          reg.Zone,
				FuelType:      "Pertamax Green 95",
				Category:      "bensin",
				OctaneCetane:  "RON 95 (Bioetanol 5%)",
				Color:         "#88A31D",
				Price:         19150,
				Unit:          "liter",
				Description:   "Bahan bakar ramah lingkungan perpaduan Pertamax dengan bioetanol dari tebu.",
				IsSubsidized:  false,
				PbbkbRate:     reg.PbbkbRate,
				EffectiveDate: effectiveDate,
				CreatedAt:     now,
				UpdatedAt:     now,
			})
		}

		// 5. Pertamax Turbo
		if reg.HasTurbo {
			turboPrice := 19600
			switch reg.PbbkbTier {
			case "7.5":
				turboPrice = 20000
			case "10":
				turboPrice = 20400
			case "batam":
				turboPrice = 18700
			}
			allPrices = append(allPrices, models.FuelPrice{
				Province:      reg.Province,
				Zone:          reg.Zone,
				FuelType:      "Pertamax Turbo",
				Category:      "bensin",
				OctaneCetane:  "RON 98",
				Color:         "#E21F26",
				Price:         turboPrice,
				Unit:          "liter",
				Description:   "Bahan bakar performa tinggi dengan formula Ignition Boost Formula untuk kompresi tinggi.",
				IsSubsidized:  false,
				PbbkbRate:     reg.PbbkbRate,
				EffectiveDate: effectiveDate,
				CreatedAt:     now,
				UpdatedAt:     now,
			})
		}

		// 6. Dexlite
		dexlitePrice := 23700
		switch reg.PbbkbTier {
		case "7.5":
			dexlitePrice = 24200
		case "10":
			dexlitePrice = 24700
		case "batam":
			dexlitePrice = 22600
		case "sabang":
			dexlitePrice = 22000
		}
		allPrices = append(allPrices, models.FuelPrice{
			Province:      reg.Province,
			Zone:          reg.Zone,
			FuelType:      "Dexlite",
			Category:      "diesel",
			OctaneCetane:  "CN 51",
			Color:         "#0284C7",
			Price:         dexlitePrice,
			Unit:          "liter",
			Description:   "Bahan bakar diesel hemat dan bertenaga untuk armada dan kendaraan modern.",
			IsSubsidized:  false,
			PbbkbRate:     reg.PbbkbRate,
			EffectiveDate: effectiveDate,
			CreatedAt:     now,
			UpdatedAt:     now,
		})

		// 7. Pertamina Dex
		if reg.HasDex {
			dexPrice := 25200
			switch reg.PbbkbTier {
			case "7.5":
				dexPrice = 25700
			case "10":
				dexPrice = 26250
			case "batam":
				dexPrice = 24000
			}
			allPrices = append(allPrices, models.FuelPrice{
				Province:      reg.Province,
				Zone:          reg.Zone,
				FuelType:      "Pertamina Dex",
				Category:      "diesel",
				OctaneCetane:  "CN 53",
				Color:         "#047857",
				Price:         dexPrice,
				Unit:          "liter",
				Description:   "Bahan bakar diesel kualitas tertinggi standar Euro 5 sulfur ultra rendah (<50 ppm).",
				IsSubsidized:  false,
				PbbkbRate:     reg.PbbkbRate,
				EffectiveDate: effectiveDate,
				CreatedAt:     now,
				UpdatedAt:     now,
			})
		}
	}

	for _, item := range allPrices {
		db.Create(&item)
	}

	log.Printf("🌱 Berhasil menabur %d data harga BBM resmi untuk seluruh 38 provinsi & FTZ di Indonesia!", len(allPrices))
}
