function formatPrice(cents) {
    return '$' + cents;
}

function renderCart() {
    var items = Cart.getItems();
    var container = document.querySelector('.cart-items');
    var summaryEl = document.querySelector('.cart-summary');
    if (!container) return;

    var keys = Object.keys(items);
    if (keys.length === 0) {
        container.innerHTML = '<div class="cart-empty"><p>Your cart is empty</p><a href="index.html" class="btn btn--primary">Continue Shopping</a></div>';
        if (summaryEl) {
            var rows = summaryEl.querySelectorAll('.cart-summary__row');
            for (var i = 0; i < rows.length; i++) {
                rows[i].querySelector('.cart-summary__value').textContent = '$0';
            }
            var total = summaryEl.querySelector('.cart-summary__value--total');
            if (total) total.textContent = '$15';
            summaryEl.querySelector('.cart-summary__value--discount').textContent = '-$0';
            var promoLabel = summaryEl.querySelector('.cart-summary__row:nth-child(2) .cart-summary__label');
            if (promoLabel) promoLabel.textContent = 'Discount';
        }
        return;
    }

    var html = '';
    var first = true;
    for (var key in items) {
        var item = items[key];
        if (!first) html += '<div class="cart-item__divider"></div>';
        first = false;
        var discountBadge = '';
        if (item.oldPrice && item.oldPrice > item.price) {
            var saved = item.oldPrice - item.price;
            var pct = Math.round((saved / item.oldPrice) * 100);
            discountBadge = '<span class="discount-badge" style="margin-left:8px;font-size:11px">-' + pct + '%</span>';
        }
        html += '<div class="cart-item" data-cart-id="' + item.id + '">' +
            '<div class="cart-item__image">' +
                '<img src="' + item.image + '" alt="' + item.name + '">' +
            '</div>' +
            '<div class="cart-item__info">' +
                '<h3>' + item.name + '</h3>' +
                '<div class="cart-item__details">' +
                    '<span class="cart-item__label">Size: <span class="cart-item__value">' + item.size + '</span></span>' +
                    '<span class="cart-item__label">Color: <span class="cart-item__value">' + item.color + '</span></span>' +
                '</div>' +
                '<div class="cart-item__price">' +
                    '<span class="price-current">' + formatPrice(item.price) + '</span>' +
                    (item.oldPrice ? '<span class="price-old">' + formatPrice(item.oldPrice) + '</span>' : '') +
                    discountBadge +
                '</div>' +
            '</div>' +
            '<div class="cart-item__actions">' +
                '<button class="cart-item__delete" data-cart-id="' + item.id + '">' +
                    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none">' +
                        '<path d="M21 6H14" stroke="#FF3333" stroke-width="1.5" stroke-linecap="round"/>' +
                        '<path d="M6 6H3" stroke="#FF3333" stroke-width="1.5" stroke-linecap="round"/>' +
                        '<path d="M10 6C10 7.65685 11.3431 9 13 9C14.6569 9 16 7.65685 16 6C16 4.34315 14.6569 3 13 3C11.3431 3 10 4.34315 10 6Z" stroke="#FF3333" stroke-width="1.5"/>' +
                        '<path d="M21 18H17" stroke="#FF3333" stroke-width="1.5" stroke-linecap="round"/>' +
                        '<path d="M7 18H3" stroke="#FF3333" stroke-width="1.5" stroke-linecap="round"/>' +
                        '<path d="M13 18C13 16.3431 11.6569 15 10 15C8.34315 15 7 16.3431 7 18C7 19.6569 8.34315 21 10 21C11.6569 21 13 19.6569 13 18Z" stroke="#FF3333" stroke-width="1.5"/>' +
                    '</svg>' +
                '</button>' +
                '<div class="quantity-control">' +
                    '<button class="quantity-control__btn" data-cart-id="' + item.id + '" data-delta="-1">-</button>' +
                    '<span class="quantity-control__value">' + item.quantity + '</span>' +
                    '<button class="quantity-control__btn" data-cart-id="' + item.id + '" data-delta="1">+</button>' +
                '</div>' +
            '</div>' +
        '</div>';
    }
    container.innerHTML = html;


    var deleteBtns = container.querySelectorAll('.cart-item__delete');
    for (var d = 0; d < deleteBtns.length; d++) {
        deleteBtns[d].addEventListener('click', function () {
            Cart.removeItem(this.getAttribute('data-cart-id'));
        });
    }

    var qtyBtns = container.querySelectorAll('.quantity-control__btn');
    for (var q = 0; q < qtyBtns.length; q++) {
        qtyBtns[q].addEventListener('click', function () {
            var delta = parseInt(this.getAttribute('data-delta'), 10);
            Cart.updateQuantity(this.getAttribute('data-cart-id'), delta);
        });
    }

    renderSummary();
}

function renderSummary() {
    var promo = Cart.getPromo();
    var subtotal = Cart.getSubtotal();
    var discount = Cart.getPromoDiscount();
    var total = Cart.getTotal();

    var summaryEl = document.querySelector('.cart-summary');
    if (!summaryEl) return;

    var rows = summaryEl.querySelectorAll('.cart-summary__row');
    if (rows.length >= 1) {
        rows[0].querySelector('.cart-summary__value').textContent = formatPrice(subtotal);
    }
    if (rows.length >= 2) {
        var label = rows[1].querySelector('.cart-summary__label');
        var val = rows[1].querySelector('.cart-summary__value');
        if (promo) {
            label.textContent = 'Discount (-' + promo.percent + '%)';
        } else {
            label.textContent = 'Discount';
        }
        val.textContent = '-$' + discount;
    }
    if (rows.length >= 3) {
        var fee = Cart.getCount() > 0 ? DELIVERY_FEE : 0;
        rows[2].querySelector('.cart-summary__value').textContent = Cart.getCount() > 0 ? '$' + fee : '$0';
    }
    var totalRow = summaryEl.querySelector('.cart-summary__row--total');
    if (totalRow) {
        totalRow.querySelector('.cart-summary__value').textContent = formatPrice(Cart.getCount() > 0 ? total : 0);
    }
}

// promo code
document.addEventListener('DOMContentLoaded', function () {
    renderCart();

    var applyBtn = document.querySelector('.cart-promo__apply');
    var promoInput = document.querySelector('.cart-promo__input-wrapper input');
    if (applyBtn && promoInput) {
        applyBtn.addEventListener('click', function () {
            var code = promoInput.value.trim();
            if (!code) return;
            var result = Cart.applyPromoCode(code);
            if (result.success) {
                promoInput.value = '';
                promoInput.placeholder = 'Promo code applied!';
                Cart.showNotification('Promo code ' + code + ' applied! ' + result.percent + '% off');
            } else {
                Cart.showNotification('Invalid promo code');
                promoInput.value = '';
                promoInput.placeholder = 'Try SAVE10, SAVE20, or WELCOME15';
            }
            renderCart();
        });
        promoInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                applyBtn.click();
            }
        });
    }

    var checkoutBtn = document.querySelector('.btn--checkout');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function () {
            if (Cart.getCount() === 0) {
                Cart.showNotification('Your cart is empty');
                return;
            }
            Cart.showNotification('Order placed! Thank you for shopping with Shop.co');
            Cart.clear();
            renderCart();
        });
    }

    window.renderCart = renderCart;
});
