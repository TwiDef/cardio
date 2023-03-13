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


            map.on('click', function (mapEvent) {
                console.log(mapEvent);

                /* Получение широты и долготы маркера */
                const { lat, lng } = mapEvent.latlng;

                /* Установка настроек маркера */
                L.marker([lat, lng])
                    .addTo(map)
                    .bindPopup(L.popup({
                        autoClose: false,
                        closeOnClick: false,
                        className: 'running-popup'
                    }))
                    .setPopupContent('Тренировка')
                    .openPopup();
            });
        },

        /* Ошибка при неуспешной загрузки карты */
        function () {
            alert('Невозможно получить вашe местоположение');
        }
    );
}


