'use strict';
let cities = [];
$.getJSON('region.json', function (data) {
    cities = data;
});

let numElem = 1;
let budget = 0;
let priceOptions = 0;

const testBudget = ((rs, theme)=>{
    console.log('Кол-во рс: ' + rs + '; тематик: ' + theme + '; Бюджет: ' + Math.round(((1 - (theme - 1) * 0.1) * theme * rs * 20000) + (priceOptions * theme) - (0.01 * budget)));
});

function debounce(func, wait, immediate) {
    let timeout;

    return function executedFunction() {
        const context = this;
        const args = arguments;

        const later = function () {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };

        const callNow = immediate && !timeout;

        clearTimeout(timeout);

        timeout = setTimeout(later, wait);

        if (callNow) func.apply(context, args);
    };
};

const getPriceOptions = (() => {
    priceOptions = 0;
    $('.advert-ability:not(.advert-ability_active) input:checked').each((key, item) => {
        if (item.closest('.advert-ability').dataset.price && !item.closest('advert-ability_active'))
            priceOptions += parseInt(item.closest('.advert-ability').dataset.price);
    });
});

const advPrice = $('.advert-price');
const elem50 = advPrice.find('.advert-ability[data-need]');
const cycleRange = ((num) => {
    for (let i = 0; i < num; i++) {
        elem50.get(i).classList.add('advert-ability_active');
        elem50.get(i).querySelector('input').checked = true;
    }
    for (let z = num; z < elem50.length; z++) {
        elem50.get(z).classList.remove('advert-ability_active');
        elem50.get(z).querySelector('input').checked = false;
    }
});

//Фильтрация по городам
const filterCities = debounce(function () {
    const inpWord = this.value;
    let allLi = $(this.nextElementSibling).find('li');
    const allParent = $(this.nextElementSibling).find('li.advert-popup__parent');
    if (this.value !== '' && this.value.length >= 3) {
        allLi.css('display', function () {
            let classRes = '';
            const hasWord = this.querySelector('input').value.toLowerCase().indexOf(inpWord.toLowerCase());
            if (hasWord !== -1) {
                classRes = 'block';
            } else {
                classRes = 'none'
            }
            const liParent = this.parentElement;
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

const printCities = ((modal, cityArr) => {
    modal.classList.add('advert-popup_load');
    const contElem = modal.querySelector('.advert-popup__cont');
    contElem.previousElementSibling.addEventListener('keyup', filterCities);
    let domElems = document.createElement('ul');
    domElems.classList.add('advert-popup__ul');
    const printFn = ((thisParent, arr) => {
        arr.forEach((item) => {
            let newParent = '';
            let liElem = document.createElement('li');
            liElem.innerHTML = '' +
                '<input name="advert-popup" type="checkbox" value="' + item.name + '">' +
                '<span>' + item.name + '</span>';
            if (item.areas.length > 0) {
                let arrow = document.createElement('div');
                arrow.classList.add('advert-popup__arrow');
                liElem.classList.add('advert-popup__parent');
                liElem.prepend(arrow);
                newParent = document.createElement('li');
                printFn(newParent, item.areas)
            }
            thisParent.appendChild(liElem);
            if (newParent)
                thisParent.appendChild(newParent);
        });
    });
    contElem.innerHTML = '';
    printFn(domElems, cityArr);
    contElem.appendChild(domElems);
});
const getPriceDev = (() => {
    let countCompany = 0;
    let activeRS = $('.advert-checkbox input[data-dev]:checked').length;
    $('.advert-collection').each((key, item) => {
        if (item.querySelectorAll('input[data-dev]:checked').length > 0) {
            countCompany++;
        }
    });
    let devResult = Math.round((1 - (countCompany - 1) * 0.1) * activeRS * 25000);
    $('.js-price-dev').html(devResult + ' ₽');
});

const getPriceSev = (() => {
    getPriceOptions();
    let obCount = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
    };
    let price = 0;

    let elemAr = [];
    let countAdvAllNew = $('.advert-collections .advert-collection');
    countAdvAllNew.each((key, item) => {
        elemAr.push($(item).find('input:checked'))
    });

    elemAr.forEach((res) => {
        console.log(res);
        obCount[res.length]++;
    });
    for (let key in obCount) {
        if (obCount[key] > 0) {
            testBudget(obCount[key], key);
            price += Math.round(((1 - (key - 1) * 0.1) * key * obCount[key] * 20000) + (priceOptions * key) - (0.01 * budget))
        }
    }
    $('.js-price-serv').html(price + ' ₽');
    console.log(price);

});
$(".js-range-slider").ionRangeSlider({
    from: 2,
    grid: true,
    grid_snap: true,
    values: [
        '50',
        '100',
        '150',
        '200',
        '250',
        '300',
        '350',
        '400',
        '450',
        '500',
        '550',
        '600',
        '650',
        '700',
        '750',
        '800',
        '850',
        '900',
        '950',
        '1 млн',
        '∞',
    ],
    onChange: function (data) {
        advPrice.removeClass('advert-price_infinity');
        if (typeof data.from_value === 'number') {
            cycleRange((data.from_value - 50) / 50);
            $('.advert-graph__price').html(data.from_value + ' 000 ₽');
            if (data.from_value >= 150)
                budget = data.from_value * 1000;
        } else if (data.from_value === '1 млн') {
            elem50.addClass('advert-ability_active');
            $('.advert-price .advert-ability[data-need] input').prop('checked', true);
            $('.advert-graph__price').html('1 000 000 ₽');
            budget = 1000000;
        } else {
            advPrice.addClass('advert-price_infinity');
            $('.advert-graph__price').html('Не ограничен');
        }
        getPriceSev();
    },
    onStart: function (data) {
        budget = data.from_value * 1000;
    }
});
$('#advert-add-theme').on('click', () => {
    numElem++;
    let collectElem = document.createElement('div');
    collectElem.classList.add('advert-collection');
    collectElem.innerHTML = '' +
        '<div class="row align-items-center">' +
        '<div class="advert-calc__text-col vam-child">' +
        '<span class="advert-calc__title">Название тематики</span>' +
        '<div class="get-info" data-info-id=""></div>' +
        '</div>' +
        '<div class="advert-theme-block">' +
        '<div class="input-group advert-theme-block__input">' +
        '<input type="text" class="input-group__input" name="name" autocomplete="off" placeholder="-"' +
        '   required>' +
        '<span class="bar"></span>' +
        '<label>Введите название</label>' +
        '</div>' +
        '</div>' +
        '<div class="advert-city-block">' +
        '<div class="advert-city-block__in">' +
        '<span class="advert-city-block__city">Санкт-Петербург и ЛО</span>' +
        '<div class="advert-popup advert-popup_hide">' +
        '<span class="advert-popup__title">Выберите регион</span>' +
        '<input type="text" class="advert-popup__filter" placeholder="Найти регион">' +
        '<div class="advert-popup__cont">' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<div class="advert-delete-block">' +
        '<span class="advert-delete-js">- Убрать</span>' +
        '</div>' +
        '</div>' +
        '<div class="row align-items-center advert-calc__second-block">' +
        '<div class="advert-calc__text-col vam-child">' +
        '<span class="advert-calc__title">Рекламная система</span>' +
        '<div class="get-info" data-info-id=""></div>' +
        '</div>' +
        '<div class="advert-calc__checkbox">' +
        '<div class="advert-checkbox">' +
        '<input class="advert-checkbox__input" type="checkbox" name="advert-system" value="Яндекс.Директ" data-dev="25000" checked>' +
        '<label for="yd_' + numElem + '">Яндекс.Директ</label>' +
        '</div>' +
        '<div class="advert-checkbox">' +
        '<input class="advert-checkbox__input" type="checkbox" name="advert-system" value="Google Ads" data-dev="25000">' +
        '<label for="google_' + numElem + '">Google Ads</label>' +
        '</div>' +
        '<div class="advert-checkbox">' +
        '<input class="advert-checkbox__input" type="checkbox" name="advert-system" value="VK">' +
        '<label for="vk_' + numElem + '">VK</label>' +
        '</div>' +
        '<div class="advert-checkbox">' +
        '<input class="advert-checkbox__input" type="checkbox" name="advert-system" value="Google Ads">' +
        '<label for="fb_' + numElem + '">Instagram + Facebook</label>' +
        '</div>' +
        '</div>' +
        '</div>';
    $('.advert-collections').append(collectElem).addClass('can-delete');
    getPriceDev();
    getPriceSev();
});

$('.advert-calc').on('click', (e) => {
    if (e.target.classList.contains('advert-delete-js') && e.target.closest('.can-delete')) {
        numElem--;
        e.target.closest('.advert-collections').removeChild(e.target.closest('.advert-collection'));
        if ($('.advert-collection').length === 1) {
            $('.advert-collections').removeClass('can-delete');
        }
        getPriceDev();
        getPriceSev();
    }
    // минимум 1 инпут
    if (e.target.closest('.advert-checkbox')) {
        if (e.target.closest('.advert-calc__checkbox').querySelectorAll('input:checked').length === 1 && e.target.closest('.advert-checkbox').querySelector('input').checked) {
            e.preventDefault();
        } else {
            e.target.closest('.advert-checkbox').querySelector('input').checked = !e.target.closest('.advert-checkbox').querySelector('input').checked;
            getPriceDev();
            getPriceSev();
        }
    }
    if (e.target.tagName === 'SPAN' && e.target.closest('.advert-popup__ul')) {
        e.target.previousElementSibling.checked = !e.target.previousElementSibling.checked;
        if (e.target.parentNode.classList.contains('advert-popup__parent')) {
            $(e.target.parentNode.nextElementSibling.querySelectorAll('input')).prop('checked', e.target.previousElementSibling.checked);
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
    }
    if (e.target.classList.contains('advert-city-block__city')) {
        let elem = e.target.nextElementSibling;
        const evDoc = ((e) => {
            e.preventDefault();
            if (!e.target.closest('.advert-popup')) {
                elem.classList.remove('advert-popup_show');
                setTimeout(() => {
                    elem.classList.add('advert-popup_hide');
                }, 400);
                document.removeEventListener('click', evDoc, false);
            }
        });
        if (elem.classList.contains('advert-popup_hide')) {
            setTimeout(() => {
                document.addEventListener('click', evDoc, false);
            }, 100);
        }
        e.target.nextElementSibling.classList.remove('advert-popup_hide');
        setTimeout(() => {
            e.target.nextElementSibling.classList.add('advert-popup_show');
        }, 100);
        if (!elem.classList.contains('advert-popup_load')) {
            printCities(elem, cities);
        }
    }
});

advPrice.on('click', (e) => {
    if (e.target.closest('.advert-ability') && e.target.closest('.advert-ability').querySelector('input') && e.target.closest('.advert-ability').dataset.need !== '1000') {
        if (e.target.closest('.advert-ability').dataset.need > 50 && !e.target.closest('.advert-ability').classList.contains('advert-ability_active')) {
            e.target.closest('.advert-ability').querySelector('input').checked = !e.target.closest('.advert-ability').querySelector('input').checked;
            getPriceSev();
        }
    }
});