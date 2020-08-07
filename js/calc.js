'use strict';

var cities = [];
$.getJSON('region.json', function (data) {
    cities = data;
});
var numElem = 1;
var budget = 0;
var priceOptions = 0;

var testBudgetSev = function testBudgetSev(rs, theme) {
    console.log('Кол-во рс: ' + rs + '; тематик: ' + theme + '; Бюджет: ' + budget + '; Стоимость за опции: ' + priceOptions + '; Стоимость обслуживания: ' + Math.round((1 - (theme - 1) * 0.1) * theme * rs * 20000 + priceOptions * theme - 0.01 * budget));
};

var testBudgetDev = function testBudgetDev(rs, theme) {
    console.log('Кол-во рс: ' + rs + '; тематик: ' + theme + '; Стоимость разработки: ' + Math.round((1 - (theme - 1) * 0.1) * theme * rs * 25000));
};

var changeBudget = function changeBudget(valBudget) {
    if (valBudget > 150) budget = parseInt(valBudget) * 1000; else budget = 0;
};

function debounce(func, wait, immediate) {
    var timeout;
    return function executedFunction() {
        var context = this;
        var args = arguments;

        var later = function later() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };

        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

;

var getPriceOptions = function getPriceOptions() {
    priceOptions = 0;
    $('.advert-ability:not(.advert-ability_active) input:checked').each(function (key, item) {
        console.log($(item).closest('.advert-ability').data('price'));
        console.log($(item).closest('advert-ability_active').length===0);
        if ($(item).closest('.advert-ability').data('price') && $(item).closest('advert-ability_active').length===0) priceOptions += parseInt($(item).closest('.advert-ability').data('price'));
    });
};

var advPrice = $('.advert-price');
var elem50 = advPrice.find('.advert-ability[data-need]');

var cycleRange = function cycleRange(num) {
    for (var i = 0; i < num; i++) {
        elem50.get(i).classList.add('advert-ability_active');
        elem50.get(i).querySelector('input').checked = true;
    }

    for (var z = num; z < elem50.length; z++) {
        elem50.get(z).classList.remove('advert-ability_active');
        elem50.get(z).querySelector('input').checked = false;
    }
}; // Изменение текста бюджета


var budgetChangeText = function budgetChangeText(value) {
    advPrice.removeClass('advert-price_infinity');

    if (/^[0-9]+$/.test(value)) {
        cycleRange((parseInt(value) - 50) / 50);
        $('.advert-graph__price').html(value + ' 000 ₽');
        changeBudget(value);
    } else if (value === '1 млн') {
        elem50.addClass('advert-ability_active');
        $('.advert-price .advert-ability[data-need] input').prop('checked', true);
        $('.advert-graph__price').html('1 000 000 ₽');
        budget = 1000000;
    } else {
        advPrice.addClass('advert-price_infinity');
        $('.advert-graph__price').html('Не ограничен');
    }

    getPriceSev();
}; //Фильтрация по городам


var filterCities = debounce(function () {
    var inpWord = this.value;
    var allLi = $(this.nextElementSibling).find('li');
    var allParent = $(this.nextElementSibling).find('li.advert-popup__parent');

    if (this.value !== '' && this.value.length >= 3) {
        allLi.css('display', function () {
            var classRes = '';
            var hasWord = this.querySelector('input').value.toLowerCase().indexOf(inpWord.toLowerCase());

            if (hasWord !== -1) {
                classRes = 'block';
            } else {
                classRes = 'none';
            }

            var liParent = this.parentElement;

            if (liParent.previousElementSibling) {
                if (liParent.previousElementSibling.classList.contains('advert-popup__parent') && classRes === 'block') {
                    liParent.previousElementSibling.style.display = 'block';
                    liParent.previousElementSibling.classList.add('show');
                    liParent.style.display = 'block';
                }
            }

            return classRes;
        });
    } else {
        allLi.css('display', 'block');
        allParent.next().css('display', 'none');
    }
}, 1000);

var printCities = function printCities(modal, cityArr) {
    modal.classList.add('advert-popup_load');
    var contElem = modal.querySelector('.advert-popup__cont');
    contElem.previousElementSibling.addEventListener('keyup', filterCities);
    var domElems = document.createElement('ul');
    domElems.classList.add('advert-popup__ul');

    var printFn = function printFn(thisParent, arr) {
        arr.forEach(function (item) {
            var newParent = '';
            var liElem = document.createElement('li');
            liElem.innerHTML = '' + '<input name="advert-popup" type="checkbox" value="' + item.name + '">' + '<span>' + item.name + '</span>';

            if (item.areas.length > 0) {
                var arrow = document.createElement('div');
                arrow.classList.add('advert-popup__arrow');
                liElem.classList.add('advert-popup__parent');
                $(liElem).prepend(arrow);
                newParent = document.createElement('li');
                printFn(newParent, item.areas);
            }

            thisParent.appendChild(liElem);
            if (newParent) thisParent.appendChild(newParent);
        });
    };

    contElem.innerHTML = '';
    printFn(domElems, cityArr);
    contElem.appendChild(domElems);
};

var getPriceDev = function getPriceDev() {
    var obCount = {
        1: 0,
        2: 0,
        3: 0,
        4: 0
    };
    var price = 0;
    var elemAr = [];
    var countAdvAllNew = $('.advert-collections .advert-collection');
    countAdvAllNew.each(function (key, item) {
        elemAr.push($(item).find('input[data-dev]:checked'));
    });
    $(elemAr).each(function (key, res) {
        obCount[res.length]++;
    });

    for (var key in obCount) {
        if (obCount[key] > 0) {
            // testBudgetDev(obCount[key], key);
            price += Math.round((1 - (key - 1) * 0.1) * key * obCount[key] * 25000);
        }
    }

    $('.js-price-dev').html(price + ' ₽');
};

var getPriceSev = function getPriceSev() {
    getPriceOptions();
    var obCount = {
        1: 0,
        2: 0,
        3: 0,
        4: 0
    };
    var price = 0;
    var elemAr = [];
    var countAdvAllNew = $('.advert-collections .advert-collection');
    countAdvAllNew.each(function (key, item) {
        elemAr.push($(item).find('input:checked'));
    });
    $(elemAr).each(function (key, res) {
        obCount[res.length]++;
    });

    for (var key in obCount) {
        if (obCount[key] > 0) {
            // testBudgetSev(obCount[key], key);
            price += Math.round((1 - (key - 1) * 0.1) * key * obCount[key] * 20000 + priceOptions * obCount[key] - 0.01 * budget);
        }
    }

    $('.js-price-serv').html(price + ' ₽');
};

$(".js-range-slider").ionRangeSlider({
    from: 0,
    grid: true,
    grid_snap: true,
    values: ['50', '100', '150', '200', '250', '300', '350', '400', '450', '500', '550', '600', '650', '700', '750', '800', '850', '900', '950', '1 млн', '∞'],
    onChange: function onChange(data) {
        budgetChangeText(data.from_value);
    },
    onStart: function onStart(data) {
        changeBudget(data.from_value);
    }
});
$('#advert-add-theme').on('click', function () {
    numElem++;
    $(".js-range-slider").data("ionRangeSlider").update({
        from_min: numElem - 1
    });
    var valueRange = $(".js-range-slider").data("ionRangeSlider").input.value;
    changeBudget(valueRange);
    budgetChangeText(valueRange);
    console.log(valueRange);
    var collectElem = document.createElement('div');
    collectElem.classList.add('advert-collection');
    collectElem.innerHTML = '' + '<div class="row align-items-center">' + '<div class="advert-calc__text-col vam-child">' + '<span class="advert-calc__title">Название тематики</span>' + '<div class="get-info" data-info-id=""></div>' + '</div>' + '<div class="advert-theme-block">' + '<div class="input-group advert-theme-block__input">' + '<input type="text" class="input-group__input" name="name" autocomplete="off" placeholder="-"' + '   required>' + '<span class="bar"></span>' + '<label>Введите название</label>' + '</div>' + '</div>' + '<div class="advert-city-block">' + '<div class="advert-city-block__in">' + '<span class="advert-city-block__city">Выбор региона</span>' + '<div class="advert-popup advert-popup_hide">' + '<span class="advert-popup__title">Выберите регион</span>' + '<input type="text" class="advert-popup__filter" placeholder="Найти регион (мин. 3 символа)">' + '<div class="advert-popup__cont">' + '</div>' + '</div>' + '</div>' + '</div>' + '<div class="advert-delete-block">' + '<span class="advert-delete-js">- Убрать</span>' + '</div>' + '</div>' + '<div class="row align-items-center advert-calc__second-block">' + '<div class="advert-calc__text-col vam-child">' + '<span class="advert-calc__title">Рекламная система</span>' + '<div class="get-info" data-info-id=""></div>' + '</div>' + '<div class="advert-calc__checkbox">' + '<div class="advert-checkbox">' + '<input class="advert-checkbox__input" type="checkbox" name="advert-system" value="Яндекс.Директ" data-dev="25000" checked>' + '<label for="yd_' + numElem + '">Яндекс.Директ</label>' + '</div>' + '<div class="advert-checkbox">' + '<input class="advert-checkbox__input" type="checkbox" name="advert-system" value="Google Ads" data-dev="25000">' + '<label for="google_' + numElem + '">Google Ads</label>' + '</div>' + '<div class="advert-checkbox">' + '<input class="advert-checkbox__input" type="checkbox" name="advert-system" value="VK">' + '<label for="vk_' + numElem + '">VK</label>' + '</div>' + '<div class="advert-checkbox">' + '<input class="advert-checkbox__input" type="checkbox" name="advert-system" value="Google Ads">' + '<label for="fb_' + numElem + '">Instagram + Facebook</label>' + '</div>' + '</div>' + '</div>';
    $('.advert-collections').append(collectElem).addClass('can-delete');
    getPriceDev();
    getPriceSev();
});
$('.advert-calc').on('click', function (e) {
    if (e.target.classList.contains('advert-delete-js') && $(e.target).closest('.can-delete').length>0) {
        numElem--;
        $(".js-range-slider").data("ionRangeSlider").update({
            from_min: numElem - 1
        });
        $(e.target).closest('.advert-collection').remove();

        if ($('.advert-collection').length === 1) {
            $('.advert-collections').removeClass('can-delete');
        }

        getPriceDev();
        getPriceSev();
    } // минимум 1 инпут


    if ($(e.target).closest('.advert-checkbox').length > 0) {
        if ($(e.target).parents('.advert-calc__checkbox').find('input:checked').length === 1 && $(e.target).parents('.advert-checkbox').find('input')[0].checked === true) {
            e.preventDefault();
        } else {
            $(e.target).parents('.advert-checkbox').find('input')[0].checked = !$(e.target).parents('.advert-checkbox').find('input')[0].checked;
            getPriceDev();
            getPriceSev();
        }
    }

    if (e.target.tagName === 'SPAN' && $(e.target).closest('.advert-popup__ul').length > 0) {
        console.log($(e.target).prev().is(':checked'));
        $(e.target).prev().prop('checked', !$(e.target).prev().is(':checked'));
        if (e.target.parentNode.classList.contains('advert-popup__parent')) {
            // console.log($(e.target).prev());
            // console.log($(e.target).prev().prop('checked'));
            $(e.target.parentNode.nextElementSibling.querySelectorAll('input')).prop('checked', $(e.target).prev().is(':checked'));
        }
    }

    if (e.target.tagName === 'SPAN' && e.target.parentNode.classList.contains('advert-popup__parent') || e.target.classList.contains('advert-popup__arrow')) {
        if (e.target.tagName === 'SPAN') {
            e.target.parentNode.classList.add('show');
            $(e.target.parentNode.nextElementSibling).slideDown();
        } else {
            e.target.parentNode.classList.toggle('show');
            $(e.target.parentNode.nextElementSibling).slideToggle();
        }
    } // Показать попап регионы


    if (e.target.classList.contains('advert-city-block__city')) {
        var elem = e.target.nextElementSibling;

        var evDoc = function evDoc(e) {
            e.preventDefault();

            if ($(e.target).closest('.advert-popup').length === 0) {
                elem.classList.remove('advert-popup_show');
                setTimeout(function () {
                    elem.classList.add('advert-popup_hide');
                }, 400);
                document.removeEventListener('click', evDoc, false);
            }
        };

        if (elem.classList.contains('advert-popup_hide')) {
            setTimeout(function () {
                document.addEventListener('click', evDoc, false);
            }, 100);
        }

        e.target.nextElementSibling.classList.remove('advert-popup_hide');
        setTimeout(function () {
            e.target.nextElementSibling.classList.add('advert-popup_show');
        }, 100);

        if (!elem.classList.contains('advert-popup_load')) {
            printCities(elem, cities);
        }
    }
});
advPrice.on('click', function (e) {
    if ($(e.target).closest('.advert-ability').length > 0 && $(e.target).closest('.advert-ability').find('input') && !e.target.classList.contains('get-info') && $(e.target).closest('.advert-ability').data('need') !== '1000') {
        if ($(e.target).closest('.advert-ability').data('need') > 50 && !$(e.target).closest('.advert-ability')[0].classList.contains('advert-ability_active')) {
            $(e.target).closest('.advert-ability').find('input').prop('checked', !$(e.target).closest('.advert-ability').find('input').is(':checked'));
            getPriceSev();
        }
    }
});