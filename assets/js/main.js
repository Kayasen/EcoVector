(function () {
    const cfg = window.ECOVECTOR_CONFIG || {};
    const rawBaseCars = window.ECOVECTOR_CARS || [];
    const storedCars = JSON.parse(localStorage.getItem("ecovectorCars") || "[]");
    const hiddenBaseCarIds = JSON.parse(localStorage.getItem("ecovectorHiddenBaseCars") || "[]").map(String);
    const highlightOverrides = JSON.parse(localStorage.getItem("ecovectorHighlightOverrides") || "{}");
    const baseCars = rawBaseCars
        .filter(car => !hiddenBaseCarIds.includes(String(car.id)))
        .map(car => ({
            ...car,
            highlight: highlightOverrides[String(car.id)] ?? car.highlight ?? ""
        }));
    const cars = [...baseCars, ...storedCars].filter(car => String(car.fuel || "Elétrico").toLowerCase().includes("elétr"));

    let activeBrandFilter = "";
    let activeOriginFilter = "";

    const qs = selector => document.querySelector(selector);
    const qsa = selector => Array.from(document.querySelectorAll(selector));

    const defaultWaMsg = encodeURIComponent("Olá, vi o website da EcoVector e gostaria de obter mais informações sobre uma viatura 100% elétrica.");
    const waLink = `https://wa.me/${cfg.whatsapp || ""}?text=${defaultWaMsg}`;

    function getNumericPrice(price) {
        return Number(String(price || "").replace(/[^0-9]/g, "")) || 0;
    }

    function getNumericRange(range) {
        return Number(String(range || "").replace(/[^0-9]/g, "")) || 0;
    }

    function formatKm(value) {
        if (!value) return "";
        return String(value).toLowerCase().includes("km") ? value : `${value} km`;
    }

    function createSlug(text) {
        return String(text || "")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
    }

    qsa("[data-site-phone]").forEach(element => element.textContent = cfg.phone || "");
    qsa("[data-site-email]").forEach(element => element.textContent = cfg.email || "");
    qsa("[data-site-address]").forEach(element => element.textContent = cfg.address || "");
    qsa("[data-site-hours-week]").forEach(element => element.textContent = cfg.hoursWeek || "");
    qsa("[data-site-hours-sat]").forEach(element => element.textContent = cfg.hoursSat || "");
    qsa("[data-site-hours-sun]").forEach(element => element.textContent = cfg.hoursSun || "");
    qsa("[data-phone-link]").forEach(element => element.href = cfg.phoneHref || "#");
    qsa("[data-email-link]").forEach(element => element.href = `mailto:${cfg.email || ""}`);

    qsa("[data-whatsapp-link]").forEach(element => {
        element.href = waLink;
        element.target = "_blank";
        element.rel = "noopener";
    });

    qsa("[data-directions-link]").forEach(element => {
        element.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cfg.mapQuery || cfg.address || "")}`;
        element.target = "_blank";
        element.rel = "noopener";
    });

    qsa("[data-map-frame]").forEach(element => {
        element.src = `https://www.google.com/maps?q=${encodeURIComponent(cfg.mapQuery || cfg.address || "")}&output=embed`;
    });

    const menuButton = qs(".menu-toggle");
    const nav = qs(".site-nav");

    if (menuButton && nav) {
        menuButton.addEventListener("click", () => {
            nav.classList.toggle("open");
            menuButton.setAttribute("aria-expanded", nav.classList.contains("open"));
        });
    }

    if ("IntersectionObserver" in window) {
        const revealItems = qsa(".hero-panel, .hero-card, .search-box, .vehicle-card, .service-card, .contact-card, .footer-card, .legal-card, .details-panel, .car-layout, .stock-hero-card");
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });

        revealItems.forEach(item => {
            item.classList.add("reveal");
            observer.observe(item);
        });
    }


    /* Hero dinâmico da homepage */

    const heroContainer = qs("[data-hero-car]");

    if (heroContainer) {
        const highlightCar =
            cars.find(car => car.highlight === "week") ||
            cars.find(car => car.highlight === "featured") ||
            cars[0];

        if (highlightCar) {
            const heroMessage = encodeURIComponent(
                `Olá, vi no website da EcoVector a viatura elétrica ${highlightCar.brand || ""} ${highlightCar.model || ""} e gostaria de obter mais informações.`
            );

            const heroWaLink = `https://wa.me/${cfg.whatsapp || ""}?text=${heroMessage}`;
            const heroImage = highlightCar.image || (highlightCar.images && highlightCar.images[0]) || "assets/img/logo.png";
            const heroBadge = highlightCar.highlight === "week" ? "Destaque da semana" : highlightCar.highlight === "featured" ? "Em destaque" : "100% elétrico";

            heroContainer.innerHTML = `
                <div class="hero-car" style="background-image: linear-gradient(rgba(0,0,0,.04), rgba(0,0,0,.18)), url('${heroImage}')"></div>

                <div>
                    <span class="pill">${heroBadge}</span>

                    <h2>${highlightCar.brand || ""} ${highlightCar.model || ""}</h2>

                    <p class="price">${highlightCar.price || "Sob consulta"}</p>

                    <div class="spec-grid">
                        <div>
                            <span>Ano</span>
                            <strong>${highlightCar.year || "—"}</strong>
                        </div>

                        <div>
                            <span>Quilómetros</span>
                            <strong>${formatKm(highlightCar.km) || "—"}</strong>
                        </div>

                        <div>
                            <span>Autonomia</span>
                            <strong>${highlightCar.range || "—"}</strong>
                        </div>

                        <div>
                            <span>Caixa</span>
                            <strong>${highlightCar.gearbox || "Automática"}</strong>
                        </div>
                    </div>

                    <div class="hero-actions" style="margin-top:18px">
                        <a class="btn btn-primary" href="pages/viatura?id=${encodeURIComponent(highlightCar.id)}">
                            Ver viatura
                        </a>

                        <a class="btn btn-secondary" href="${heroWaLink}" target="_blank" rel="noopener">
                            WhatsApp
                        </a>
                    </div>
                </div>
            `;
        } else {
            heroContainer.innerHTML = `
                <div class="empty-state">
                    <h2>Nenhuma viatura em destaque</h2>
                    <p>Adiciona uma viatura no painel ou define uma como destaque.</p>
                </div>
            `;
        }
    }


    function carCard(car, path = "pages/") {
        const detailHref = `${path}viatura?id=${encodeURIComponent(car.id)}`;
        const category = car.body || car.category || "Elétrico";
        const origin = car.origin || "Nacional";
        const originClass = origin === "Importado" ? "imported" : "national";
        const highlight = car.highlight || "";
        const highlightLabel = highlight === "week" ? "Destaque da semana" : highlight === "featured" ? "Em destaque" : "";

        return `
            <article class="vehicle-card">
                <a href="${detailHref}" aria-label="Ver detalhes de ${car.brand} ${car.model}">
                    <div class="vehicle-image" style="background-image: linear-gradient(rgba(0,0,0,.02), rgba(0,0,0,.28)), url('${car.image}')">
                    </div>
                </a>

                <div class="vehicle-body">
                    

                    <div class="vehicle-kicker">${category} · ${car.battery || "Bateria sob consulta"}</div>
                    <h3>${car.brand || ""} ${car.model || ""}</h3>
                    <p>${car.version || car.description || "Viatura 100% elétrica disponível para entrega."}</p>

                    <div class="meta-row">
                        <span class="meta-pill"><i class="fa-solid fa-calendar-days"></i> ${car.year || "—"}</span>
                        <span class="meta-pill"><i class="fa-solid fa-road"></i> ${formatKm(car.km) || "—"}</span>
                        <span class="meta-pill"><i class="fa-solid fa-battery-full"></i> ${car.range || "—"}</span>
                        <span class="meta-pill"><i class="fa-solid fa-bolt"></i> ${car.power || "—"}</span>
                    </div>

                    <div class="vehicle-footer">
                        <strong>${car.price || "Sob consulta"}</strong>
                        <a href="${detailHref}">Ver detalhes</a>
                    </div>
                </div>
            </article>
        `;
    }

    const homeGrid = qs("[data-home-cars]");
    if (homeGrid) {
        const homeCars = [
            ...cars.filter(car => car.highlight === "week"),
            ...cars.filter(car => car.highlight === "featured"),
            ...cars.filter(car => !car.highlight)
        ];

        homeGrid.innerHTML = homeCars.slice(0, 3).map(car => carCard(car, "pages/")).join("");
    }

    const stockGrid = qs("[data-stock-grid]");
    const stockCount = qs("[data-stock-count]");
    const resetFilters = qs("[data-reset-filters]");

    function setActiveChip(containerSelector, value) {
        const container = qs(containerSelector);
        if (!container) return;

        qsa(`${containerSelector} [data-chip-value]`).forEach(button => {
            button.classList.toggle("active", button.dataset.chipValue === value);
        });
    }

    function renderChipFilter(containerSelector, values, type) {
        const container = qs(containerSelector);
        if (!container) return;

        const vagPriority = ["Volkswagen", "Audi", "Skoda", "Cupra", "Seat", "Porsche"];
        const uniqueValues = [...new Set(values.filter(Boolean))];
        const orderedValues = [
            ...vagPriority.filter(value => uniqueValues.includes(value)),
            ...uniqueValues.filter(value => !vagPriority.includes(value)).sort()
        ];

        container.innerHTML = `
            <button class="filter-chip active" type="button" data-chip-value="">Todos</button>
            ${orderedValues.map(value => `<button class="filter-chip" type="button" data-chip-value="${value}">${value}</button>`).join("")}
        `;

        qsa(`${containerSelector} [data-chip-value]`).forEach(button => {
            button.addEventListener("click", () => {
                if (type === "brand") activeBrandFilter = button.dataset.chipValue || "";
                if (type === "origin") activeOriginFilter = button.dataset.chipValue || "";
                setActiveChip(containerSelector, button.dataset.chipValue || "");
                renderStock(getFilteredCars());
            });
        });
    }

    function getFilteredCars() {
        const search = (qs('[data-filter="search"]')?.value || "").toLowerCase().trim();
        const brand = activeBrandFilter.toLowerCase();
        const minRange = Number(qs('[data-filter="range"]')?.value || "0");
        const origin = activeOriginFilter.toLowerCase();
        const year = qs('[data-filter="year"]')?.value || "";
        const price = qs('[data-filter="price"]')?.value || "";
        const sort = qs('[data-filter="sort"]')?.value || "recent";

        const filtered = cars.filter(car => {
            const searchable = `${car.brand || ""} ${car.model || ""} ${car.version || ""} ${car.category || ""} ${car.battery || ""} ${car.range || ""} ${car.origin || ""}`.toLowerCase();

            return (
                (!search || searchable.includes(search)) &&
                (!brand || String(car.brand || "").toLowerCase() === brand) &&
                (!minRange || getNumericRange(car.range) >= minRange) &&
                (!origin || String(car.origin || "").toLowerCase() === origin) &&
                (!year || String(car.year || "").includes(year)) &&
                (!price || getNumericPrice(car.price) <= Number(price))
            );
        });

        filtered.sort((a, b) => {
            if (sort === "price-asc") return getNumericPrice(a.price) - getNumericPrice(b.price);
            if (sort === "price-desc") return getNumericPrice(b.price) - getNumericPrice(a.price);
            if (sort === "year-desc") return Number(b.year || 0) - Number(a.year || 0);
            if (sort === "range-desc") return getNumericRange(b.range) - getNumericRange(a.range);
            return String(b.id || "").localeCompare(String(a.id || ""));
        });

        return filtered;
    }

    function renderStock(list) {
        if (stockGrid) {
            stockGrid.innerHTML = list.map(car => carCard(car, "")).join("") || `
                <div class="empty-state">
                    <h2>Não encontrámos elétricos com esses filtros.</h2>
                    <p>Altere os filtros ou fale connosco para procurarmos uma viatura 100% elétrica por encomenda.</p>
                    <a class="btn btn-primary" href="contactos">Falar com a EcoVector</a>
                </div>
            `;
        }

        if (stockCount) {
            stockCount.textContent = `${list.length} elétrico${list.length === 1 ? "" : "s"} disponível${list.length === 1 ? "" : "eis"}`;
        }
    }

    if (stockGrid) {
        renderChipFilter('[data-brand-chips]', cars.map(car => car.brand), "brand");
        renderChipFilter('[data-origin-chips]', ["Nacional", "Importado"], "origin");
        renderStock(getFilteredCars());

        qsa("[data-filter]").forEach(filter => {
            filter.addEventListener("input", () => renderStock(getFilteredCars()));
            filter.addEventListener("change", () => renderStock(getFilteredCars()));
        });

        if (resetFilters) {
            resetFilters.addEventListener("click", () => {
                qsa("[data-filter]").forEach(filter => filter.value = "");
                const sort = qs('[data-filter="sort"]');
                if (sort) sort.value = "recent";
                activeBrandFilter = "";
                activeOriginFilter = "";
                setActiveChip('[data-brand-chips]', "");
                setActiveChip('[data-origin-chips]', "");
                renderStock(getFilteredCars());
            });
        }
    }

    const detail = qs("[data-car-detail]");

    if (detail) {
        const params = new URLSearchParams(window.location.search);
        const carId = params.get("id") || cars[0]?.id;
        const car = cars.find(item => String(item.id) === String(carId)) || cars[0];

        if (!car) {
            detail.innerHTML = `
                <div class="legal-card">
                    <h2>Viatura não encontrada</h2>
                    <p>A viatura que tentou abrir já não está disponível.</p>
                    <a class="btn btn-primary" href="stock">Voltar ao stock</a>
                </div>
            `;
        } else {
            const images = car.images && car.images.length ? car.images : [car.image];
            const carMessage = encodeURIComponent(`Olá, vi no website da EcoVector a viatura elétrica ${car.brand} ${car.model} e gostaria de obter mais informações.`);
            const carWaLink = `https://wa.me/${cfg.whatsapp || ""}?text=${carMessage}`;
            const origin = car.origin || "Nacional";

            document.title = `${car.brand} ${car.model} elétrico | EcoVector`;

            const metaDescription = qs('meta[name="description"]');
            if (metaDescription) {
                metaDescription.setAttribute("content", `${car.brand} ${car.model} 100% elétrico disponível na EcoVector. Consulte autonomia, bateria, equipamento e peça informações.`);
            }

            detail.innerHTML = `
                <div class="car-layout">
                    <div class="car-gallery">
                        <div class="gallery-main" style="background-image: linear-gradient(rgba(0,0,0,.04), rgba(0,0,0,.18)), url('${images[0]}')" data-gallery-main></div>

                        <div class="gallery-thumbs">
                            ${images.map((image, index) => `
                                <button class="gallery-thumb ${index === 0 ? "active" : ""}" style="background-image: url('${image}')" data-gallery-thumb="${image}" aria-label="Ver imagem ${index + 1}"></button>
                            `).join("")}
                        </div>
                    </div>

                    <aside class="car-info-card">
                        <span class="pill">100% Elétrico</span>
                        <h1 class="car-title">${car.brand} ${car.model}</h1>
                        <p>${car.version || "Viatura 100% elétrica disponível para entrega."}</p>
                        <div class="car-price">${car.price || "Sob consulta"}</div>

                        <div class="spec-grid">
                            <div><span>Ano</span><strong>${car.year || "—"}</strong></div>
                            <div><span>Quilómetros</span><strong>${formatKm(car.km) || "—"}</strong></div>
                            <div><span>Autonomia</span><strong>${car.range || "—"}</strong></div>
                            <div><span>Bateria</span><strong>${car.battery || "—"}</strong></div>
                            <div><span>Potência</span><strong>${car.power || "—"}</strong></div>
                            <div><span>Origem</span><strong class="${origin === "Importado" ? "origin-import" : "origin-pt"}">${origin}</strong></div>
                        </div>

                        <div class="car-actions">
                            <a class="btn btn-primary" href="${carWaLink}" target="_blank" rel="noopener">Pedir informações</a>
                            <a class="btn btn-outline" href="contactos">Contactar stand</a>
                        </div>

                        <div class="car-trust-box">
                            <strong>Especialistas em elétricos</strong>
                            <span>Ajudamos com autonomia, carregamento, financiamento e retoma.</span>
                        </div>
                    </aside>
                </div>

                <div class="detail-tabs"><div class="detail-tab">Visão Geral</div></div>

                <div class="details-panel">
                    <div class="details-grid">
                        <div class="detail-item"><div class="detail-icon"><i class="fa-solid fa-battery-full"></i></div><div><span>Bateria</span><strong>${car.battery || "—"}</strong></div></div>
                        <div class="detail-item"><div class="detail-icon"><i class="fa-solid fa-road"></i></div><div><span>Autonomia</span><strong>${car.range || "—"}</strong></div></div>
                        <div class="detail-item"><div class="detail-icon"><i class="fa-solid fa-bolt"></i></div><div><span>Potência</span><strong>${car.power || "—"}</strong></div></div>
                        <div class="detail-item"><div class="detail-icon"><i class="fa-solid fa-calendar-days"></i></div><div><span>Ano</span><strong>${car.year || "—"}</strong></div></div>
                        <div class="detail-item"><div class="detail-icon"><i class="fa-solid fa-gauge-high"></i></div><div><span>Quilómetros</span><strong>${formatKm(car.km) || "—"}</strong></div></div>
                        <div class="detail-item"><div class="detail-icon"><i class="fa-solid fa-palette"></i></div><div><span>Cor</span><strong>${car.color || "Não indicado"}</strong></div></div>
                        <div class="detail-item"><div class="detail-icon"><i class="fa-solid fa-shield-halved"></i></div><div><span>Garantia</span><strong>${car.warranty || "Sob consulta"}</strong></div></div>
                        <div class="detail-item"><div class="detail-icon"><i class="fa-solid fa-flag"></i></div><div><span>Origem</span><strong>${origin}</strong></div></div>
                    </div>

                    <div class="equipment-section">
                        <h2>Descrição</h2>
                        <p>${car.description || "Viatura 100% elétrica selecionada, em excelente estado e pronta para entrega."}</p>
                    </div>

                    <div class="equipment-section">
                        <h2>Histórico da viatura</h2>
                        <ul class="vehicle-history-list">
                            ${(car.history || [origin === "Importado" ? "Viatura importada com documentação regularizada" : "Viatura nacional", "Histórico sujeito a confirmação junto da EcoVector", "Bateria verificada", "Garantia disponível sob consulta"]).map(item => `<li><i class="fa-solid fa-check"></i><span>${item}</span></li>`).join("")}
                        </ul>
                    </div>

                    <div class="equipment-section">
                        <h2>Equipamento elétrico e conforto</h2>
                        <ul class="feature-list">
                            ${(car.features || car.equipment || ["Carregamento rápido DC", "Cabo de carregamento incluído", "Bomba de calor", "Câmara traseira", "Cruise control", "Sistema de navegação"]).map(feature => `<li>${feature}</li>`).join("")}
                        </ul>
                    </div>
                </div>
            `;

            qsa("[data-gallery-thumb]").forEach(button => {
                button.addEventListener("click", () => {
                    qsa("[data-gallery-thumb]").forEach(btn => btn.classList.remove("active"));
                    button.classList.add("active");

                    const galleryMain = qs("[data-gallery-main]");
                    if (galleryMain) {
                        galleryMain.style.backgroundImage = `linear-gradient(rgba(0,0,0,.04), rgba(0,0,0,.18)), url('${button.dataset.galleryThumb}')`;
                    }
                });
            });
        }
    }


    function fileToDataUrl(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    async function getUploadedImages(input) {
        const files = Array.from(input?.files || []);
        const validFiles = files.filter(file => /^image\/(png|jpeg|webp)$/.test(file.type));

        if (!validFiles.length) {
            return [];
        }

        const maxSize = 5 * 1024 * 1024;

        for (const file of validFiles) {
            if (file.size > maxSize) {
                alert(`A imagem "${file.name}" é demasiado pesada. Usa imagens até 5MB.`);
                return [];
            }
        }

        return Promise.all(validFiles.map(fileToDataUrl));
    }

    function renderUploadPreview(input) {
        const preview = qs("[data-upload-preview]");
        if (!preview || !input) return;

        const files = Array.from(input.files || []);

        if (!files.length) {
            preview.innerHTML = "";
            return;
        }

        preview.innerHTML = files.map((file, index) => `
            <div class="upload-preview-item">
                <span>${index === 0 ? "Principal" : `Imagem ${index + 1}`}</span>
                <strong>${file.name}</strong>
            </div>
        `).join("");
    }

    const adminForm = qs("[data-admin-car-form]");
    const adminList = qs("[data-admin-list]");
    const exportButton = qs("[data-export-cars]");
    const clearButton = qs("[data-clear-cars]");

    function getAdminCars() {
        return JSON.parse(localStorage.getItem("ecovectorCars") || "[]");
    }

    function setAdminCars(list) {
        localStorage.setItem("ecovectorCars", JSON.stringify(list));
    }

    function getHiddenBaseCarIds() {
        return JSON.parse(localStorage.getItem("ecovectorHiddenBaseCars") || "[]").map(String);
    }

    function setHiddenBaseCarIds(list) {
        localStorage.setItem("ecovectorHiddenBaseCars", JSON.stringify([...new Set(list.map(String))]));
    }

    function getHighlightOverrides() {
        return JSON.parse(localStorage.getItem("ecovectorHighlightOverrides") || "{}");
    }

    function setHighlightOverrides(overrides) {
        localStorage.setItem("ecovectorHighlightOverrides", JSON.stringify(overrides));
    }

    function getHighlightLabel(value) {
        if (value === "week") return "Destaque da semana";
        if (value === "featured") return "Em destaque";
        return "Sem destaque";
    }

    function getAdminAllCars() {
        const hiddenIds = getHiddenBaseCarIds();
        const overrides = getHighlightOverrides();
        const base = rawBaseCars.map(car => ({
            ...car,
            highlight: overrides[String(car.id)] ?? car.highlight ?? "",
            _source: "base",
            _hidden: hiddenIds.includes(String(car.id))
        }));
        const custom = getAdminCars().map(car => ({ ...car, _source: "custom", _hidden: false }));
        return [...base, ...custom];
    }

    function renderAdminList() {
        if (!adminList) return;

        const list = getAdminAllCars();
        const visibleCount = list.filter(car => !car._hidden).length;
        const hiddenCount = list.filter(car => car._hidden).length;

        adminList.innerHTML = `
            <div class="admin-stock-header">
                <div>
                    <h3>Stock atual</h3>
                    <p>Gere as viaturas visíveis, ocultadas e o destaque de cada carro.</p>
                </div>

                <div class="admin-stock-summary">
                    <strong>${visibleCount} visível${visibleCount === 1 ? "" : "eis"}</strong>
                    <span>${hiddenCount} ocultada${hiddenCount === 1 ? "" : "s"}</span>
                </div>
            </div>

            <div class="admin-stock-table">
                ${list.length ? `
                    <div class="admin-stock-head">
                        <span>Viatura</span>
                        <span>Dados</span>
                        <span>Destaque</span>
                        <span>Ações</span>
                    </div>

                    ${list.map(car => {
                        const image = car.image || "../assets/img/logo.png";
                        const origin = car.origin || "Nacional";
                        const sourceLabel = car._source === "base" ? "cars.js" : "Painel";
                        const hiddenLabel = car._hidden ? `<span class="admin-status-badge hidden">Ocultada</span>` : `<span class="admin-status-badge visible">Visível</span>`;

                        return `
                            <div class="admin-stock-row ${car._hidden ? "is-hidden" : ""}">
                                <div class="admin-stock-car">
                                    <div class="admin-stock-thumb" style="background-image: url('${image}')"></div>

                                    <div>
                                        <strong>${car.brand || ""} ${car.model || ""}</strong>
                                        <small>${car.version || car.battery || "100% elétrico"}</small>
                                    </div>
                                </div>

                                <div class="admin-stock-meta">
                                    <span><i class="fa-solid fa-calendar-days"></i> ${car.year || "—"}</span>
                                    <span><i class="fa-solid fa-road"></i> ${car.range || "—"}</span>
                                    <span><i class="fa-solid fa-euro-sign"></i> ${car.price || "Sob consulta"}</span>
                                    <span class="${origin === "Importado" ? "origin-import" : "origin-pt"}">${origin}</span>
                                    <span>${sourceLabel}</span>
                                    ${hiddenLabel}
                                </div>

                                <div class="admin-stock-feature">
                                    <select class="admin-highlight-select" data-admin-highlight="${car.id}" data-admin-source="${car._source}" aria-label="Escolher destaque">
                                        <option value="" ${!car.highlight ? "selected" : ""}>Sem destaque</option>
                                        <option value="week" ${car.highlight === "week" ? "selected" : ""}>Destaque da semana</option>
                                        <option value="featured" ${car.highlight === "featured" ? "selected" : ""}>Em destaque</option>
                                    </select>
                                </div>

                                <div class="admin-stock-actions">
                                    ${car._source === "base" && !car._hidden ? `<button class="btn-icon danger" type="button" data-hide-base-car="${car.id}" title="Remover do stock"><i class="fa-solid fa-trash"></i></button>` : ""}
                                    ${car._source === "base" && car._hidden ? `<button class="btn-icon" type="button" data-restore-base-car="${car.id}" title="Voltar a mostrar"><i class="fa-solid fa-rotate-left"></i></button>` : ""}
                                    ${car._source === "custom" ? `<button class="btn-icon danger" type="button" data-delete-custom-car="${car.id}" title="Apagar viatura"><i class="fa-solid fa-trash"></i></button>` : ""}
                                </div>
                            </div>
                        `;
                    }).join("")}
                ` : `
                    <div class="empty-state">
                        <h2>Ainda não existem viaturas para gerir.</h2>
                        <p>Adiciona a primeira viatura elétrica no formulário.</p>
                    </div>
                `}
            </div>
        `;
    }



    if (adminList) {
        adminList.addEventListener("change", event => {
            const select = event.target.closest("[data-admin-highlight]");
            if (!select) return;

            const id = String(select.dataset.adminHighlight);
            const source = select.dataset.adminSource;
            const value = select.value;

            if (source === "base") {
                const overrides = getHighlightOverrides();
                if (value) {
                    overrides[id] = value;
                } else {
                    delete overrides[id];
                }
                setHighlightOverrides(overrides);
            }

            if (source === "custom") {
                const list = getAdminCars().map(car => {
                    if (String(car.id) === id) {
                        return { ...car, highlight: value };
                    }
                    return car;
                });
                setAdminCars(list);
            }

            renderAdminList();
        });

        adminList.addEventListener("click", event => {
            const hideButton = event.target.closest("[data-hide-base-car]");
            const restoreButton = event.target.closest("[data-restore-base-car]");
            const deleteButton = event.target.closest("[data-delete-custom-car]");

            if (hideButton) {
                const id = String(hideButton.dataset.hideBaseCar);
                if (confirm("Remover esta viatura existente do stock? Pode repor depois no painel.")) {
                    setHiddenBaseCarIds([...getHiddenBaseCarIds(), id]);
                    renderAdminList();
                }
            }

            if (restoreButton) {
                const id = String(restoreButton.dataset.restoreBaseCar);
                setHiddenBaseCarIds(getHiddenBaseCarIds().filter(item => item !== id));
                renderAdminList();
            }

            if (deleteButton) {
                const id = String(deleteButton.dataset.deleteCustomCar);
                if (confirm("Apagar definitivamente esta viatura adicionada no painel?")) {
                    setAdminCars(getAdminCars().filter(car => String(car.id) !== id));
                    renderAdminList();
                }
            }
        });
    }

    if (adminForm) {
        renderAdminList();

        const uploadInput = qs('[name="imagesUpload"]');
        if (uploadInput) {
            uploadInput.addEventListener("change", () => renderUploadPreview(uploadInput));
        }

        adminForm.addEventListener("submit", async event => {
            event.preventDefault();

            const data = new FormData(adminForm);
            const brand = data.get("brand") || "";
            const model = data.get("model") || "";
            const uploadInput = qs('[name="imagesUpload"]');
            const uploadedImages = await getUploadedImages(uploadInput);

            if (!uploadedImages.length) {
                alert("Carrega pelo menos uma imagem da viatura.");
                return;
            }

            const image = uploadedImages[0];
            const extraImages = uploadedImages.slice(1);

            const car = {
                id: `${createSlug(`${brand}-${model}`)}-${Date.now()}`,
                brand,
                model,
                version: data.get("version") || "",
                price: data.get("price") || "Sob consulta",
                year: data.get("year") || "",
                km: data.get("km") || "",
                fuel: "Elétrico",
                gearbox: "Automática",
                battery: data.get("battery") || "",
                range: data.get("range") || "",
                power: data.get("power") || "",
                category: data.get("category") || "Elétrico",
                origin: data.get("origin") || "Nacional",
                highlight: data.get("highlight") || "",
                color: data.get("color") || "",
                warranty: data.get("warranty") || "Sob consulta",
                tag: "100% Elétrico",
                image,
                images: [image, ...extraImages].filter(Boolean),
                description: data.get("description") || "",
                history: String(data.get("history") || "Bateria verificada\nHistórico sujeito a confirmação\nGarantia disponível").split("\n").map(item => item.trim()).filter(Boolean),
                features: String(data.get("features") || "").split("\n").map(item => item.trim()).filter(Boolean)
            };

            const list = getAdminCars();
            list.push(car);
            setAdminCars(list);
            adminForm.reset();
            renderUploadPreview(qs('[name="imagesUpload"]'));
            renderAdminList();

            alert("Viatura elétrica adicionada neste browser. Para produção, exporta o JSON e passa os dados para data/cars.js.");
        });
    }

    if (exportButton) {
        exportButton.addEventListener("click", () => {
            const data = JSON.stringify(getAdminCars(), null, 2);
            const blob = new Blob([data], { type: "application/json" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "ecovector-eletricos-adicionados.json";
            link.click();
            URL.revokeObjectURL(link.href);
        });
    }

    if (clearButton) {
        clearButton.addEventListener("click", () => {
            if (confirm("Tem a certeza que pretende limpar as viaturas adicionadas neste browser?")) {
                localStorage.removeItem("ecovectorCars");
                renderAdminList();
            }
        });
    }

    qsa("[data-contact-form]").forEach(form => {
        form.addEventListener("submit", event => {
            event.preventDefault();

            const data = new FormData(form);
            const message = encodeURIComponent(
                `Olá, o meu nome é ${data.get("nome") || ""}.\n` +
                `Contacto: ${data.get("telefone") || ""}\\n` +
                `Email: ${data.get("email") || ""}\\n` +
                `Mensagem: ${data.get("mensagem") || ""}`
            );

            window.open(`https://wa.me/${cfg.whatsapp || ""}?text=${message}`, "_blank", "noopener");
        });
    });
})();
