// Menggunakan node-fetch untuk melakukan request di lingkungan Node.js
const fetch = require('node-fetch');

// Fungsi handler untuk Vercel
export default async function handler(request, response) {
  // Ambil API key dari environment variable
  const apiKey = process.env.NEWS_API_KEY;
  // Ambil query pencarian dari request, jika tidak ada, default ke "indonesia"
  const query = request.query.q || 'indonesia';
  
  // Gunakan endpoint "everything" agar pencarian dan kategori berfungsi
  const apiUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&apiKey=${apiKey}`;

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
