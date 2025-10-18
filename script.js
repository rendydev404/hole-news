// DOM Elements
const newsContainer = document.getElementById('news-container');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const searchInputMobile = document.getElementById('search-input-mobile');
const searchButtonMobile = document.getElementById('search-button-mobile');
const loader = document.getElementById('loader');
const categoryNav = document.querySelector('.category-nav');
const themeIcon = document.getElementById('theme-icon');
const seeMoreButton = document.getElementById('see-more-button');
const htmlElement = document.documentElement;

// --- Icons ---
const sunIcon = `
<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
  <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M12 6a6 6 0 100 12 6 6 0 000-12z" />
</svg>
`;
const moonIcon = `
<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
  <path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
</svg>
`;

let allArticles = [];
let articlesToShow = 6;
let currentCategory = 'indonesia';
let currentQuery = '';

// --- Theme Manager ---
const applyTheme = (theme) => {
    if (theme === 'dark') {
        htmlElement.classList.add('dark');
        htmlElement.classList.remove('light');
        themeIcon.innerHTML = sunIcon;
    } else {
        htmlElement.classList.add('light');
        htmlElement.classList.remove('dark');
        themeIcon.innerHTML = moonIcon;
    }
    localStorage.setItem('newsTheme', theme);
};

themeIcon.addEventListener('click', () => {
    const currentTheme = htmlElement.classList.contains('dark') ? 'dark' : 'light';
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

// --- Skeleton Loader ---
const displaySkeletonLoader = () => {
    newsContainer.innerHTML = '';
    for (let i = 0; i < 6; i++) {
        const skeletonCard = `
            <div class="card animate-pulse">
                <div class="h-48 bg-slate-300 dark:bg-slate-700 rounded-t-lg"></div>
                <div class="p-6">
                    <div class="h-4 bg-slate-300 dark:bg-slate-700 rounded w-3/4 mb-4"></div>
                    <div class="h-3 bg-slate-300 dark:bg-slate-700 rounded w-full mb-2"></div>
                    <div class="h-3 bg-slate-300 dark:bg-slate-700 rounded w-5/6 mb-2"></div>
                    <div class="h-3 bg-slate-300 dark:bg-slate-700 rounded w-4/6 mb-6"></div>
                    <div class="flex justify-between items-center">
                        <div class="h-8 bg-slate-300 dark:bg-slate-700 rounded w-24"></div>
                        <div class="h-3 bg-slate-300 dark:bg-slate-700 rounded w-20"></div>
                    </div>
                </div>
            </div>
        `;
        newsContainer.innerHTML += skeletonCard;
    }
};


// --- News Fetching and Displaying ---
const fetchNews = async (queryOrCategory) => {
    currentQuery = queryOrCategory;
    displaySkeletonLoader();
    seeMoreButton.classList.add('hidden');

    const url = `/api/get-news?q=${encodeURIComponent(currentQuery)}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        const data = await response.json();
        allArticles = data.articles.filter(article => article.title && article.description && article.urlToImage);
        articlesToShow = 6;
        displayNews();
    } catch (error) {
        console.error("Error fetching news:", error);
        newsContainer.innerHTML = `<div class="col-span-1 md:col-span-2 lg:col-span-3 text-center text-red-500">Failed to load news. ${error.message}</div>`;
    }
};

const displayNews = () => {
    newsContainer.innerHTML = '';

    if (!allArticles || allArticles.length === 0) {
        newsContainer.innerHTML = '<div class="col-span-1 md:col-span-2 lg:col-span-3 text-center">No news found.</div>';
        seeMoreButton.classList.add('hidden');
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
            <div class="card rounded-lg overflow-hidden shadow-lg dark:bg-slate-800">
                <img src="${article.urlToImage}" alt="News Image" class="w-full h-48 object-cover">
                <div class="p-6 flex flex-col flex-grow">
                    <h3 class="text-xl font-bold mb-2">${article.title}</h3>
                    <p class="text-slate-600 dark:text-slate-300 flex-grow">${article.description}</p>
                    <div class="flex justify-between items-center mt-4">
                        <a href="${article.url}" target="_blank" rel="noopener noreferrer" class="bg-primary hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">Read More</a>
                        <div class="text-right text-sm text-slate-500 dark:text-slate-400">
                            <span>${timeAgo(article.publishedAt)}</span>
                            <br>
                            <span>${formattedDate}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        newsContainer.innerHTML += newsCard;
    });

    if (allArticles.length > articlesToShow) {
        seeMoreButton.classList.remove('hidden');
    } else {
        seeMoreButton.classList.add('hidden');
    }
};

seeMoreButton.addEventListener('click', () => {
    articlesToShow += 6;
    displayNews();
});

// --- Event Listeners ---
const handleSearch = () => {
    const query = searchInput.value.trim();
    const queryMobile = searchInputMobile.value.trim();
    const finalQuery = query || queryMobile;

    if (finalQuery && finalQuery !== currentCategory) {
        currentCategory = ''; // Reset category when searching
        fetchNews(finalQuery);
        document.querySelector('.category-button.active')?.classList.remove('active');
    }
};

searchButton.addEventListener('click', handleSearch);
searchButtonMobile.addEventListener('click', handleSearch);

searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        handleSearch();
    }
});
searchInputMobile.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        handleSearch();
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
        currentCategory = category;
        fetchNews(category);
    }
});

// --- Initial Load ---
window.addEventListener('load', () => {
    // Load saved theme
    const savedTheme = localStorage.getItem('newsTheme');
    // Set theme based on saved theme or system preference
    if (savedTheme) {
        applyTheme(savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        applyTheme('dark');
    } else {
        applyTheme('light');
    }

    // Load initial news
    fetchNews(currentCategory);
});
