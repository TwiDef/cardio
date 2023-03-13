'use strict';

/* Обьявление необходимых переменных и констант */
const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--temp');
const inputElevation = document.querySelector('.form__input--climb');


/* Получение широты и долготы текущего местоположения */
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
        function (position) {
            const { latitude, longitude } = position.coords;
            console.log(`https://www.google.com/maps/@${latitude},${longitude},13z`);

            const coords = [latitude, longitude];

            /* Отображение карты через leaflet */
            const map = L.map('map').setView(coords, 13); // второй параметр - zoom

            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);

            L.marker(coords).addTo(map)
                .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
                .openPopup();
        },
        function () {
            alert('Невозможно получить вашe местоположение');
        }
    );
}


