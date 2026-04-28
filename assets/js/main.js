(function () {
    const cfg = window.ECOVECTOR_CONFIG || {};
    const cars = window.ECOVECTOR_CARS || [];

    const qs = selector => document.querySelector(selector);
    const qsa = selector => Array.from(document.querySelectorAll(selector));

    const defaultWaMsg = encodeURIComponent("Olá, vi o website da EcoVector e gostaria de obter mais informações.");
    const waLink = `https://wa.me/${cfg.whatsapp || ""}?text=${defaultWaMsg}`;

    /* Dados globais do site */

    qsa("[data-site-phone]").forEach(element => {
        element.textContent = cfg.phone || "";
    });

    qsa("[data-site-email]").forEach(element => {
        element.textContent = cfg.email || "";
    });

    qsa("[data-site-address]").forEach(element => {
        element.textContent = cfg.address || "";
    });

    qsa("[data-site-hours-week]").forEach(element => {
        element.textContent = cfg.hoursWeek || "";
    });

    qsa("[data-site-hours-sat]").forEach(element => {
        element.textContent = cfg.hoursSat || "";
    });

    qsa("[data-site-hours-sun]").forEach(element => {
        element.textContent = cfg.hoursSun || "";
    });

    qsa("[data-phone-link]").forEach(element => {
        element.href = cfg.phoneHref || "#";
    });

    qsa("[data-email-link]").forEach(element => {
        element.href = `mailto:${cfg.email || ""}`;
    });

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

    /* Menu mobile */

    const menuButton = qs(".menu-toggle");
    const nav = qs(".site-nav");

    if (menuButton && nav) {
        menuButton.addEventListener("click", () => {
            nav.classList.toggle("open");
            menuButton.setAttribute("aria-expanded", nav.classList.contains("open"));
        });
    }

    /* Card de viatura */

    function carCard(car, path = "pages/") {
        return `
            <article class="vehicle-card">
                <a href="${path}viatura.html?id=${encodeURIComponent(car.id)}">
                    <div
                        class="vehicle-image"
                        style="background-image: linear-gradient(rgba(0,0,0,.04), rgba(0,0,0,.2)), url('${car.image}')">
                    </div>
                </a>

                <div class="vehicle-body">
                    <span class="tag">${car.tag || "Disponível"}</span>

                    <h3>${car.brand} ${car.model}</h3>

                    <p>${car.description || ""}</p>

                    <div class="meta-row">
                        <span class="meta-pill">${car.year || ""}</span>
                        <span class="meta-pill">${car.km || ""}</span>
                        <span class="meta-pill">${car.fuel || ""}</span>
                        <span class="meta-pill">${car.gearbox || ""}</span>
                    </div>

                    <div class="vehicle-footer">
                        <strong>${car.price || "Sob consulta"}</strong>

                        <a href="${path}viatura.html?id=${encodeURIComponent(car.id)}">
                            Detalhes
                        </a>
                    </div>
                </div>
            </article>
        `;
    }

    /* Viaturas na homepage */

    const homeGrid = qs("[data-home-cars]");

    if (homeGrid) {
        homeGrid.innerHTML = cars.slice(0, 3).map(car => carCard(car, "pages/")).join("");
    }

    /* Stock */

    const stockGrid = qs("[data-stock-grid]");
    const stockCount = qs("[data-stock-count]");

    function renderStock(list) {
        if (stockGrid) {
            stockGrid.innerHTML = list.map(car => carCard(car, "")).join("") || `
                <p>Não foram encontradas viaturas com esses filtros.</p>
            `;
        }

        if (stockCount) {
            stockCount.textContent = `${list.length} viatura${list.length === 1 ? "" : "s"} disponível${list.length === 1 ? "" : "eis"}`;
        }
    }

    if (stockGrid) {
        renderStock(cars);

        qsa("[data-filter]").forEach(filter => {
            filter.addEventListener("input", () => {
                const brand = (qs('[data-filter="brand"]')?.value || "").toLowerCase();
                const fuel = (qs('[data-filter="fuel"]')?.value || "").toLowerCase();
                const year = qs('[data-filter="year"]')?.value || "";
                const price = qs('[data-filter="price"]')?.value || "";

                const filteredCars = cars.filter(car => {
                    const carPrice = Number(String(car.price || "").replace(/[^0-9]/g, ""));

                    return (
                        (!brand || String(car.brand || "").toLowerCase().includes(brand)) &&
                        (!fuel || String(car.fuel || "").toLowerCase().includes(fuel)) &&
                        (!year || String(car.year || "").includes(year)) &&
                        (!price || carPrice <= Number(price))
                    );
                });

                renderStock(filteredCars);
            });
        });
    }

    /* Página da viatura */

    const detail = qs("[data-car-detail]");

    if (detail) {
        const params = new URLSearchParams(window.location.search);
        const carId = params.get("id") || cars[0]?.id;

        const car = cars.find(item => item.id === carId) || cars[0];

        if (!car) {
            detail.innerHTML = `
                <div class="legal-card">
                    <h2>Viatura não encontrada</h2>
                    <p>A viatura que tentou abrir já não está disponível.</p>
                    <a class="btn btn-primary" href="stock.html">Voltar ao stock</a>
                </div>
            `;
        } else {
            const images = car.images && car.images.length ? car.images : [car.image];

            document.title = `${car.brand} ${car.model} | EcoVector`;

            detail.innerHTML = `
                <div class="car-layout">

                    <div class="car-gallery">

                        <div class="gallery-thumbs">
                            ${images.map((image, index) => `
                                <button
                                    class="gallery-thumb ${index === 0 ? "active" : ""}"
                                    style="background-image: url('${image}')"
                                    data-gallery-thumb="${image}"
                                    aria-label="Ver imagem ${index + 1}">
                                </button>
                            `).join("")}
                        </div>

                        <div
                            class="gallery-main"
                            style="background-image: linear-gradient(rgba(0,0,0,.04), rgba(0,0,0,.18)), url('${images[0]}')"
                            data-gallery-main>
                        </div>

                    </div>

                    <aside class="car-info-card">
                        <span class="pill">${car.tag || "Disponível"}</span>

                        <h1 class="car-title">${car.brand} ${car.model}</h1>

                        <p>${car.version || ""}</p>

                        <div class="car-price">${car.price || "Sob consulta"}</div>

                        <div class="spec-grid">
                            <div>
                                <span>Ano</span>
                                <strong>${car.year || "—"}</strong>
                            </div>

                            <div>
                                <span>Quilómetros</span>
                                <strong>${car.km || "—"}</strong>
                            </div>

                            <div>
                                <span>Combustível</span>
                                <strong>${car.fuel || "—"}</strong>
                            </div>

                            <div>
                                <span>Caixa</span>
                                <strong>${car.gearbox || "—"}</strong>
                            </div>

                            <div>
                                <span>Categoria</span>
                                <strong>${car.body || car.category || "Automóvel"}</strong>
                            </div>

                            <div>
                                <span>Localização</span>
                                <strong>${car.location || "Portugal"}</strong>
                            </div>
                        </div>

                        <div class="car-actions">
                            <a class="btn btn-primary" href="${waLink}" target="_blank" rel="noopener">
                                Pedir proposta
                            </a>

                            <a class="btn btn-secondary" href="contactos.html">
                                Contactar
                            </a>
                        </div>
                    </aside>

                </div>

                <div class="detail-tabs">
                    <div class="detail-tab">Visão Geral</div>
                </div>

                <div class="details-panel">

                    <div class="details-grid">

                        <div class="detail-item">
                            <div class="detail-icon">⛽</div>
                            <div>
                                <span>Combustível</span>
                                <strong>${car.fuel || "—"}</strong>
                            </div>
                        </div>

                        <div class="detail-item">
                            <div class="detail-icon">📅</div>
                            <div>
                                <span>Ano</span>
                                <strong>${car.year || "—"}</strong>
                            </div>
                        </div>

                        <div class="detail-item">
                            <div class="detail-icon">🛣️</div>
                            <div>
                                <span>Quilómetros</span>
                                <strong>${car.km || "—"}</strong>
                            </div>
                        </div>

                        <div class="detail-item">
                            <div class="detail-icon">⚙️</div>
                            <div>
                                <span>Caixa</span>
                                <strong>${car.gearbox || "—"}</strong>
                            </div>
                        </div>

                        <div class="detail-item">
                            <div class="detail-icon">🎨</div>
                            <div>
                                <span>Cor</span>
                                <strong>${car.color || "Não indicado"}</strong>
                            </div>
                        </div>

                        <div class="detail-item">
                            <div class="detail-icon">🚘</div>
                            <div>
                                <span>Categoria</span>
                                <strong>${car.body || car.category || "Automóvel"}</strong>
                            </div>
                        </div>

                        <div class="detail-item">
                            <div class="detail-icon">🛡️</div>
                            <div>
                                <span>Garantia</span>
                                <strong>${car.warranty || "Sob consulta"}</strong>
                            </div>
                        </div>

                        <div class="detail-item">
                            <div class="detail-icon">📍</div>
                            <div>
                                <span>Localização</span>
                                <strong>${car.location || "Portugal"}</strong>
                            </div>
                        </div>

                    </div>

                    <div class="equipment-section">
                        <h2>Descrição</h2>
                        <p>${car.description || "Viatura selecionada, em excelente estado e pronta para entrega."}</p>
                    </div>

                    <div class="equipment-section">
                        <h2>Equipamento</h2>

                        <ul class="feature-list">
                            ${(car.features || [
                                "Ar condicionado",
                                "Bluetooth",
                                "Sensores de estacionamento",
                                "Câmara traseira",
                                "Cruise control",
                                "Apple CarPlay / Android Auto"
                            ]).map(feature => `<li>${feature}</li>`).join("")}
                        </ul>
                    </div>

                </div>
            `;

            qsa("[data-gallery-thumb]").forEach(button => {
                button.addEventListener("click", () => {
                    qsa("[data-gallery-thumb]").forEach(btn => {
                        btn.classList.remove("active");
                    });

                    button.classList.add("active");

                    const galleryMain = qs("[data-gallery-main]");

                    if (galleryMain) {
                        galleryMain.style.backgroundImage = `
                            linear-gradient(rgba(0,0,0,.04), rgba(0,0,0,.18)),
                            url('${button.dataset.galleryThumb}')
                        `;
                    }
                });
            });
        }
    }

    /* Formulário de contacto */

    qsa("[data-contact-form]").forEach(form => {
        form.addEventListener("submit", event => {
            event.preventDefault();

            const data = new FormData(form);

            const message = encodeURIComponent(
                `Olá, o meu nome é ${data.get("nome") || ""}.\n` +
                `Contacto: ${data.get("telefone") || ""}\n` +
                `Email: ${data.get("email") || ""}\n` +
                `Mensagem: ${data.get("mensagem") || ""}`
            );

            window.open(`https://wa.me/${cfg.whatsapp || ""}?text=${message}`, "_blank", "noopener");
        });
    });
})();