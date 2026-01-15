const apiUrl = 'http://localhost:5678/api';
const gallery = document.querySelector('.gallery');
const filtersContainer = document.querySelector('.filters');
const portfolioEditBtn = document.getElementById('open-modal');
const modalOverlay = document.getElementById('modal-overlay');
const modalCloseBtn = document.getElementById('modal-close');
const modalGallerySection = document.getElementById('modal-gallery-section');
const modalFormSection = document.getElementById('modal-form-section');
const modalTitle = document.getElementById('modal-title');
const modalGallery = document.getElementById('modal-gallery');
const modalAddPhotoBtn = document.getElementById('modal-add-photo-btn');
const modalBackBtn = document.getElementById('modal-back');
const addPhotoForm = document.getElementById('add-photo-form');
const photoFileInput = document.getElementById('photo-file');
const photoTitleInput = document.getElementById('photo-title');
const photoCategorySelect = document.getElementById('photo-category');
const photoAddBtn = document.getElementById('photo-add-btn');
const photoPreviewImg = document.getElementById('add-photo-preview');
const photoUploadIcon = document.getElementById('add-photo-upload-icon');
const photoSubmitBtn = document.getElementById('photo-submit');
let allWorks = [];
let activeCategoryId = null;
let allCategories = [];

function getToken() {
    const tokenCookie = document.cookie.split('; ').find(row => row.startsWith('token='));
    if (!tokenCookie) return null;
    const parts = tokenCookie.split('=');
    if (parts.length < 2) return null;
    return parts.slice(1).join('=') || null;
}

// Check for token and display connected status
function checkLoginStatus() {
    const token = getToken();
    if (token) {
        const connectedDiv = document.createElement('div');
        connectedDiv.textContent = 'connected';
        connectedDiv.style.textAlign = 'center';
        connectedDiv.style.padding = '10px';
        connectedDiv.style.backgroundColor = 'black';
        connectedDiv.style.color = 'white';
        connectedDiv.style.position = 'absolute';
        connectedDiv.style.top = '0';
        connectedDiv.style.left = '0';
        connectedDiv.style.width = '100%';
        document.body.prepend(connectedDiv);
        // Adjust header margin to account for the banner if necessary, or just let it overlay/push
        document.body.style.paddingTop = '40px'; 
        document.body.classList.add('is-authenticated');
    }
}

checkLoginStatus();

function openModal() {
    if (!modalOverlay) return;
    if (!document.body.classList.contains('is-authenticated')) return;
    modalOverlay.classList.add('open');
    modalOverlay.setAttribute('aria-hidden', 'false');
    showGallerySection();
    renderModalGallery();
}

function closeModal() {
    if (!modalOverlay) return;
    modalOverlay.classList.remove('open');
    modalOverlay.setAttribute('aria-hidden', 'true');
}

function showGallerySection() {
    if (modalGallerySection) modalGallerySection.hidden = false;
    if (modalFormSection) modalFormSection.hidden = true;
    if (modalTitle) modalTitle.textContent = 'Galerie photo';
}

function showFormSection() {
    if (modalGallerySection) modalGallerySection.hidden = true;
    if (modalFormSection) modalFormSection.hidden = false;
    if (modalTitle) modalTitle.textContent = 'Ajout photo';
    populateCategorySelect();
    resetAddPhotoFormUi();
}

function resetAddPhotoFormUi() {
    if (photoPreviewImg) {
        photoPreviewImg.src = '';
        photoPreviewImg.hidden = true;
    }
    if (photoUploadIcon) photoUploadIcon.hidden = false;
    if (photoAddBtn) photoAddBtn.hidden = false;
    setSubmitEnabled(false);
}

function setSubmitEnabled(enabled) {
    if (!photoSubmitBtn) return;
    photoSubmitBtn.disabled = !enabled;
}

function isAddPhotoFormValid() {
    const file = photoFileInput && photoFileInput.files ? photoFileInput.files[0] : null;
    const title = photoTitleInput ? photoTitleInput.value.trim() : '';
    const category = photoCategorySelect ? photoCategorySelect.value : '';
    return Boolean(file && title && category);
}

function updateAddPhotoFormState() {
    setSubmitEnabled(isAddPhotoFormValid());
}

if (portfolioEditBtn) {
    portfolioEditBtn.addEventListener('click', openModal);
}

if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeModal);
}

if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
    });
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay && modalOverlay.classList.contains('open')) {
        closeModal();
    }
});

if (modalAddPhotoBtn) {
    modalAddPhotoBtn.addEventListener('click', showFormSection);
}

if (modalBackBtn) {
    modalBackBtn.addEventListener('click', () => {
        if (addPhotoForm) addPhotoForm.reset();
        resetAddPhotoFormUi();
        showGallerySection();
    });
}

if (photoAddBtn && photoFileInput) {
    photoAddBtn.addEventListener('click', () => {
        photoFileInput.click();
    });
}

if (photoFileInput) {
    photoFileInput.addEventListener('change', () => {
        const file = photoFileInput.files ? photoFileInput.files[0] : null;
        if (!file) {
            resetAddPhotoFormUi();
            updateAddPhotoFormState();
            return;
        }

        const maxBytes = 4 * 1024 * 1024;
        const allowedTypes = ['image/jpeg', 'image/png'];
        if (!allowedTypes.includes(file.type) || file.size > maxBytes) {
            alert('Veuillez sélectionner une image jpg ou png de 4 Mo maximum');
            photoFileInput.value = '';
            resetAddPhotoFormUi();
            updateAddPhotoFormState();
            return;
        }

        const url = URL.createObjectURL(file);
        if (photoPreviewImg) {
            photoPreviewImg.src = url;
            photoPreviewImg.hidden = false;
        }
        if (photoUploadIcon) photoUploadIcon.hidden = true;
        if (photoAddBtn) photoAddBtn.hidden = true;
        updateAddPhotoFormState();
    });
}

if (photoTitleInput) {
    photoTitleInput.addEventListener('input', updateAddPhotoFormState);
}

if (photoCategorySelect) {
    photoCategorySelect.addEventListener('change', updateAddPhotoFormState);
}

// Fait un GET pour récupérer les œuvres depuis l'API
async function getWorks() {
    try {
        const response = await fetch(`${apiUrl}/works`);
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
        }
        allWorks = await response.json();
        displayWorks(allWorks);
        renderModalGallery();
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
}


// Affiche les œuvres dans la galerie
function displayWorks(works) {
    gallery.innerHTML = '';
    works.forEach(work => {
        const figure = document.createElement('figure');
        
        const img = document.createElement('img');
        img.src = work.imageUrl;
        img.alt = work.title;
        
        const figcaption = document.createElement('figcaption');
        figcaption.textContent = work.title;
        
        figure.appendChild(img);
        figure.appendChild(figcaption);
        gallery.appendChild(figure);
    });
}

function populateCategorySelect() {
    if (!photoCategorySelect) return;
    photoCategorySelect.innerHTML = '';

    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = '';
    photoCategorySelect.appendChild(placeholder);

    allCategories.forEach((category) => {
        const option = document.createElement('option');
        option.value = String(category.id);
        option.textContent = category.name;
        photoCategorySelect.appendChild(option);
    });
}

function renderModalGallery() {
    if (!modalGallery) return;
    if (!document.body.classList.contains('is-authenticated')) return;

    modalGallery.innerHTML = '';
    allWorks.forEach((work) => {
        const item = document.createElement('div');
        item.classList.add('modal-item');

        const img = document.createElement('img');
        img.src = work.imageUrl;
        img.alt = work.title;

        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.classList.add('modal-delete');
        deleteBtn.setAttribute('aria-label', 'Supprimer');
        deleteBtn.dataset.id = String(work.id);
        deleteBtn.addEventListener('click', async () => {
            await deleteWork(work.id);
        });

        item.appendChild(img);
        item.appendChild(deleteBtn);
        modalGallery.appendChild(item);
    });
}

async function deleteWork(id) {
    const token = getToken();
    if (!token) return;

    try {
        const response = await fetch(`${apiUrl}/works/${id}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok && response.status !== 204) {
            throw new Error(`Failed to delete work: ${response.status} ${response.statusText}`);
        }

        await getWorks();
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
}

if (addPhotoForm) {
    addPhotoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const token = getToken();
        if (!token) return;

        const file = photoFileInput && photoFileInput.files ? photoFileInput.files[0] : null;
        const title = photoTitleInput ? photoTitleInput.value.trim() : '';
        const category = photoCategorySelect ? photoCategorySelect.value : '';

        if (!file || !title || !category) {
            alert('Veuillez renseigner une image, un titre et une catégorie');
            return;
        }

        const formData = new FormData();
        formData.append('image', file);
        formData.append('title', title);
        formData.append('category', category);

        try {
            const response = await fetch(`${apiUrl}/works`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Failed to add work: ${response.status} ${response.statusText}`);
            }

            addPhotoForm.reset();
            resetAddPhotoFormUi();
            showGallerySection();
            await getWorks();
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
            alert('Une erreur est survenue lors de l\'ajout de la photo');
        }
    });
}

getWorks();
getCategories();

// Fetch categories
async function fetchCategories() {
    try {
        const response = await fetch(`${apiUrl}/categories`);
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        return [];
    }
}

async function getCategories() {
    allCategories = await fetchCategories();
    displayFilters(allCategories);
    populateCategorySelect();
}

// Display filters
function displayFilters(categories) {
    filtersContainer.innerHTML = '';
    // Create 'Tous' button
    const allBtn = document.createElement('button');
    allBtn.textContent = 'Tous';
    allBtn.classList.add('filter-btn', 'active');
    allBtn.addEventListener('click', () => handleFilterClick(null, allBtn));
    filtersContainer.appendChild(allBtn);

    // Create category buttons
    categories.forEach(category => {
        const btn = document.createElement('button');
        btn.textContent = category.name;
        btn.classList.add('filter-btn');
        btn.addEventListener('click', () => handleFilterClick(category.id, btn));
        filtersContainer.appendChild(btn);
    });
}

// Handle filter click
function handleFilterClick(categoryId, clickedBtn) {
    const buttons = document.querySelectorAll('.filter-btn');

    // Toggle logic: if clicking the active category (and it's not null/Tous), clear the filter
    if (activeCategoryId === categoryId && categoryId !== null) {
        // Reset to "Tous"
        categoryId = null;
        // Find the "Tous" button (first one)
        clickedBtn = buttons[0];
    }

    activeCategoryId = categoryId;

    // Update active class
    buttons.forEach(btn => btn.classList.remove('active'));
    clickedBtn.classList.add('active');

    // Filter works
    const filteredWorks = categoryId === null 
        ? allWorks 
        : allWorks.filter(work => work.categoryId === categoryId);

    displayWorks(filteredWorks);
}
