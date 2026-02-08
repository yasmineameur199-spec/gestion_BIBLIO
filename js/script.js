const STORAGE_KEY = 'bibliotech_books_v1';

let books = [];
let nextId = 1;

// Chargement au démarrage
document.addEventListener('DOMContentLoaded', () => {
    loadFromStorage();
    renderBooks();
    
    document.getElementById('add_button').addEventListener('click', addBook);
    document.getElementById('search_input').addEventListener('input', filterBooks);
    document.getElementById('reset_button').addEventListener('click', resetAll);
});

function loadFromStorage() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
        try {
            books = JSON.parse(data);
            if (books.length > 0) {
                nextId = Math.max(...books.map(b => b.id)) + 1;
            }
        } catch (e) {
            showMessage('Erreur de chargement des données', true);
            books = [];
        }
    }
}

function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
}

function addBook() {
    const title = document.getElementById('title_input').value.trim();
    const author = document.getElementById('author_input').value.trim();
    const category = document.getElementById('category_select').value;
    const isbn = document.getElementById('isbn_input').value.trim();

    if (!title || !author || isbn.length < 4) {
        showMessage('Veuillez remplir correctement tous les champs', true);
        return;
    }

    const book = {
        id: nextId++,
        title,
        author,
        category,
        isbn,
        addedDate: new Date().toLocaleDateString('fr-FR')
    };

    books.push(book);
    saveToStorage();
    renderBooks();
    clearForm();
    showMessage('Livre ajouté avec succès !');
}

function deleteBook(id) {
    if (!confirm('Supprimer ce livre ?')) return;
    books = books.filter(b => b.id !== id);
    saveToStorage();
    renderBooks();
    showMessage('Livre supprimé');
}

function renderBooks(filtered = books) {
    const tbody = document.getElementById('books_tbody');
    tbody.innerHTML = '';

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5">Aucun livre trouvé</td></tr>';
        return;
    }

    filtered.forEach(book => {
        const tr = document.createElement('tr');

        tr.innerHTML = `
            <td>${book.id}</td>
            <td><strong>${escapeHtml(book.title)}</strong><br><em>${escapeHtml(book.author)}</em></td>
            <td><span class="badge">${escapeHtml(book.category)}</span></td>
            <td>${escapeHtml(book.isbn)} | ${book.addedDate}</td>
            <td><button class="btn-delete" onclick="deleteBook(${book.id})">Supprimer</button></td>
        `;

        tbody.appendChild(tr);
    });

    document.getElementById('book_count').textContent = filtered.length;
}

function filterBooks() {
    const term = document.getElementById('search_input').value.toUpperCase();
    const filtered = books.filter(book =>
        book.title.toUpperCase().includes(term) ||
        book.author.toUpperCase().includes(term)
    );
    renderBooks(filtered);
}

function clearForm() {
    document.getElementById('title_input').value = '';
    document.getElementById('author_input').value = '';
    document.getElementById('isbn_input').value = '';
}

function resetAll() {
    if (!confirm('Êtes-vous sûr de vouloir tout effacer ? Cette action est irréversible !')) return;
    localStorage.removeItem(STORAGE_KEY);
    books = [];
    nextId = 1;
    renderBooks();
    showMessage('Base réinitialisée');
}

function showMessage(text, isError = false) {
    const zone = document.getElementById('message_zone');
    zone.textContent = text;
    zone.style.color = isError ? '#f44336' : '#ffeb3b';
    setTimeout(() => zone.textContent = '', 3000);
}

// Fonction d'échappement XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}