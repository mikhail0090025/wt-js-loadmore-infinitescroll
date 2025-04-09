import apiService from './api';
import { lightbox } from './lightbox';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

const searchButton = document.getElementById("search-button");
const galleryContainer = document.querySelector('.gallery');
const searchQueryInput = document.querySelector('#search-bar');
const loadMoreButton = document.querySelector('.btn__load-more')

let isShown = 0;
let isFirstSearch = true;
let query = ''

searchButton.addEventListener("click", function (event) {
    event.preventDefault();
    onSearch();
    isFirstSearch = true;
});

searchQueryInput.addEventListener("keydown", function (event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        onSearch();
    }
    isFirstSearch = true;
});

async function onSearch() {
    const searchQuery = searchQueryInput.value.trim();

    apiService.setQuery(searchQuery);

    if (searchQuery === '') {
        loadMoreButton.classList.add('is-hidden')
        showWarningToast('Будь ласка, заповніть поле пошуку');
        return;
    }

    if (searchQuery === query) {
        loadMoreButton.classList.add('is-hidden')
        showWarningToast('Будь ласка, змініть або введіть новий запит до поля пошуку.');
        return;
    }

    galleryContainer.innerHTML = '';
    apiService.resetPage();
    query = searchQuery;
    isShown = 0;
    await fetchGallery();
}

async function fetchGallery() {
    try {
        const result = await apiService.fetchGallery();
        const { hits, totalHits } = result;

        if (!hits.length) {
            loadMoreButton.classList.add('is-hidden')
            showErrorToast("Вибачте, немає зображень, які відповідають вашому запиту. Будь ласка, спробуйте ще раз.");
            return;
        }

        if (isFirstSearch && isShown < totalHits) {
            showSuccessToast(`Ура! Ми знайшли ${totalHits} зображень !!!`);
            isFirstSearch = false;
            loadMoreButton.classList.remove('is-hidden')
        }

        onRenderGallery(hits);
        isShown += hits.length;

        if (isShown >= totalHits) {
            loadMoreButton.classList.add('is-hidden')
            showInfoToast("Ви досягли кінця результатів пошуку.");
        }
    } catch (error) {
        console.error("Помилка отримання галереї:", error);
        showErrorToast("Під час отримання галереї сталася помилка.");
    }
}

function onRenderGallery(elements) {
    const markup = elements.map(({ webformatURL, largeImageURL, tags, likes, views, downloads }) => {
        return `
      <div class="photo-card">
        <a href="${largeImageURL}">
          <img class="photo-img" src="${webformatURL}" alt="${tags}" loading="lazy" />
        </a>
        <div class="info">
          <p class="info-item"><b>Likes</b><span class="info__span">${likes}</span></p>
          <p class="info-item"><b>Views</b><span class="info__span">${views}</span></p>
          <p class="info-item"><b>Downloads</b><span class="info__span">${downloads}</span></p>
        </div>
      </div>`;
    }).join('');

    galleryContainer.insertAdjacentHTML('beforeend', markup);
    lightbox.refresh();
}

loadMoreButton.addEventListener("click", async () => {
    apiService.incrementPage()
    await fetchGallery();
});

function showWarningToast(message) {
    iziToast.warning({
        title: 'Warning',
        message: message,
        position: 'topRight',
        color: 'yellow',
        timeout: 4000,
        closeOnEscape: true,
        closeOnClick: true,
    });
}

function showErrorToast(message) {
    iziToast.error({
        title: 'Error',
        message: message,
        position: 'topRight',
        color: 'red',
        timeout: 3000,
        closeOnEscape: true,
        closeOnClick: true,
    });
}

function showSuccessToast(message) {
    iziToast.success({
        title: 'Success',
        message: message,
        position: 'topRight',
        color: 'green',
        timeout: 2000,
        closeOnEscape: true,
        closeOnClick: true,
    });
}

function showInfoToast(message) {
    iziToast.info({
        title: 'Info',
        message: message,
        position: 'topRight',
        color: 'blue',
        timeout: 3000,
        closeOnEscape: true,
        closeOnClick: true,
    });
}