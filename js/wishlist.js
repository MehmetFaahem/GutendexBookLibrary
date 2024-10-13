const API_URL = "https://gutendex.com/books";
const wishlistContainer = document.getElementById("wishlist-container");

async function fetchBook(bookId) {
  try {
    const response = await fetch(`${API_URL}/${bookId}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching book:", error);
    return null;
  }
}

function getWishlist() {
  return JSON.parse(localStorage.getItem("wishlist")) || [];
}

function saveWishlist(wishlist) {
  localStorage.setItem("wishlist", JSON.stringify(wishlist));
}

function removeFromWishlist(bookId) {
  const wishlist = getWishlist();
  const index = wishlist.indexOf(bookId);

  if (index !== -1) {
    wishlist.splice(index, 1);
    saveWishlist(wishlist);
    loadWishlist();
  }
}

async function loadWishlist() {
  const wishlist = getWishlist();
  if (wishlist.length === 0) {
    wishlistContainer.innerHTML = "<p>Your wishlist is empty</p>";
    return;
  }

  wishlistContainer.innerHTML = "";

  for (const bookId of wishlist) {
    const book = await fetchBook(bookId);
    if (book) {
      const bookCard = document.createElement("div");
      bookCard.classList.add("book-card");

      const coverImg =
        book.formats["image/jpeg"] ||
        "https://via.placeholder.com/200x300?text=No+Cover";
      const authors = book.authors.map((author) => author.name).join(", ");
      const genres = book.bookshelves.join(", ") || "N/A";

      bookCard.innerHTML = `
                <a href="book-details.html?id=${book.id}" class="book-link">
                    <img src="${coverImg}" alt="${book.title} cover">
                    <h3>${book.title}</h3>
                    <p>Author: ${authors}</p>
                    <p>Genre: ${genres}</p>
                    <p>ID: ${book.id}</p>
                </a>
                <button class="remove-btn" data-id="${book.id}">Remove from Wishlist</button>
            `;

      wishlistContainer.appendChild(bookCard);
    }
  }
}

wishlistContainer.addEventListener("click", (e) => {
  if (e.target.classList.contains("remove-btn")) {
    const bookId = parseInt(e.target.dataset.id);
    removeFromWishlist(bookId);
  }
});

loadWishlist();
