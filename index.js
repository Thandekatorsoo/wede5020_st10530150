!function () {
    // Your code here
}();
document.addEventListener('DOMContentLoaded', function () {
    initCart();
    initLightbox();
    initArccordion();
    initSearch();
    initScrollAnimations();
    initforms();
    initMap();
});

/*shopping cart*/
var cart_key = 'cottonOnCart';

function getCart() {
    try {
        return JSON.parse(localStorage.getItem(cart_key)) || [];
    } catch (e) {
        return [];
    }
}

function saveCart(cart) {
    try {
        localStorage.setItem(cart_key, JSON.stringify(cart));
    } catch (e) {
        console.error('Error saving cart to localStorage:', e);
    }
}

function removeItemFromCart(itemId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== itemId);
    saveCart(cart);
    updateCartUI();
}
function clearCart() {
    localStorage.removeItem(cart_key);
    updateCartUI();
}

function cartTotal() {
    let cart = getCart();
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

function initCart() {
    //cart toggle button and drop it into the nav.
    var nav = document.querySelector('header nav ul');
    if (nav && !document.getElementById('cart-toggle')) {
        var li = document.createElement('li');
        var toggleButton = document.createElement('button');
        toggleButton.id = 'cart-toggle';
        toggleButton.innerHTML = 'Cart' + ' (<span id="cart-count">0</span>)';
        li.appendChild(toggleButton);
        nav.appendChild(li);
        toggleButton.addEventListener('click', toggleCartPanel);
    }

    //Cart drawer 
    if (!document.getElementById('cartPanel')) {
        var cartPanel = document.createElement('div');
        panel.id = 'cartPanel';
        Object.assign(cartPanel.style, {
            position: 'fixed',
            top: '0', right: '0',
            width: '320px',
            height: '100%', maxWidth: '90%',
            backgroundColor: '#fff',
            boxShadow: '-3px 0 10px rgba(0,0,0,0.3)',
            padding: '20px',
            overflowY: 'auto',
            zIndex: '1000',
            display: 'none'
        });
        var closeButton = document.createElement('button');
        closeButton.id = 'close-cart';
        closeButton.textContent = 'Close';
        closeButton.style.float = 'right';

        var heading = document.createElement('h2');
        heading.textContent = 'your Cart';

        var list = document.createElement('ul');
        list.id = 'cart-items';
        list.style.listStyle = 'none';
        list.style.padding = '0';

        var total = document.createElement('p');
        total.id = 'cart-total';
        total.style.fontWeight = 'bold';

        var clearButton = document.createElement('button');
        clearButton.id = 'clear-cart';
        clearButton.textContent = 'Clear Cart';
        clearButton.style.marginTop = '10px';

        cartPanel.appendChild(closeButton);
        cartPanel.appendChild(heading);
        cartPanel.appendChild(list);
        cartPanel.appendChild(total);
        cartPanel.appendChild(clearButton);
        document.body.appendChild(cartPanel);

        closeButton.addEventListener('click', toggleCartPanel);
        clearButton.addEventListener('click', clearCart);
    }
    // event delegation 
    document.body.addEventListener('click', function (event) {
        var button = event.target.closest('button[data-action="add-to-cart"]');
        if (button) {
            var info = getProductInfo(button);
            if (info) {
                addToCart(info);
            }
        }
    });
    updateCartUI();
}
/* find product info */
function getProductInfo(button) {
    var container = button.closest('div');
    if (!container) return null;
    varpriceElement = container.querySelector('.product-price');
    if (!priceElement) return null;

    var nameElement = null;
    var sibling = priceElement.previousElementSibling;
    while (sibling) {
        if (sibling.tagName === 'h3') {
            nameElement = sibling;
            break;
            sibling = sibling.previousElementSibling;
        }
        if (!nameElement) nameElement = container.querySelector('h3');

        var priceMatch = priceElement.textContent.match(/[\d,.]+/);
        return {
            name: nameElement ? nameElement.textContent.trim() : 'Product',
            price: priceMatch ? parseFloat(priceMatch[0]) : 0
        };
    }
}
function renderCartItems() {
    var cart = getCart();

    var countElement = document.getElementById('cart-count');
    if (countElement) {
        countElement.textContent = cart.reduce((total, item) => total + item.quantity, 0);
    }

    var list = document.getElementById('cart-items');
    if (!list) {
        list = document.createElement('ul');
        list.id = 'cart-items';
        document.getElementById('cartPanel').appendChild(list);
    }
    list.innerHTML = '';
    cart.forEach(function (item) {
        var li = document.createElement('li');
        li.style.display = 'flex';
        li.style.justifyContent = 'space-between';
        li.style.marginBottom = '8px';
        li.style.alignItems = 'center';
    });

    var label = document.createElement('span');
    label.textContent = `R{item.name} x R{item.quantity} - R{(item.price * item.quantity).toFixed(2)}`;
    li.appendChild(label);

    var removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.addEventListener('click', function () {
        removeFromCart(item.id);

        li.appendChild(removeButton);
        list.appendChild(li);
        li.appendChild(label);
    });

    var total = document.getElementById('cart-total');
    if (total) {
        total.textContent = 'Total: R' + cartTotal().toFixed(2);
    }
}

function toggleCartPanel() {
    var panel = document.getElementById('cartPanel');
    if (panel) {
        panel.style.display = (panel.style.display === 'none' || panel.style.display === '') ? 'block' : 'none';
    }
}

function flashCartButton() {
    var button = document.getElementById('cart-toggle');
    if (!button) return;
    var originalColor = button.style.backgroundColor;
    button.style.backgroundColor = '#28a745'; // Change to a green color to indicate success
    setTimeout(function () {
        button.style.backgroundColor = originalColor;
    }, 300);
}

function joinNow() {
    alert('Thank you for your interest! Please visit our Enquiry page to join our mailing list and receive exclusive offers and updates.');
}

/* search and sort */
function initProductCatalog() {
    var list = document.querySelector('.product-list');
    if (!list) return; // only runs product on html 

    // scrape existing products into into clean array
    var products = [];
    list.querySelectorAll('button').forEach(function (button) {
        if (button.textContent.trim() === 'Add to Cart') return;
        var info = getProductInfo(button);
        var container = button.closest('div');
        var img = container.querySelector('img')
        if (info) {
            products.push({
                name: info.name,
                price: info.price,
                image: img ? img.src : ''
                alt: img ? img.getAttribute('alt') : info.name
            });
        }
    });

    var panel = document.createElement('div');
    panel.id = 'catalogControls';
    panel.style.marginBottom = '20px 0';

    var heading = document.createElement('h2');
    heading.textContent = 'Product shop';

    var search = document.createElement('input');
    search.type = 'text';
    search.placeholder = 'Search products...';
    search.style.padding = '8px';
    search.style.width = '200px';
    search.style.marginRight = '10px';

    var sortSelect = document.createElement('select');
    sort.id = 'product-sort';
    [
        ['default', 'sort by'],
        ['name-asc', 'Name (A-Z)'],
        ['name-desc', 'Name (Z-A)'],
        ['price-asc', 'Price (Low to High)'],
        ['price-desc', 'Price (High to Low)']
    ].forEach(function (option) {
        var opt = document.createElement('option');
        opt.value = option[0];
        opt.textContent = option[1];
        sortSelect.appendChild(opt);

    });

    var results = document.createElement('div');
    results.id = 'catalogResults';
    Object.assign(results.style, {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '20px',
        marginTop: '15px'

    });

    panel.appendChild(heading);
    panel.appendChild(search);
    panel.appendChild(sortSelect);
    panel.appendChild(results);
    list.parentNode.insertBefore(panel, list);

    function renderProducts() {
        var sortValue = sortSelect.value;
        var filtered = products.filter(function (product) {
            return product.name.toLowerCase().indexOf(term) !== -1;
        });

        if (sortValue === 'price-asc') {
            filtered.sort(function (a, b) { return a.price - b.price; });
        } else if (sortValue === 'price-desc') {
            filtered.sort(function (a, b) { return b.price - a.price; });
        } else if (sortValue === 'name-asc') {
            filtered.sort(function (a, b) { return a.name.localeCompare(b.name); });
        } else if (sortValue === 'name-desc') {
            filtered.sort(function (a, b) { return b.name.localeCompare(a.name); });

            results.innerHTML = '';
            if (filtered.length === 0) {
                results.innerHTML = '<p>No products found.</p>';
                return;
            }
            filtered.forEach(function (product) {
                var card = document.createElement('div');
                card.style.border = '1px solid #ccc';
                card.style.padding = '10px';
                card.style.width = 'calc(33% - 20px)';
                card.style.boxSizing = 'border-box';

                var img = document.createElement('img');
                img.src = product.image;
                img.alt = product.alt;
                img.style.width = '150';
                img.style.height = '150';

                var name = document.createElement('h3');
                name.textContent = product.name;

                var price = document.createElement('p');
                price.className = 'product-price';
                price.textContent = 'R' + product.price.toFixed(2);

                var button = document.createElement('button');
                button.textContent = 'Add to Cart';

                card.appendChild(img);
                card.appendChild(name);
                card.appendChild(price);
                card.appendChild(button);
                results.appendChild(card);
            });
        }

        search.addEventListener('input', renderResults);
        sortSelect.addEventListener('change', renderResults);
        renderResults();
    }

    /* image lightbox */
    function initLightbox() {
        if (!document.getElementById('lightbox overlay'))
            var overlay = document.createElement('div');
        overlay.id = 'lightbox-overlay';
        Object.assign(overlay.style, {
            position: 'fixed',
            top: '0', left: '0',
            width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.85)',
            display: 'none', alignItems: 'center',
            justifyContent: 'center',
            zIndex: '2000', cursor: 'zoom-out'
        });

        var img = document.createElement('img');
        img.id = 'lightbox-image';
        Object.assign(img.style, {
            maxWidth: '90%',
            maxHeight: '90%'
        });
    }
    overlay.appendChild(img);
    document.body.appendChild(overlay);

    overlay.addEventListener('click', function () {
        overlay.style.display = 'none';
    });
}


document.addEventListener('click', function (e) {
    if (e.target.matches('.product-list img')) {
        var img = e.target;
        var overlay = document.getElementById('lightbox-overlay');
        var lightboxImg = document.getElementById('lightbox-image');
        lightboxImg.src = img.src;
        overlay.style.display = 'flex';
    }
});

/*accordion*/
function initArccordion() {
    var sections = Array.from(document.querySelectorAll('main > section, body > section'));
    if (sections.length < 2) return;

    sections.forEach(function (section, index) {
        var header = section.querySelector('h2');
        if (header) return;
        if (section.querySelector('form, iframe')) return;

        header.style.cursor = 'pointer';

        var content = document.createElement('div');
        while (header.nextSibling) {
            content.appendChild(header.nextSibling);
        }

        section.appendChild(content);
        content.style.display = index === 0 ? 'block' : 'none';

        var indicator = document.createElement('span');
        indicator.textContent = index === 0 ? '[+]' : '[-]';
        header.appendChild(indicator);

        heading.addEventListener('click', function () {
            var isOpen = content.style.display !== 'none'
            content.style.display = isOpen ? 'none' : 'black';
            indicator.textContent = isOpen ? '[+]' : '[-]'
        });
    });
}


function initScrollAnimations() {
    var target = document.querySelectorAll('main section, .catalog-results > div , main  > div');
    if (!('intersectionObserver' in window)) return;

    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1'
                entry.target

            }


        }
    });
}



function initMap() {
    var mapEl = document.getElementById('map');
    if (!mapEl) return;

    function start() {
        var map = L.map('map').setView([-25.7717, 28.2344], 15);
        L.titleyer('https://{s}.title.openstreetmap.org/{z}/{x}/{y}.png' {
            attribution: '&copy ; openStreetMap contributors'

        }).addTo(map);
        L.marker()
    }

}


