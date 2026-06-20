// product catalog
var PRODUCTS = {
    'prod-1': { id: 'prod-1', name: 'T-SHIRT WITH TAPE DETAILS', price: 120, oldPrice: null, image: 'images/Frame 32.png', description: 'This graphic t-shirt which is perfect for any occasion. Crafted from a soft and breathable fabric, it offers superior comfort and style.', colors: ['white', 'black', 'gray'], sizes: ['Small', 'Medium', 'Large', 'X-Large'], rating: 4.5 },
    'prod-2': { id: 'prod-2', name: 'SKINNY FIT JEANS', price: 240, oldPrice: 260, image: 'images/Frame 33.png', description: 'Slim-fit jeans crafted from premium stretch denim. Features a modern tapered leg and classic five-pocket design.', colors: ['blue', 'black'], sizes: ['Small', 'Medium', 'Large', 'X-Large'], rating: 3.5 },
    'prod-3': { id: 'prod-3', name: 'CHECKERED SHIRT', price: 180, oldPrice: null, image: 'images/Frame 34.png', description: 'A timeless checkered pattern shirt made from lightweight cotton. Perfect for casual and semi-formal occasions.', colors: ['red', 'blue'], sizes: ['Medium', 'Large', 'X-Large'], rating: 4.0 },
    'prod-4': { id: 'prod-4', name: 'SLEEVE STRIPED T-SHIRT', price: 130, oldPrice: 160, image: 'images/Frame 38.png', description: 'Comfortable striped t-shirt with a classic fit. Made from high-quality cotton jersey for everyday wear.', colors: ['white', 'black', 'gray'], sizes: ['Small', 'Medium', 'Large'], rating: 4.5 },
    'prod-5': { id: 'prod-5', name: 'VERTICAL STRIPED SHIRT', price: 212, oldPrice: 232, image: 'images/Frame39.png', description: 'Elegant vertical striped shirt crafted from premium fabric. Features a tailored fit for a sharp look.', colors: ['white', 'blue'], sizes: ['Medium', 'Large', 'X-Large'], rating: 4.0 },
    'prod-6': { id: 'prod-6', name: 'COURAGE GRAPHIC T-SHIRT', price: 145, oldPrice: null, image: 'images/Frame40.png', description: 'Bold graphic t-shirt with a motivational design. Made from soft, breathable cotton for all-day comfort.', colors: ['black', 'white'], sizes: ['Small', 'Medium', 'Large'], rating: 4.0 },
    'prod-7': { id: 'prod-7', name: 'LOOSE FIT BERMUDA SHORTS', price: 80, oldPrice: null, image: 'images/Frame41.png', description: 'Relaxed-fit Bermuda shorts in a comfortable cotton blend. Features an elastic waistband and side pockets.', colors: ['black', 'green', 'blue'], sizes: ['Small', 'Medium', 'Large'], rating: 3.0 },
    'prod-8': { id: 'prod-8', name: 'FADED SKINNY JEANS', price: 210, oldPrice: null, image: 'images/Frame42.png', description: 'Classic faded skinny jeans with a modern stretch fit. Features a mid-rise waist and tapered leg.', colors: ['blue', 'black'], sizes: ['Small', 'Medium', 'Large', 'X-Large'], rating: 4.5 },
    'prod-9': { id: 'prod-9', name: 'GRADIENT GRAPHIC T-SHIRT', price: 145, oldPrice: null, image: 'images/Frame 32.png', description: 'Trendy gradient graphic tee with a unique print. Made from ultra-soft cotton for maximum comfort.', colors: ['white', 'black'], sizes: ['Small', 'Medium', 'Large', 'X-Large'], rating: 4.0 },
    'prod-10': { id: 'prod-10', name: 'POLO WITH TIPPING DETAILS', price: 180, oldPrice: null, image: 'images/Frame 34.png', description: 'Classic polo shirt with contrast tipping details. Crafted from pique cotton for a refined casual look.', colors: ['white', 'blue'], sizes: ['Medium', 'Large', 'X-Large'], rating: 3.5 },
    'prod-11': { id: 'prod-11', name: 'BLACK STRIPED T-SHIRT', price: 120, oldPrice: 150, image: 'images/Frame 38.png', description: 'Sleek black t-shirt with subtle stripe detailing. A versatile wardrobe essential for any occasion.', colors: ['black', 'white'], sizes: ['Small', 'Medium', 'Large', 'X-Large'], rating: 4.0 }
};

// promo codes
var PROMO_CODES = {
    'SAVE10': 10,
    'SAVE20': 20,
    'WELCOME15': 15
};

var DELIVERY_FEE = 15;

// cart module
var Cart = {
    STORAGE_KEY: 'shopco_cart',
    PROMO_KEY: 'shopco_promo',

    getItems: function () {
        var data = localStorage.getItem(Cart.STORAGE_KEY);
        return data ? JSON.parse(data) : {};
    },

    saveItems: function (items) {
        localStorage.setItem(Cart.STORAGE_KEY, JSON.stringify(items));
    },

    getPromo: function () {
        var data = localStorage.getItem(Cart.PROMO_KEY);
        return data ? JSON.parse(data) : null;
    },

    savePromo: function (promo) {
        if (promo) {
            localStorage.setItem(Cart.PROMO_KEY, JSON.stringify(promo));
        } else {
            localStorage.removeItem(Cart.PROMO_KEY);
        }
    },

    generateId: function (productId, size, color) {
        return productId + '-' + (size || 'OS') + '-' + (color || 'NA');
    },

    addItem: function (productId, size, color) {
        var product = PRODUCTS[productId];
        if (!product) return;

        var items = Cart.getItems();
        var cartId = Cart.generateId(productId, size, color);

        if (items[cartId]) {
            items[cartId].quantity += 1;
        } else {
            items[cartId] = {
                id: cartId,
                productId: productId,
                name: product.name,
                price: product.price,
                oldPrice: product.oldPrice,
                image: product.image,
                size: size || 'OS',
                color: color || 'NA',
                quantity: 1
            };
        }
        Cart.saveItems(items);
        Cart.updateBadge();
        Cart.showNotification(product.name + ' added to cart');
    },

    removeItem: function (cartId) {
        var items = Cart.getItems();
        delete items[cartId];
        Cart.saveItems(items);
        Cart.updateBadge();
        if (window.renderCart) window.renderCart();
    },

    updateQuantity: function (cartId, delta) {
        var items = Cart.getItems();
        if (!items[cartId]) return;
        items[cartId].quantity += delta;
        if (items[cartId].quantity <= 0) {
            delete items[cartId];
        }
        Cart.saveItems(items);
        Cart.updateBadge();
        if (window.renderCart) window.renderCart();
    },

    getSubtotal: function () {
        var items = Cart.getItems();
        var sum = 0;
        for (var key in items) {
            sum += items[key].price * items[key].quantity;
        }
        return sum;
    },

    getPromoDiscount: function () {
        var promo = Cart.getPromo();
        if (!promo) return 0;
        return Math.round(Cart.getSubtotal() * promo.percent / 100);
    },

    getTotal: function () {
        return Cart.getSubtotal() - Cart.getPromoDiscount() + DELIVERY_FEE;
    },

    getCount: function () {
        var items = Cart.getItems();
        var count = 0;
        for (var key in items) {
            count += items[key].quantity;
        }
        return count;
    },

    applyPromoCode: function (code) {
        var upper = code.toUpperCase().trim();
        if (PROMO_CODES[upper]) {
            Cart.savePromo({ code: upper, percent: PROMO_CODES[upper] });
            return { success: true, percent: PROMO_CODES[upper] };
        }
        return { success: false };
    },

    removePromo: function () {
        Cart.savePromo(null);
    },

    clear: function () {
        localStorage.removeItem(Cart.STORAGE_KEY);
        Cart.removePromo();
        Cart.updateBadge();
    },

    updateBadge: function () {
        var count = Cart.getCount();
        var badges = document.querySelectorAll('.cart-badge');
        for (var i = 0; i < badges.length; i++) {
            badges[i].textContent = count;
            badges[i].style.display = count > 0 ? 'flex' : 'none';
        }
    },

    showNotification: function (msg) {
        var el = document.createElement('div');
        el.className = 'cart-notification';
        el.textContent = msg;
        document.body.appendChild(el);
        setTimeout(function () {
            el.classList.add('cart-notification--show');
        }, 10);
        setTimeout(function () {
            el.classList.remove('cart-notification--show');
            setTimeout(function () { el.remove(); }, 300);
        }, 2000);
    }
};

document.addEventListener('DOMContentLoaded', function () {
    var btns = document.querySelectorAll('.btn--add-to-cart');
    for (var i = 0; i < btns.length; i++) {
        btns[i].addEventListener('click', function () {
            var id = this.getAttribute('data-id');
            var size = this.getAttribute('data-size') || '';
            var color = this.getAttribute('data-color') || '';
            if (id) Cart.addItem(id, size, color);
        });
    }
    Cart.updateBadge();

//review scroll
    var track = document.querySelector('.reviews__track');
    var prevBtn = document.querySelector('.arrow-btn:first-child');
    var nextBtn = document.querySelector('.arrow-btn:last-child');
    if (track && prevBtn && nextBtn) {
        var card = track.querySelector('.review-card');
        if (card) {
            var gap = 20;
            var cardWidth = card.offsetWidth + gap;
            var maxScroll = track.scrollWidth - track.parentElement.offsetWidth;

            function updateMaxScroll() {
                cardWidth = card.offsetWidth + gap;
                maxScroll = track.scrollWidth - track.parentElement.offsetWidth;
            }

            function getCurrentScroll() {
                var style = track.style.transform;
                if (!style) return 0;
                var match = style.match(/translateX\((-?[\d.]+)px\)/);
                return match ? parseFloat(match[1]) : 0;
            }

            function scrollTo(pos) {
                track.style.transform = 'translateX(' + pos + 'px)';
            }

            function getVisibleCount() {
                var wrapperWidth = track.parentElement.offsetWidth;
                return Math.round(wrapperWidth / (card.offsetWidth + gap));
            }

            prevBtn.addEventListener('click', function () {
                updateMaxScroll();
                var current = getCurrentScroll();
                var visible = getVisibleCount();
                var newPos = current + cardWidth * visible;
                if (newPos > 0) newPos = 0;
                scrollTo(newPos);
            });

            nextBtn.addEventListener('click', function () {
                updateMaxScroll();
                var current = getCurrentScroll();
                var visible = getVisibleCount();
                var newPos = current - cardWidth * visible;
                if (newPos < -maxScroll) newPos = -maxScroll;
                scrollTo(newPos);
            });

            window.addEventListener('resize', function () {
                updateMaxScroll();
                var current = getCurrentScroll();
                if (current < -maxScroll) {
                    scrollTo(-maxScroll);
                }
            });
        }
    }

    // modal
    var COLOR_MAP = {
        white: '#fff', black: '#000', gray: '#888', blue: '#063AF5',
        red: '#F50606', green: '#00C12B', yellow: '#F5DD06',
        orange: '#F57906', cyan: '#06CAF5', purple: '#7D06F5', pink: '#F506A4'
    };

    var modalState = { productId: null, quantity: 1, selectedColor: null, selectedSize: null };

    var overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = '<div class="modal"><button class="modal__close">&times;</button><div class="modal__inner"></div></div>';
    document.body.appendChild(overlay);

    var modal = overlay.querySelector('.modal');
    var modalInner = overlay.querySelector('.modal__inner');

    function buildModal(product) {
        var discount = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) + '%' : null;

        var html = '<div class="modal__gallery">';
        html += '<div class="modal__thumbs">';
        for (var t = 0; t < 3; t++) {
            html += '<div class="modal__thumb' + (t === 0 ? ' modal__thumb--active' : '') + '"><img src="' + product.image + '" alt=""></div>';
        }
        html += '</div>';
        html += '<div class="modal__main-img"><img src="' + product.image + '" alt="' + product.name + '"><div class="modal__zoom-bar"><button class="modal__zoom-btn" data-zoom="out">&minus;</button><span class="modal__zoom-pct">100%</span><button class="modal__zoom-btn" data-zoom="in">+</button></div></div>';
        html += '</div>';

        html += '<div class="modal__info">';
        html += '<h2>' + product.name + '</h2>';
        var stars = '';
        for (var s = 0; s < 5; s++) {
            stars += s < Math.round(product.rating || 4) ? '★' : '☆';
        }
        html += '<div class="modal__rating"><span class="stars">' + stars + '</span><span class="rating-text">' + (product.rating || '4.0') + '/5</span></div>';
        html += '<div class="modal__price">$' + product.price;
        if (product.oldPrice) {
            html += '<span class="modal__price-old">$' + product.oldPrice + '</span>';
            html += '<span class="modal__discount">-' + discount + '</span>';
        }
        html += '</div>';
        html += '<p class="modal__desc">' + (product.description || '') + '</p>';

        // Colors
        html += '<div class="modal__colors"><span class="modal__label">Select Colors</span><div class="modal__color-list">';
        for (var c = 0; c < product.colors.length; c++) {
            var col = product.colors[c];
            var bgColor = COLOR_MAP[col] || '#ccc';
            var borderStyle = col === 'white' ? ' border:1px solid #ddd;' : '';
            html += '<span class="modal__color-dot" data-color="' + col + '" style="background:' + bgColor + ';' + borderStyle + '"></span>';
        }
        html += '</div></div>';

        // Sizes
        html += '<div class="modal__sizes"><span class="modal__label">Choose Size</span><div class="modal__size-list">';
        for (var z = 0; z < product.sizes.length; z++) {
            html += '<button class="modal__size-chip" data-size="' + product.sizes[z] + '">' + product.sizes[z] + '</button>';
        }
        html += '</div></div>';

        // Actions
        html += '<div class="modal__actions">';
        html += '<div class="modal__qty"><button class="modal__qty-minus">&minus;</button><span class="modal__qty-val">1</span><button class="modal__qty-plus">+</button></div>';
        html += '<button class="modal__add-btn">Add to Cart</button>';
        html += '</div>';

        
        html += '<div class="modal__tabs"><div class="modal__tab modal__tab--active" data-tab="details">Product Details</div><div class="modal__tab" data-tab="reviews">Rating & Reviews</div><div class="modal__tab" data-tab="faqs">FAQs</div></div>';
        html += '<div class="modal__tab-content" id="modal-tab-content">';
        html += '<p>' + (product.description || '') + '</p>';
        html += '<p style="margin-top:12px;">Premium quality materials. Machine washable. Imported.</p>';
        html += '</div>';

        html += '</div>';

        modalInner.innerHTML = html;
        modalState.productId = product.id;
        modalState.quantity = 1;
        modalState.selectedColor = null;
        modalState.selectedSize = null;

        var tabs = modal.querySelectorAll('.modal__tab');
        var tabContents = {
            details: '<p>' + (product.description || '') + '</p><p style="margin-top:12px;">Premium quality materials. Machine washable. Imported.</p>',
            reviews: '<div class="modal-reviews-header"><span style="font-size:24px;font-weight:700;">All Reviews</span><span style="color:rgba(0,0,0,0.6);margin-left:8px;">(451)</span><div style="margin-left:auto;display:flex;gap:8px;"><button class="modal__review-filter" style="background:#F0F0F0;border:none;border-radius:62px;padding:8px 16px;font-size:14px;cursor:pointer;">Latest <span style="margin-left:4px;">▼</span></button><button class="modal__review-write" style="background:#000;color:#fff;border:none;border-radius:62px;padding:8px 20px;font-size:14px;cursor:pointer;">Write a Review</button></div></div><div class="modal-reviews-track-wrapper"><div class="modal-reviews-track"><div class="modal-review-card"><div class="stars">★★★★★</div><div class="modal-review-author"><span class="modal-review-name">Samantha D.</span><span class="modal-review-verified">&#10003;</span></div><p>"I absolutely love this t-shirt! The design is unique and the fabric feels so comfortable. It\'s become my favorite go-to shirt."</p><span class="modal-review-date">Posted on August 14, 2023</span></div><div class="modal-review-card"><div class="stars">★★★★☆</div><div class="modal-review-author"><span class="modal-review-name">Ethan R.</span><span class="modal-review-verified">&#10003;</span></div><p>"This t-shirt is a must-have for anyone who appreciates good design. The minimalistic yet stylish pattern caught my eye, and the fit is perfect."</p><span class="modal-review-date">Posted on August 16, 2023</span></div><div class="modal-review-card"><div class="stars">★★★★☆</div><div class="modal-review-author"><span class="modal-review-name">Liam K.</span><span class="modal-review-verified">&#10003;</span></div><p>"This t-shirt is a fusion of comfort and creativity. The fabric is soft, and the design speaks volumes about the designer\'s skill."</p><span class="modal-review-date">Posted on August 18, 2023</span></div><div class="modal-review-card"><div class="stars">★★★★★</div><div class="modal-review-author"><span class="modal-review-name">Alex M.</span><span class="modal-review-verified">&#10003;</span></div><p>"The t-shirt exceeded my expectations! The colors are vibrant and the print quality is top-notch."</p><span class="modal-review-date">Posted on August 15, 2023</span></div><div class="modal-review-card"><div class="stars">★★★★★</div><div class="modal-review-author"><span class="modal-review-name">Olivia P.</span><span class="modal-review-verified">&#10003;</span></div><p>"The fit is perfect and the fabric is incredibly soft. I\'ve received so many compliments on this shirt!"</p><span class="modal-review-date">Posted on August 20, 2023</span></div><div class="modal-review-card"><div class="stars">★★★★☆</div><div class="modal-review-author"><span class="modal-review-name">James W.</span><span class="modal-review-verified">&#10003;</span></div><p>"Great quality and attention to detail. The stitching is flawless and the material feels premium."</p><span class="modal-review-date">Posted on August 22, 2023</span></div></div></div><div style="text-align:center;margin-top:20px;"><button style="background:transparent;border:1px solid rgba(0,0,0,0.1);border-radius:62px;padding:12px 40px;font-size:14px;cursor:pointer;">Load More Reviews</button></div>',
            faqs: '<p style="font-weight:600;margin-bottom:8px;">Frequently Asked Questions</p><p><strong>What is the return policy?</strong> Free returns within 30 days.</p><p style="margin-top:8px;"><strong>How do I find my size?</strong> Check our size guide in the product images.</p><p style="margin-top:8px;"><strong>Is this item true to size?</strong> Yes, we recommend ordering your usual size.</p>'
        };
        for (var ti = 0; ti < tabs.length; ti++) {
            (function (tab) {
                tab.addEventListener('click', function () {
                    for (var x = 0; x < tabs.length; x++) tabs[x].classList.remove('modal__tab--active');
                    this.classList.add('modal__tab--active');
                    var key = this.getAttribute('data-tab');
                    var contentEl = document.getElementById('modal-tab-content');
                    if (contentEl && tabContents[key]) contentEl.innerHTML = tabContents[key];
                });
            })(tabs[ti]);
        }

        var thumbs = modal.querySelectorAll('.modal__thumb');
        var mainImg = modal.querySelector('.modal__main-img img');
        for (var th = 0; th < thumbs.length; th++) {
            (function (thumb) {
                thumb.addEventListener('click', function () {
                    for (var x = 0; x < thumbs.length; x++) thumbs[x].classList.remove('modal__thumb--active');
                    this.classList.add('modal__thumb--active');
                    if (mainImg) mainImg.src = this.querySelector('img').src;
                });
            })(thumbs[th]);
        }

        var mainImgWrap = modal.querySelector('.modal__main-img');
        var zoomLevel = 1;
        var zoomPctEl = modal.querySelector('.modal__zoom-pct');
        var zoomImg = modal.querySelector('.modal__main-img img');

        function applyZoom() {
            if (zoomImg) {
                zoomImg.style.transform = 'scale(' + zoomLevel + ')';
            }
            if (zoomPctEl) {
                zoomPctEl.textContent = Math.round(zoomLevel * 100) + '%';
            }
        }

        if (mainImgWrap) {
            mainImgWrap.addEventListener('click', function (e) {
                if (e.target.closest('.modal__zoom-bar')) return;
                var isZoomed = this.classList.toggle('modal__main-img--zoomed');
                if (isZoomed) {
                    zoomLevel = 1;
                    applyZoom();
                } else {
                    zoomLevel = 1;
                    if (zoomImg) zoomImg.style.transform = '';
                    if (zoomPctEl) zoomPctEl.textContent = '100%';
                }
            });
        }

        var zoomBtns = modal.querySelectorAll('.modal__zoom-btn');
        for (var zb = 0; zb < zoomBtns.length; zb++) {
            (function (btn) {
                btn.addEventListener('click', function (e) {
                    e.stopPropagation();
                    if (!mainImgWrap || !mainImgWrap.classList.contains('modal__main-img--zoomed')) return;
                    var dir = this.getAttribute('data-zoom');
                    if (dir === 'in') {
                        zoomLevel = Math.min(zoomLevel + 0.5, 5);
                    } else {
                        zoomLevel = Math.max(zoomLevel - 0.5, 1);
                    }
                    applyZoom();
                });
            })(zoomBtns[zb]);
        }

        var dots = modal.querySelectorAll('.modal__color-dot');
        for (var dc = 0; dc < dots.length; dc++) {
            (function (dot) {
                dot.addEventListener('click', function () {
                    for (var x = 0; x < dots.length; x++) dots[x].classList.remove('modal__color-dot--active');
                    this.classList.add('modal__color-dot--active');
                    modalState.selectedColor = this.getAttribute('data-color');
                });
            })(dots[dc]);
        }

        var chips = modal.querySelectorAll('.modal__size-chip');
        for (var sc = 0; sc < chips.length; sc++) {
            (function (chip) {
                chip.addEventListener('click', function () {
                    for (var x = 0; x < chips.length; x++) chips[x].classList.remove('modal__size-chip--active');
                    this.classList.add('modal__size-chip--active');
                    modalState.selectedSize = this.getAttribute('data-size');
                });
            })(chips[sc]);
        }

        var qtyVal = modal.querySelector('.modal__qty-val');
        var qtyMinus = modal.querySelector('.modal__qty-minus');
        var qtyPlus = modal.querySelector('.modal__qty-plus');

        function updateQty() {
            if (qtyVal) qtyVal.textContent = modalState.quantity;
        }
        if (qtyMinus) {
            qtyMinus.addEventListener('click', function () {
                if (modalState.quantity > 1) { modalState.quantity--; updateQty(); }
            });
        }
        if (qtyPlus) {
            qtyPlus.addEventListener('click', function () {
                modalState.quantity++; updateQty();
            });
        }

        var addBtn = modal.querySelector('.modal__add-btn');
        if (addBtn) {
            addBtn.addEventListener('click', function () {
                var prod = PRODUCTS[modalState.productId];
                if (!prod) return;
                for (var qi = 0; qi < modalState.quantity; qi++) {
                    Cart.addItem(modalState.productId, modalState.selectedSize, modalState.selectedColor);
                }
            });
        }
    }

    var allCards = document.querySelectorAll('.product-card');
    for (var ci = 0; ci < allCards.length; ci++) {
        (function (card) {
            card.addEventListener('click', function (e) {
                if (e.target.closest('.btn--add-to-cart') || e.target.closest('.cart-badge') || e.target.closest('a') || e.target.closest('.product-card__edit')) return;
                var id = card.getAttribute('data-id');
                if (id && PRODUCTS[id]) {
                    buildModal(PRODUCTS[id]);
                    overlay.classList.add('modal-overlay--open');
                    document.body.style.overflow = 'hidden';
                }
            });
        })(allCards[ci]);
    }

    var closeBtn = modal.querySelector('.modal__close');
    if (closeBtn) {
        closeBtn.addEventListener('click', function () {
            overlay.classList.remove('modal-overlay--open');
            document.body.style.overflow = '';
        });
    }
    overlay.addEventListener('click', function (e) {
        if (e.target === overlay) {
            overlay.classList.remove('modal-overlay--open');
            document.body.style.overflow = '';
        }
    });

    function updateCardPrice(productId) {
        var prod = PRODUCTS[productId];
        if (!prod) return;
        var cards = document.querySelectorAll('.product-card[data-id="' + productId + '"]');
        for (var u = 0; u < cards.length; u++) {
            var priceEl = cards[u].querySelector('.product-card__price');
            if (!priceEl) continue;
            if (prod.oldPrice && prod.oldPrice > prod.price) {
                var pct = Math.round((1 - prod.price / prod.oldPrice) * 100);
                priceEl.innerHTML = '<span class="price-current">$' + prod.price + '</span><span class="price-old">$' + prod.oldPrice + '</span><span class="discount-badge">-' + pct + '%</span>';
            } else {
                priceEl.innerHTML = '$' + prod.price;
            }
        }
    }

    var cardsForEdit = document.querySelectorAll('.product-card');
    for (var ebi = 0; ebi < cardsForEdit.length; ebi++) {
        var eBtn = document.createElement('button');
        eBtn.className = 'product-card__edit';
        eBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>';
        eBtn.setAttribute('title', 'Edit price / discount');
        cardsForEdit[ebi].appendChild(eBtn);
    }

    var priceOverlay = document.createElement('div');
    priceOverlay.className = 'price-edit-overlay';
    priceOverlay.innerHTML =
        '<div class="price-edit-modal">' +
            '<button class="price-edit-close">&times;</button>' +
            '<h3>Edit Price</h3>' +
            '<div class="price-edit-field"><label>Price ($)</label><input type="number" id="price-edit-input" min="0" step="1"></div>' +
            '<div class="price-edit-field"><label>Discount (%)</label><input type="number" id="discount-edit-input" min="0" max="100" step="1" value="0"></div>' +
            '<div class="price-edit-preview">Preview: $<span id="price-edit-preview-current">0</span></div>' +
            '<div class="price-edit-actions">' +
                '<button id="price-edit-save" class="btn btn--primary" style="flex:1">Save</button>' +
                '<button id="price-edit-cancel" class="btn btn--outline" style="flex:1">Cancel</button>' +
            '</div>' +
        '</div>';
    document.body.appendChild(priceOverlay);

    var editingProductId = null;

    function openPriceEditor(id) {
        if (!id || !PRODUCTS[id]) return;
        editingProductId = id;
        var prod = PRODUCTS[id];
        document.getElementById('price-edit-input').value = prod.price;
        document.getElementById('discount-edit-input').value = 0;
        updatePricePreview();
        priceOverlay.classList.add('price-edit-overlay--open');
    }

    function updatePricePreview() {
        var price = parseFloat(document.getElementById('price-edit-input').value) || 0;
        var discount = parseFloat(document.getElementById('discount-edit-input').value) || 0;
        var currentEl = document.getElementById('price-edit-preview-current');
        if (discount > 0) {
            var oldPrice = Math.round(price / (1 - discount / 100));
            currentEl.innerHTML = '$' + price + ' <span style="text-decoration:line-through;color:rgba(0,0,0,0.3);margin-left:6px;">$' + oldPrice + '</span> <span class="discount-badge">-' + discount + '%</span>';
        } else {
            currentEl.textContent = '$' + price;
        }
    }
    
    document.addEventListener('click', function (e) {
        var eb = e.target.closest('.product-card__edit');
        if (eb) {
            e.stopPropagation();
            var card = eb.closest('.product-card');
            if (card) {
                var id = card.getAttribute('data-id');
                openPriceEditor(id);
            }
        }
    });

    document.getElementById('price-edit-input').addEventListener('input', updatePricePreview);
    document.getElementById('discount-edit-input').addEventListener('input', updatePricePreview);

    document.getElementById('price-edit-save').addEventListener('click', function () {
        if (!editingProductId) return;
        var price = parseFloat(document.getElementById('price-edit-input').value) || 0;
        var discount = parseFloat(document.getElementById('discount-edit-input').value) || 0;
        var prod = PRODUCTS[editingProductId];
        prod.price = price;
        prod.oldPrice = discount > 0 ? Math.round(price / (1 - discount / 100)) : null;
        updateCardPrice(editingProductId);
        priceOverlay.classList.remove('price-edit-overlay--open');
    });

    document.getElementById('price-edit-cancel').addEventListener('click', function () {
        priceOverlay.classList.remove('price-edit-overlay--open');
    });

    priceOverlay.querySelector('.price-edit-close').addEventListener('click', function () {
        priceOverlay.classList.remove('price-edit-overlay--open');
    });

    priceOverlay.addEventListener('click', function (e) {
        if (e.target === priceOverlay) {
            priceOverlay.classList.remove('price-edit-overlay--open');
        }
    });
});
