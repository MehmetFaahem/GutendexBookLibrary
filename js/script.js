const API_URL = "https://gutendex.com/books";
const booksContainer = document.getElementById("books-container");
const searchInput = document.getElementById("search");
const genreFilter = document.getElementById("genre-filter");
const prevPageBtn = document.getElementById("prev-page");
const nextPageBtn = document.getElementById("next-page");
const pageNumbers = document.getElementById("page-numbers");
const loadingIndicator = document.getElementById("loading-indicator");
const filterBtn = document.getElementById("filter-btn");
let currentPage = 1;
let booksPerPage = 20;
let totalPages = 0;
let currentBooks = [];

const savedSearch = localStorage.getItem("bookSearch") || "";
const savedGenre = localStorage.getItem("bookGenre") || "";
searchInput.value = savedSearch;
genreFilter.value = savedGenre;

async function fetchBooks(page = 1) {
  loadingIndicator.style.display = "block";
  const searchTerm = searchInput.value;
  const genre = genreFilter.value;
  const url = `${API_URL}?page=${page}&search=${searchTerm}&topic=${genre}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    totalPages = Math.ceil(data.count / booksPerPage);
    return data.results;
  } catch (error) {
    console.error("Error fetching books:", error);
    booksContainer.innerHTML = "<p>Error fetching books</p>";
    return [];
  } finally {
    loadingIndicator.style.display = "none";
  }
}

function displayBooks(books) {
  booksContainer.innerHTML = "";
  books.forEach((book) => {
    const bookCard = document.createElement("div");
    bookCard.classList.add("book-card");

    const filteredBook = {
      coverImg:
        book.formats["image/jpeg"] ||
        "https://via.placeholder.com/200x300?text=No+Cover",
      title: book.title,
      authors: book.authors.map((author) => author.name).join(", "),
      genres: book.bookshelves.join(", ").replace(/Browsing:/g, "") || "N/A",
      id: book.id,
    };

    bookCard.innerHTML = `
      <a href="book-details.html?id=${filteredBook.id}" class="book-link">
        <img src="${filteredBook.coverImg}" alt="${filteredBook.title} cover">
        <h3>${filteredBook.title}</h3>
        <p>Author: ${filteredBook.authors}</p>
        <p>Genre: ${filteredBook.genres}</p>
        <p>ID: ${filteredBook.id}</p>
      </a>
      <button class="wishlist-btn" data-id="${filteredBook.id}">
        ${isWishlisted(filteredBook.id) ? "❤️" : "🤍"}
      </button>
    `;

    booksContainer.appendChild(bookCard);
  });

  updatePagination();
}

function updatePagination() {
  prevPageBtn.disabled = currentPage === 1;
  nextPageBtn.disabled = currentPage === totalPages;
  if (totalPages === 0) {
    pageNumbers.innerHTML = "<p>No books found</p>";
    return;
  }

  pageNumbers.innerHTML = "";
  const startPage = Math.max(1, currentPage - 4);
  const endPage = Math.min(totalPages, startPage + 9);

  if (startPage > 1) {
    addPageNumber(1);
    if (startPage > 2) {
      pageNumbers.appendChild(document.createTextNode("..."));
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    addPageNumber(i);
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      pageNumbers.appendChild(document.createTextNode("..."));
    }
    addPageNumber(totalPages);
  }

  function addPageNumber(i) {
    const pageNumber = document.createElement("span");
    pageNumber.classList.add("page-number");
    if (i === currentPage) pageNumber.classList.add("active");
    pageNumber.textContent = i;
    pageNumber.addEventListener("click", () => {
      currentPage = i;
      loadBooks();
    });
    pageNumbers.appendChild(pageNumber);
  }
}

async function loadBooks() {
  const books = await fetchBooks(currentPage);
  currentBooks = books;
  displayBooks(books);
}

// Initialize genres
async function initializeGenres() {
  const books = await fetchBooks();
  const genres = new Set();
  books.forEach((book) =>
    book.bookshelves.forEach((genre) => genres.add(genre))
  );

  genres.forEach((genre) => {
    const option = document.createElement("option");
    option.value = genre;
    option.textContent = genre;
    genreFilter.appendChild(option);
  });
}

function getWishlist() {
  return JSON.parse(localStorage.getItem("wishlist")) || [];
}

function saveWishlist(wishlist) {
  localStorage.setItem("wishlist", JSON.stringify(wishlist));
}

function isWishlisted(bookId) {
  return getWishlist().includes(bookId);
}

function toggleWishlist(bookId) {
  const wishlist = getWishlist();
  const index = wishlist.indexOf(bookId);

  if (index === -1) {
    wishlist.push(bookId);
  } else {
    wishlist.splice(index, 1);
  }

  saveWishlist(wishlist);
  displayBooks(currentBooks);
}

searchInput.addEventListener("input", () => {
  currentPage = 1;
  localStorage.setItem("bookSearch", searchInput.value);
  loadBooks();
});

genreFilter.addEventListener("change", () => {
  currentPage = 1;
  localStorage.setItem("bookGenre", genreFilter.value);
  loadBooks();
});

prevPageBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    loadBooks();
  }
});

nextPageBtn.addEventListener("click", () => {
  if (currentPage < totalPages) {
    currentPage++;
    loadBooks();
  }
});

booksContainer.addEventListener("click", (e) => {
  if (e.target.classList.contains("wishlist-btn")) {
    const bookId = parseInt(e.target.dataset.id);
    toggleWishlist(bookId);
  }
});

filterBtn.addEventListener("click", () => {
  booksContainer.innerHTML = "";
  loadingIndicator.style.display = "block";
  currentPage = 1;
  loadBooks();
});

initializeGenres();
loadBooks();
