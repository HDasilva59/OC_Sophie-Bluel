const API_BASE_URL = "http://localhost:5678/api";

async function fetchJson(url) {
	const res = await fetch(url);
	if (!res.ok) {
		throw new Error(`HTTP ${res.status} - ${url}`);
	}
	return res.json();
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
		const [categories, works] = await Promise.all([
			fetchJson(`${API_BASE_URL}/categories`),
			fetchJson(`${API_BASE_URL}/works`),
		]);

		let activeFilter = "all";

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

		update();
	} catch (err) {
		console.error("Failed to load portfolio data", err);
	}
}

document.addEventListener("DOMContentLoaded", () => {
	initPortfolio();
});
