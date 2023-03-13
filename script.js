'use strict';

/* Обьявление необходимых переменных и констант */
const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputTemp = document.querySelector('.form__input--temp');
const inputClimb = document.querySelector('.form__input--climb');


class App {
    #map;
    #mapEvent;

    constructor() {
        this._getPosition();
        form.addEventListener('submit', this._newWorkout.bind(this));
        inputType.addEventListener('change', this._toggleClimbField);
    }
    _getPosition() {
        /* Получение широты и долготы текущего местоположения */
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                this._loadMap.bind(this),
                /* Ошибка при неуспешной загрузки карты */
                function () {
                    alert('Невозможно получить вашe местоположение');
                }
            );
        }
    }
    _loadMap(position) {
        const { latitude, longitude } = position.coords;
        console.log(`https://www.google.com/maps/@${latitude},${longitude},13z`);

        const coords = [latitude, longitude];
        /* Отображение карты через leaflet */
        console.log(this);
        this.map = L.map('map').setView(coords, 13); // второй параметр - zoom

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.map);

        // Обработка клика на карте
        this.map.on('click', this._showForm.bind(this));
    }
    _showForm(e) {
        this.#mapEvent = e;
        form.classList.remove('hidden');
        inputDistance.focus();
    }

    _toggleClimbField() {
        inputClimb.closest('.form__row').classList.toggle('form__row--hidden');
        inputTemp.closest('.form__row').classList.toggle('form__row--hidden');
    }

    _newWorkout(e) {
        e.preventDefault();
        // Очистка полей ввода данных
        inputDistance.value = inputDuration.value = inputTemp.value = inputClimb.value = '';
        // Получение широты и долготы маркера 
        const { lat, lng } = this.#mapEvent.latlng;

        // Установка настроек маркера 
        L.marker([lat, lng])
            .addTo(this.map)
            .bindPopup(L.popup({
                autoClose: false,
                closeOnClick: false,
                className: 'running-popup'
            }))
            .setPopupContent('Тренировка')
            .openPopup();
    }
}

const app = new App();

console.log();

