// Wait for the document to be fully loaded
$(document).ready(function () {
    // --- jQuery DOM Elements ---
    const $newsContainer = $('#news-container');
    const $searchInput = $('#search-input');
    const $searchButton = $('#search-button');
    const $searchInputMobile = $('#search-input-mobile');
    const $searchButtonMobile = $('#search-button-mobile');
    const $loader = $('#loader');
    const $categoryNav = $('.category-nav');
    const $themeIcon = $('#theme-icon');
    const $seeMoreButton = $('#see-more-button');
    const $htmlElement = $('html');
    const $tickerMove = $('.ticker-move');
    const $scrollToTopButton = $('#scroll-to-top-button');

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
            $htmlElement.removeClass('light').addClass('dark');
            $themeIcon.html(sunIcon);
        } else {
            $htmlElement.removeClass('dark').addClass('light');
            $themeIcon.html(moonIcon);
        }
        localStorage.setItem('newsTheme', theme);
    };

    $themeIcon.on('click', () => {
        const newTheme = $htmlElement.hasClass('dark') ? 'light' : 'dark';
        applyTheme(newTheme);
    });

    // --- Time Formatter (No jQuery needed) ---
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
        $newsContainer.empty(); // More efficient than .html('')
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
            $newsContainer.append(skeletonCard);
        }
    };

    // --- News Fetching and Displaying ---
    const fetchNews = (queryOrCategory) => {
        currentQuery = queryOrCategory;
        displaySkeletonLoader();
        $seeMoreButton.hide();

        $.ajax({
            url: `/api/get-news?q=${encodeURIComponent(currentQuery)}`,
            method: 'GET',
            dataType: 'json',
            success: function (data) {
                allArticles = data.articles.filter(article => article.title && article.description && article.urlToImage);
                articlesToShow = 6;
                displayNews();
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.error("Error fetching news:", textStatus, errorThrown);
                $newsContainer.html(`<div class="col-span-1 md:col-span-2 lg:col-span-3 text-center text-red-500">Failed to load news. ${errorThrown}</div>`);
            }
        });
    };

    const displayNews = () => {
        $newsContainer.empty();

        if (!allArticles || allArticles.length === 0) {
            $newsContainer.html('<div class="col-span-1 md:col-span-2 lg:col-span-3 text-center">No news found.</div>');
            $seeMoreButton.hide();
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
            $newsContainer.append(newsCard);
        });

        if (allArticles.length > articlesToShow) {
            $seeMoreButton.show();
        } else {
            $seeMoreButton.hide();
        }
    };

    $seeMoreButton.on('click', () => {
        articlesToShow += 6;
        displayNews();
    });

    // --- Event Listeners ---
    const handleSearch = () => {
        const query = $searchInput.val().trim();
        const queryMobile = $searchInputMobile.val().trim();
        const finalQuery = query || queryMobile;

        if (finalQuery && finalQuery !== currentCategory) {
            currentCategory = ''; // Reset category when searching
            fetchNews(finalQuery);
            $('.category-button.active').removeClass('active');
        }
    };

    // Combine search handlers
    $searchButton.add($searchButtonMobile).on('click', handleSearch);
    $searchInput.add($searchInputMobile).on('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleSearch();
        }
    });

    // Event delegation for category buttons
    $categoryNav.on('click', '.category-button', function () {
        const $this = $(this);
        $('.category-button.active').removeClass('active');
        $this.addClass('active');
        const category = $this.data('category');
        currentCategory = category;
        fetchNews(category);
    });

    // --- Scroll to Top ---
    $(window).on('scroll', function() {
        if ($(this).scrollTop() > 300) {
            $scrollToTopButton.fadeIn();
        } else {
            $scrollToTopButton.fadeOut();
        }
    });

    $scrollToTopButton.on('click', function() {
        $('html, body').animate({ scrollTop: 0 }, 500);
    });

    // --- Ticker ---
    const fetchTickerNews = () => {
        $.ajax({
            url: `/api/get-news?q=breaking`,
            method: 'GET',
            dataType: 'json',
            success: function (data) {
                const tickerArticles = data.articles.filter(article => article.title).slice(0, 15);
                renderTicker(tickerArticles);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.error("Error fetching ticker news:", textStatus, errorThrown);
                $tickerMove.html('<div class="ticker-item">Could not load breaking news.</div>');
            }
        });
    };

    const renderTicker = (articles) => {
        if (!articles || articles.length === 0) {
            $tickerMove.html('<div class="ticker-item">No breaking news available.</div>');
            return;
        }

        // 1. Populate with original items
        let originalItemsHtml = '';
        articles.forEach(article => {
            originalItemsHtml += `<div class="ticker-item"><a href="${article.url}" target="_blank" rel="noopener noreferrer">${article.title}</a></div>`;
        });

        // 2. Duplicate the content for a seamless loop
        $tickerMove.html(originalItemsHtml + originalItemsHtml);

        // 3. Calculate width and set animation duration
        // Use a timeout to let the browser calculate the new widths
        setTimeout(() => {
            const containerWidth = $tickerMove.parent().width();
            let contentWidth = 0;
            $tickerMove.children().each(function() {
                contentWidth += $(this).outerWidth(true);
            });
            
            const animationWidth = contentWidth / 2;

            if (animationWidth < containerWidth) {
                $tickerMove.css('animation', 'none');
                $tickerMove.html(originalItemsHtml);
                return;
            }

            const speed = 80; // pixels per second
            const duration = animationWidth / speed;

            $tickerMove.css('animation-duration', `${duration}s`);
        }, 100);
    };


    // --- Initial Load ---
    function initialize() {
        const savedTheme = localStorage.getItem('newsTheme');
        if (savedTheme) {
            applyTheme(savedTheme);
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            applyTheme('dark');
        } else {
            applyTheme('light');
        }
        fetchNews(currentCategory);
        fetchTickerNews();
    }

    initialize();
});