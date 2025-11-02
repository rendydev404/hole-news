// Menggunakan node-fetch untuk melakukan request di lingkungan Node.js
import fetch from 'node-fetch';

// Fungsi handler untuk Vercel
export default async function handler(request, response) {
  // Ambil API key dari environment variable
  const apiKey = process.env.NEWS_API_KEY;
  // Ambil query pencarian dari request, jika tidak ada, default ke "indonesia"
  const query = request.query.q || 'indonesia';
  
  let apiUrl;
  // Cek jika query untuk ticker berita, gunakan endpoint top-headlines
  if (query === 'breaking') {
    // Mengambil berita utama dari Amerika Serikat sebagai contoh
    apiUrl = `https://newsapi.org/v2/top-headlines?country=us&apiKey=${apiKey}`;
  } else {
    // Gunakan endpoint "everything" untuk pencarian dan kategori
    apiUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&apiKey=${apiKey}`;
  }

  try {
    const apiResponse = await fetch(apiUrl);
    const data = await apiResponse.json();

    // Jika newsapi mengembalikan error
    if (apiResponse.status !== 200) {
      response.status(apiResponse.status).json({ message: data.message || 'Error fetching news' });
      return;
    }

    // Kirim data kembali ke client
    response.status(200).json(data);

  } catch (error) {
    response.status(500).json({ message: 'Internal Server Error' });
  }
}
