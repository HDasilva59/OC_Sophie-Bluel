const API_BASE_URL = "http://localhost:5678/api";

function parseJwtPayload(token) {
	const parts = String(token || "").split(".");
	if (parts.length !== 3) return null;

	let b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
	while (b64.length % 4 !== 0) b64 += "=";

	try {
		const json = atob(b64);
		return JSON.parse(json);
	} catch {
		return null;
	}
}

function isTokenValid(token) {
	if (!token) return false;
	const payload = parseJwtPayload(token);
	if (!payload) return false;
	if (!payload.exp) return true;
	return Date.now() < Number(payload.exp) * 1000;
}

function getToken() {
	const token = sessionStorage.getItem("token");
	if (!isTokenValid(token)) return null;
	return token;
}

async function fetchJson(url) {
	const res = await fetch(url);
	if (!res.ok) {
		throw new Error(`HTTP ${res.status} - ${url}`);
	}
	return res.json();
}

async function fetchWithAuth(url, options = {}) {
	const token = getToken();
	if (!token) {
		throw new Error("Missing auth token");
	}

	const headers = new Headers(options.headers || {});
	headers.set("Authorization", `Bearer ${token}`);

	const res = await fetch(url, {
		...options,
		headers,
	});

	if (res.status === 401) {
		sessionStorage.removeItem("token");
		setEditModeUI(false);
		throw new Error(`HTTP ${res.status} - ${url}`);
	}

	if (!res.ok) {
		throw new Error(`HTTP ${res.status} - ${url}`);
	}

	return res;
}

function setEditModeUI(isAuthed) {
	const editBtn = document.getElementById("editBtn");
	if (editBtn) {
		editBtn.hidden = !isAuthed;
	}

	const loginLink = document.getElementById("loginLink");
	if (loginLink) {
		if (isAuthed) {
			loginLink.textContent = "logout";
			loginLink.href = "#";
			loginLink.addEventListener(
				"click",
				(e) => {
					e.preventDefault();
					sessionStorage.removeItem("token");
					window.location.reload();
				},
				{ once: true }
			);
		} else {
			loginLink.textContent = "login";
			loginLink.href = "login.html";
		}
	}
}

function openModal(html) {
	const overlay = document.getElementById("modalOverlay");
	if (!overlay) return;

	overlay.innerHTML = html;
	overlay.classList.add("is-open");
	overlay.setAttribute("aria-hidden", "false");

	const close = () => closeModal();

	overlay.addEventListener(
		"click",
		(e) => {
			if (e.target === overlay) close();
		},
		{ once: true }
	);

	const closeBtn = overlay.querySelector("[data-modal-close]");
	if (closeBtn) {
		closeBtn.addEventListener("click", close, { once: true });
	}

	const escapeHandler = (e) => {
		if (e.key === "Escape") {
			close();
		}
	};
	window.addEventListener("keydown", escapeHandler, { once: true });
}

function closeModal() {
	const overlay = document.getElementById("modalOverlay");
	if (!overlay) return;

	overlay.classList.remove("is-open");
	overlay.setAttribute("aria-hidden", "true");
	overlay.innerHTML = "";
}

function galleryModalTemplate(works) {
	const items = works
		.map(
			(w) => `
				<div class="modal-work" data-work-id="${w.id}">
					<img src="${w.imageUrl}" alt="${w.title}">
					<button type="button" class="modal-trash" data-trash-btn aria-label="Supprimer">
						<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
							<path fill="currentColor" d="M9 3h6l1 2h4v2H4V5h4l1-2Zm1 7h2v9h-2v-9Zm4 0h2v9h-2v-9ZM7 10h2v9H7v-9Z"/>
						</svg>
					</button>
				</div>
			`
		)
		.join("");

	return `
		<div class="modal" role="dialog" aria-modal="true" aria-label="Galerie photo">
			<button type="button" class="modal-close" data-modal-close aria-label="Fermer">×</button>
			<h3 class="modal-title">Galerie photo</h3>
			<div class="modal-grid">${items}</div>
			<div class="modal-separator"></div>
			<button type="button" class="modal-primary" data-add-photo>Ajouter une photo</button>
		</div>
	`;
}

function addPhotoModalTemplate(categories) {
	const options = categories
		.map((c) => `<option value="${c.id}">${c.name}</option>`)
		.join("");

	return `
		<div class="modal" role="dialog" aria-modal="true" aria-label="Ajout photo">
			<div class="modal-topbar">
				<button type="button" class="modal-back" data-back aria-label="Retour">←</button>
				<button type="button" class="modal-close" data-modal-close aria-label="Fermer">×</button>
			</div>
			<h3 class="modal-title">Ajout photo</h3>
			<form class="add-form" data-add-form>
				<div class="upload-box" data-upload-box>
					<div class="upload-preview" data-preview hidden></div>
					<input type="file" accept="image/*" class="upload-input" data-file-input>
					<button type="button" class="upload-btn" data-pick-file>+ Ajouter photo</button>
					<div class="upload-hint">jpg, png : 4mo max</div>
				</div>
				<label class="field-label" for="workTitle">Titre</label>
				<input id="workTitle" class="field-input" type="text" name="title">
				<label class="field-label" for="workCategory">Catégorie</label>
				<select id="workCategory" class="field-input" name="category">
					<option value="">&nbsp;</option>
					${options}
				</select>
				<div class="modal-separator"></div>
				<button type="submit" class="modal-primary is-disabled" data-submit disabled>Valider</button>
			</form>
		</div>
	`;
}

function createWorkFigure(work) {
	const figure = document.createElement("figure");

	const img = document.createElement("img");
	img.src = work.imageUrl;
	img.alt = work.title;

	const caption = document.createElement("figcaption");
	caption.textContent = work.title;

	figure.appendChild(img);
	figure.appendChild(caption);

	return figure;
}

function renderGallery(works) {
	const gallery = document.querySelector(".gallery");
	if (!gallery) return;

	gallery.innerHTML = "";

	for (const work of works) {
		gallery.appendChild(createWorkFigure(work));
	}
}

function createFilterButton({ label, value, isActive, onClick }) {
	const btn = document.createElement("button");
	btn.type = "button";
	btn.className = `filter-btn${isActive ? " is-active" : ""}`;
	btn.dataset.filterValue = value;
	btn.textContent = label;
	btn.addEventListener("click", onClick);
	return btn;
}

function renderFilters({ categories, activeFilter, onFilterChange }) {
	const container = document.getElementById("filters");
	if (!container) return;

	container.innerHTML = "";

	container.appendChild(
		createFilterButton({
			label: "Tous",
			value: "all",
			isActive: activeFilter === "all",
			onClick: () => onFilterChange("all"),
		})
	);

	for (const category of categories) {
		container.appendChild(
			createFilterButton({
				label: category.name,
				value: String(category.id),
				isActive: String(activeFilter) === String(category.id),
				onClick: () => onFilterChange(String(category.id)),
			})
		);
	}
}

function filterWorks(works, activeFilter) {
	if (activeFilter === "all") return works;
	const id = Number(activeFilter);
	return works.filter((w) => w.categoryId === id);
}

async function initPortfolio() {
	try {
		let categories = [];
		let works = [];
		let activeFilter = "all";

		const isAuthed = Boolean(getToken());
		setEditModeUI(isAuthed);

		const refresh = async () => {
			[categories, works] = await Promise.all([
				fetchJson(`${API_BASE_URL}/categories`),
				fetchJson(`${API_BASE_URL}/works`),
			]);
		};

		const update = () => {
			renderFilters({
				categories,
				activeFilter,
				onFilterChange: (next) => {
					activeFilter = next;
					update();
				},
			});
			renderGallery(filterWorks(works, activeFilter));
		};

		try {
			await refresh();
			update();
		} catch (err) {
			console.error("Failed to load portfolio data", err);
		}

		const editBtn = document.getElementById("editBtn");
		if (editBtn) {
			editBtn.addEventListener("click", async () => {
				if (!getToken()) return;

				try {
					await refresh();
					update();
				} catch (err) {
					console.error("Failed to refresh portfolio data", err);
					return;
				}

				openModal(galleryModalTemplate(works));

				const overlay = document.getElementById("modalOverlay");
				if (!overlay) return;

				const bindGalleryActions = () => {
					const trashButtons = overlay.querySelectorAll("[data-trash-btn]");
					for (const btn of trashButtons) {
						btn.addEventListener("click", async (e) => {
							e.preventDefault();
							const parent = btn.closest("[data-work-id]");
							if (!parent) return;
							const workId = parent.getAttribute("data-work-id");

							try {
								await fetchWithAuth(`${API_BASE_URL}/works/${workId}`, {
									method: "DELETE",
								});
								await refresh();
								update();
								openModal(galleryModalTemplate(works));
								bindGalleryActions();
							} catch (err) {
								console.error("Delete failed", err);
							}
						});
					}

					const addBtn = overlay.querySelector("[data-add-photo]");
					if (addBtn) {
						addBtn.addEventListener("click", () => {
							openModal(addPhotoModalTemplate(categories));
							bindAddPhotoActions();
						});
					}
				};

				const bindAddPhotoActions = () => {
					const overlay2 = document.getElementById("modalOverlay");
					if (!overlay2) return;

					const backBtn = overlay2.querySelector("[data-back]");
					if (backBtn) {
						backBtn.addEventListener("click", () => {
							openModal(galleryModalTemplate(works));
							bindGalleryActions();
						});
					}

					const form = overlay2.querySelector("[data-add-form]");
					const fileInput = overlay2.querySelector("[data-file-input]");
					const pickBtn = overlay2.querySelector("[data-pick-file]");
					const titleInput = overlay2.querySelector("#workTitle");
					const categoryInput = overlay2.querySelector("#workCategory");
					const submitBtn = overlay2.querySelector("[data-submit]");
					const preview = overlay2.querySelector("[data-preview]");
					const uploadBox = overlay2.querySelector("[data-upload-box]");

					if (!form || !fileInput || !pickBtn || !titleInput || !categoryInput || !submitBtn) {
						return;
					}

					const state = { file: null };

					const validate = () => {
						const ok = Boolean(state.file) && Boolean(titleInput.value.trim()) && Boolean(categoryInput.value);
						submitBtn.disabled = !ok;
						submitBtn.classList.toggle("is-disabled", !ok);
					};

					pickBtn.addEventListener("click", () => fileInput.click());
					fileInput.addEventListener("change", () => {
						const file = fileInput.files && fileInput.files[0];
						if (!file) return;

						state.file = file;
						validate();

						if (preview) {
							preview.hidden = false;
							preview.innerHTML = "";
							const img = document.createElement("img");
							img.className = "upload-preview-img";
							img.src = URL.createObjectURL(file);
							preview.appendChild(img);
						}
						if (uploadBox) {
							uploadBox.classList.add("has-preview");
						}
					});

					titleInput.addEventListener("input", validate);
					categoryInput.addEventListener("change", validate);

					form.addEventListener("submit", async (e) => {
						e.preventDefault();
						validate();
						if (submitBtn.disabled) return;

						try {
							const fd = new FormData();
							fd.append("image", state.file);
							fd.append("title", titleInput.value.trim());
							fd.append("category", categoryInput.value);

							await fetchWithAuth(`${API_BASE_URL}/works`, {
								method: "POST",
								body: fd,
							});
							await refresh();
							update();
							openModal(galleryModalTemplate(works));
							bindGalleryActions();
						} catch (err) {
							console.error("Upload failed", err);
						}
					});

					validate();
				};

				bindGalleryActions();
			});
		}
	} catch (err) {
		console.error("Failed to load portfolio data", err);
	}
}

document.addEventListener("DOMContentLoaded", () => {
	initPortfolio();
});
