const API_URL = "https://gutendex.com/books";
const bookDetailsContainer = document.getElementById("book-details");
const backBtn = document.getElementById("back-btn");
const loadingIndicator = document.getElementById("loading-indicator");

async function fetchBookDetails(bookId) {
  loadingIndicator.style.display = "block";
  try {
    const response = await fetch(`${API_URL}/${bookId}`);
    const book = await response.json();
    loadingIndicator.style.display = "none";
    return book;
  } catch (error) {
    console.error("Error fetching book details:", error);
    return null;
  }
}

function displayBookDetails(book) {
  const coverImg =
    book.formats["image/jpeg"] ||
    "https://via.placeholder.com/200x300?text=No+Cover";
  const authors = book.authors.map((author) => author.name).join(", ");
  const genres = book.bookshelves.join(", ") || "N/A";

  bookDetailsContainer.innerHTML = `
    <div class="book-details">
      <img src="${coverImg}" alt="${book.title} cover" class="book-cover">
      <div class="book-info">
        <h2>${book.title}</h2>
        <p><strong>Author(s):</strong> ${authors}</p>
        <p><strong>Genre(s):</strong> ${genres}</p>
        <p><strong>Download count:</strong> ${book.download_count}</p>
        <p><strong>Languages:</strong> ${Object.keys(book.languages).join(
          ", "
        )}</p>
        <h3>Download:</h3>
        <ul>
          ${Object.entries(book.formats)
            .map(
              ([format, url]) =>
                `<li><a href="${url}" target="_blank">${format}</a></li>`
            )
            .join("")}
        </ul>
      </div>
    </div>
  `;
}

async function loadBookDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const bookId = urlParams.get("id");

  if (bookId) {
    const book = await fetchBookDetails(bookId);
    if (book) {
      displayBookDetails(book);
    } else {
      bookDetailsContainer.innerHTML = "<p>Error loading book details</p>";
    }
  } else {
    bookDetailsContainer.innerHTML = "<p>No book ID provided</p>";
  }
}

backBtn.addEventListener("click", () => {
  window.history.back();
});

loadBookDetails();
