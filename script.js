const apiKey = 'eb11bb2c9b384a718bf81307fd546318';

// DOM Elements
const newsContainer = document.getElementById('news-container');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const loader = document.getElementById('loader');
const categoryNav = document.querySelector('.category-nav');
const themeIcon = document.getElementById('theme-icon');
const seeMoreButton = document.getElementById('see-more-button');
const htmlElement = document.documentElement;

let allArticles = [];
let articlesToShow = 6;

// --- Theme Manager ---
const applyTheme = (theme) => {
    htmlElement.setAttribute('data-bs-theme', theme);
    if (theme === 'dark') {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    } else {
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
    }
    localStorage.setItem('newsTheme', theme);
};

themeIcon.addEventListener('click', () => {
    const currentTheme = htmlElement.getAttribute('data-bs-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
});

// --- Time Formatter ---
const timeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.round((now - date) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);

    if (seconds < 60) return `${seconds} seconds ago`;
    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    return `${days} days ago`;
};

// --- News Fetching and Displaying ---
const fetchNews = async (query) => {
    loader.classList.remove('d-none');
    newsContainer.classList.add('d-none');
    seeMoreButton.classList.add('d-none');

    const url = `https://newsapi.org/v2/everything?q=${query}&apiKey=${apiKey}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            if(response.status === 401) throw new Error('API Key tidak valid.');
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        allArticles = data.articles.filter(article => article.title && article.description && article.urlToImage);
        articlesToShow = 6;
        displayNews();
    } catch (error) {
        console.error("Error fetching news:", error);
        newsContainer.innerHTML = `<div class="col-12"><p class="text-center fs-5 text-danger">Gagal memuat berita. ${error.message}</p></div>`;
    } finally {
        loader.classList.add('d-none');
        newsContainer.classList.remove('d-none');
    }
};

const displayNews = () => {
    newsContainer.innerHTML = '';

    if (!allArticles || allArticles.length === 0) {
        newsContainer.innerHTML = '<div class="col-12"><p class="text-center fs-5">Tidak ada berita yang ditemukan.</p></div>';
        seeMoreButton.classList.add('d-none');
        return;
    }

    const articlesToDisplay = allArticles.slice(0, articlesToShow);

    articlesToDisplay.forEach(article => {
        const formattedDate = new Date(article.publishedAt).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        const newsCard = `
            <div class="col">
                <div class="card h-100 shadow-sm border-0">
                    <img src="${article.urlToImage}" class="card-img-top" alt="News Image" style="height: 220px; object-fit: cover;">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${article.title}</h5>
                        <p class="card-text flex-grow-1">${article.description}</p>
                        <div class="d-flex justify-content-between align-items-center mt-auto">
                            <a href="${article.url}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">Read More</a>
                            <div class="text-end">
                                <small class="text-body-secondary">${timeAgo(article.publishedAt)}</small>
                                <br>
                                <small class="text-body-secondary">
                                    <i class="fas fa-clock me-1"></i>${formattedDate}
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        newsContainer.innerHTML += newsCard;
    });

    if (allArticles.length > articlesToShow) {
        seeMoreButton.classList.remove('d-none');
    } else {
        seeMoreButton.classList.add('d-none');
    }
};

seeMoreButton.addEventListener('click', () => {
    articlesToShow += 6;
    displayNews();
});

// --- Event Listeners ---
searchButton.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (query) {
        fetchNews(query);
        document.querySelector('.category-button.active')?.classList.remove('active');
    }
});

searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        searchButton.click();
    }
});

categoryNav.addEventListener('click', (e) => {
    if (e.target.classList.contains('category-button')) {
        const currentActive = document.querySelector('.category-button.active');
        if (currentActive) {
            currentActive.classList.remove('active');
        }
        e.target.classList.add('active');
        const category = e.target.dataset.category;
        fetchNews(category);
    }
});

// --- Scroll to Top Button --- 
// window.addEventListener('scroll', () => {
//     if (window.scrollY > 200) {
//         toTopButton.classList.remove('d-none');
//     } else {
//         toTopButton.classList.add('d-none');
//     }
// });

// --- Initial Load ---
window.addEventListener('load', () => {
    // Load saved theme
    const savedTheme = localStorage.getItem('newsTheme') || 'light';
    applyTheme(savedTheme);

    // Load initial news
    fetchNews('indonesia');
});