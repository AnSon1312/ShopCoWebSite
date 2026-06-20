(function () {
    var state = {
        priceMin: 50,
        priceMax: 200,
        selectedColors: [],
        selectedSizes: [],
        selectedStyle: null
    };
    var PRICE_ABSOLUTE_MIN = 50;
    var PRICE_ABSOLUTE_MAX = 260;

    var productCards = [];
    var cats = document.querySelectorAll('.cat-product-grid .product-card');
    for (var i = 0; i < cats.length; i++) {
        productCards.push(cats[i]);
    }

    function getProductPrice(card) {
        var val = card.getAttribute('data-price');
        return val ? parseInt(val, 10) : 0;
    }

    function getProductColors(card) {
        var val = card.getAttribute('data-colors');
        return val ? val.split(',') : [];
    }

    function getProductSizes(card) {
        var val = card.getAttribute('data-sizes');
        return val ? val.split(',') : [];
    }

    function getProductStyle(card) {
        return card.getAttribute('data-style') || '';
    }

    function matchesPrice(card) {
        var p = getProductPrice(card);
        return p >= state.priceMin && p <= state.priceMax;
    }

    function matchesColors(card) {
        if (state.selectedColors.length === 0) return true;
        var cols = getProductColors(card);
        for (var c = 0; c < state.selectedColors.length; c++) {
            if (cols.indexOf(state.selectedColors[c]) !== -1) return true;
        }
        return false;
    }

    function matchesSizes(card) {
        if (state.selectedSizes.length === 0) return true;
        var sizes = getProductSizes(card);
        for (var s = 0; s < state.selectedSizes.length; s++) {
            if (sizes.indexOf(state.selectedSizes[s]) !== -1) return true;
        }
        return false;
    }

    function matchesStyle(card) {
        if (!state.selectedStyle) return true;
        return getProductStyle(card) === state.selectedStyle;
    }

    function applyFilters() {
        var visibleCount = 0;
        for (var i = 0; i < productCards.length; i++) {
            var card = productCards[i];
            var ok = matchesPrice(card) && matchesColors(card) && matchesSizes(card) && matchesStyle(card);
            card.style.display = ok ? '' : 'none';
            if (ok) visibleCount++;
        }
        var countEl = document.querySelector('.category-count');
        if (countEl) {
            countEl.textContent = 'Showing 1-' + Math.min(visibleCount, 10) + ' of ' + visibleCount + ' Product' + (visibleCount !== 1 ? 's' : '');
        }
        var titleEl = document.querySelector('[data-category-title]');
        if (titleEl) {
            if (state.selectedStyle) {
                titleEl.textContent = state.selectedStyle.charAt(0).toUpperCase() + state.selectedStyle.slice(1);
            } else {
                titleEl.textContent = 'All';
            }
        }
    }

    // price slider
    (function initPriceSlider() {
        var slider = document.querySelector('.price-range__slider');
        var fill = document.querySelector('.price-range__fill');
        var thumbLeft = document.querySelector('.price-range__thumb--left');
        var thumbRight = document.querySelector('.price-range__thumb--right');
        var labelLeft = document.querySelector('.price-range__labels span:first-child');
        var labelRight = document.querySelector('.price-range__labels span:last-child');
        if (!slider || !fill || !thumbLeft || !thumbRight) return;

        function posToPrice(frac) {
            return Math.round(PRICE_ABSOLUTE_MIN + frac * (PRICE_ABSOLUTE_MAX - PRICE_ABSOLUTE_MIN));
        }

        function priceToPos(price) {
            return (price - PRICE_ABSOLUTE_MIN) / (PRICE_ABSOLUTE_MAX - PRICE_ABSOLUTE_MIN);
        }

        function updateSlider() {
            var leftFrac = priceToPos(state.priceMin);
            var rightFrac = priceToPos(state.priceMax);
            var pctL = leftFrac * 100;
            var pctR = rightFrac * 100;
            fill.style.left = pctL + '%';
            fill.style.width = (pctR - pctL) + '%';
            thumbLeft.style.left = pctL + '%';
            thumbRight.style.left = pctR + '%';
            if (labelLeft) labelLeft.textContent = '$' + state.priceMin;
            if (labelRight) labelRight.textContent = '$' + state.priceMax;
        }

        function startDrag(thumb, isLeft) {
            return function (e) {
                e.preventDefault();
                var sliderRect = slider.getBoundingClientRect();
                function onMove(ev) {
                    var x = (ev.clientX || ev.touches[0].clientX) - sliderRect.left;
                    var frac = Math.max(0, Math.min(1, x / sliderRect.width));
                    var price = posToPrice(frac);
                    if (isLeft) {
                        state.priceMin = Math.min(price, state.priceMax - 10);
                        state.priceMin = Math.max(state.priceMin, PRICE_ABSOLUTE_MIN);
                    } else {
                        state.priceMax = Math.max(price, state.priceMin + 10);
                        state.priceMax = Math.min(state.priceMax, PRICE_ABSOLUTE_MAX);
                    }
                    updateSlider();
                }
                function onUp() {
                    document.removeEventListener('mousemove', onMove);
                    document.removeEventListener('mouseup', onUp);
                    document.removeEventListener('touchmove', onMove);
                    document.removeEventListener('touchend', onUp);
                }
                document.addEventListener('mousemove', onMove);
                document.addEventListener('mouseup', onUp);
                document.addEventListener('touchmove', onMove, { passive: false });
                document.addEventListener('touchend', onUp);
            };
        }

        thumbLeft.addEventListener('mousedown', startDrag(thumbLeft, true));
        thumbLeft.addEventListener('touchstart', startDrag(thumbLeft, true), { passive: false });
        thumbRight.addEventListener('mousedown', startDrag(thumbRight, false));
        thumbRight.addEventListener('touchstart', startDrag(thumbRight, false), { passive: false });

        updateSlider();
    })();
//colors
    var colorSwatches = document.querySelectorAll('.color-swatch');
    for (var ci = 0; ci < colorSwatches.length; ci++) {
        (function (swatch) {
            swatch.addEventListener('click', function () {
                var color = swatch.getAttribute('data-color');
                if (!color) return;
                var idx = state.selectedColors.indexOf(color);
                if (idx === -1) {
                    state.selectedColors.push(color);
                    swatch.classList.add('color-swatch--selected');
                } else {
                    state.selectedColors.splice(idx, 1);
                    swatch.classList.remove('color-swatch--selected');
                }
            });
        })(colorSwatches[ci]);
    }

    //size
    var sizeTags = document.querySelectorAll('.size-tag');
    for (var si = 0; si < sizeTags.length; si++) {
        (function (tag) {
            tag.addEventListener('click', function () {
                var size = tag.getAttribute('data-size');
                if (!size) return;
                var idx = state.selectedSizes.indexOf(size);
                if (idx === -1) {
                    state.selectedSizes.push(size);
                    tag.classList.add('size-tag--active');
                } else {
                    state.selectedSizes.splice(idx, 1);
                    tag.classList.remove('size-tag--active');
                }
            });
        })(sizeTags[si]);
    }

    // dress style
    var styleItems = document.querySelectorAll('.filter-style');
    for (var sti = 0; sti < styleItems.length; sti++) {
        (function (item) {
            item.addEventListener('click', function () {
                var style = item.getAttribute('data-style');
                if (!style) return;
                if (state.selectedStyle === style) {
                    state.selectedStyle = null;
                    item.classList.remove('filter-style--active');
                } else {
                    for (var x = 0; x < styleItems.length; x++) {
                        styleItems[x].classList.remove('filter-style--active');
                    }
                    state.selectedStyle = style;
                    item.classList.add('filter-style--active');
                }
            });
        })(styleItems[sti]);
    }

    var applyBtn = document.querySelector('.filter-apply');
    if (applyBtn) {
        applyBtn.addEventListener('click', applyFilters);
    }

    applyFilters();
})();
