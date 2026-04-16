const BOOK_API_URL = 'https://app-pet-backend.onrender.com/api/books';

const bookForm = document.getElementById('book-form');
const bookId = document.getElementById('book-id');
const bookTitle = document.getElementById('book-title');
const bookAuthor = document.getElementById('book-author');
const bookGenre = document.getElementById('book-genre');
const bookStatus = document.getElementById('book-status');
const bookRating = document.getElementById('book-rating');
const booksList = document.getElementById('books-list');
const cancelBookEdit = document.getElementById('cancel-book-edit');

function updateRatingState() {
  const isRead = bookStatus.value === 'Lido';

  bookRating.disabled = !isRead;
  bookRating.required = isRead;

  if (!isRead) {
    bookRating.value = '';
  }
}

function clearBookForm() {
  if (!bookForm) return;

  bookForm.reset();
  bookId.value = '';
  cancelBookEdit.classList.add('hidden');
  updateRatingState();
}

async function loadBooks() {
  if (!booksList) return;

  try {
    const response = await fetch(BOOK_API_URL);
    const books = await response.json();

    if (!books.length) {
      booksList.innerHTML = '<p>Nenhum livro cadastrado.</p>';
      return;
    }

    booksList.innerHTML = books.map(book => `
      <div class="entry-item">
        <h3>${book.title}</h3>
        <p><strong>Autor:</strong> ${book.author}</p>
        <p><strong>Gênero:</strong> ${book.genre}</p>
        <p><strong>Status:</strong> ${book.status}</p>
        <p><strong>Nota:</strong> ${book.rating ?? 'Sem nota'}</p>
        <div class="entry-buttons">
          <button onclick="editBook('${book._id}')">Editar</button>
          <button onclick="deleteBook('${book._id}')">Excluir</button>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Erro ao carregar livros:', error);
  }
}

async function saveBook(data) {
  const id = bookId.value;
  const url = id ? `${BOOK_API_URL}/${id}` : BOOK_API_URL;
  const method = id ? 'PUT' : 'POST';

  await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}

window.editBook = async function (id) {
  try {
    const response = await fetch(`${BOOK_API_URL}/${id}`);
    const book = await response.json();

    bookId.value = book._id;
    bookTitle.value = book.title;
    bookAuthor.value = book.author;
    bookGenre.value = book.genre;
    bookStatus.value = book.status;

    updateRatingState();

    if (book.status === 'Lido' && book.rating !== null && book.rating !== undefined) {
      bookRating.value = book.rating;
    }

    cancelBookEdit.classList.remove('hidden');
  } catch (error) {
    console.error('Erro ao buscar livro:', error);
  }
};

window.deleteBook = async function (id) {
  if (!confirm('Deseja excluir este livro?')) return;

  try {
    await fetch(`${BOOK_API_URL}/${id}`, { method: 'DELETE' });
    loadBooks();
  } catch (error) {
    console.error('Erro ao excluir livro:', error);
  }
};

if (bookStatus) {
  bookStatus.addEventListener('change', updateRatingState);
}

if (bookForm) {
  bookForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
      title: bookTitle.value,
      author: bookAuthor.value,
      genre: bookGenre.value,
      status: bookStatus.value,
      rating: bookStatus.value === 'Lido' ? Number(bookRating.value) : null
    };

    try {
      await saveBook(data);
      clearBookForm();
      loadBooks();
    } catch (error) {
      console.error('Erro ao salvar livro:', error);
    }
  });
}

if (cancelBookEdit) {
  cancelBookEdit.addEventListener('click', () => {
    clearBookForm();
  });
}

updateRatingState();
loadBooks();