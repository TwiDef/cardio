'use strict';

/* Обьявление необходимых переменных и констант */
const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputTemp = document.querySelector('.form__input--temp');
const inputClimb = document.querySelector('.form__input--climb');

class Workout {
    date = new Date();
    id = (Date.now() + '').slice(-10);

    constructor(coords, distance, duration) {
        this.coords = coords;
        this.distance = distance; // km
        this.duration = duration; // m
    }
}

class Running extends Workout {
    type = 'running';
    constructor(coords, distance, duration, temp) {
        super(coords, distance, duration);
        this.temp = temp;
        this.calculatePace();
    }
    calculatePace() {
        // min/km
        this.pace = this.duration / this.distance;
    }
}

class Cycling extends Workout {
    type = 'cycling';
    constructor(coords, distance, duration, climb) {
        super(coords, distance, duration);
        this.climb = climb;
        this.calculateSpeed();
    }
    calculateSpeed() {
        // km/h
        this.speed = this.distance / (this.duration / 60);
    }
}

//const running = new Running([50, 39], 7, 40, 170);
//const cycling = new Cycling([50, 39], 37, 80, 370);
//console.log(running);
//console.log(cycling);

class App {
    /* #map;
    #mapEvent; */

    constructor(map, mapEvent) {
        this._workouts = [];
        this._map = map;
        this._mapEvent = mapEvent;
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
        this._mapEvent = e;
        form.classList.remove('hidden');
        inputDistance.focus();
    }

    _toggleClimbField() {
        inputClimb.closest('.form__row').classList.toggle('form__row--hidden');
        inputTemp.closest('.form__row').classList.toggle('form__row--hidden');
    }

    _newWorkout(e) {
        const areNumbers = (...numbers) => {
            return numbers.every(num => Number.isFinite(num));
        };
        const areNumbersPositive = (...numbers) => {
            return numbers.every(num => num > 0);
        };

        e.preventDefault();
        const { lat, lng } = this._mapEvent.latlng;
        let workout;

        // Получение данных из формы
        const type = inputType.value;
        const distance = +inputDistance.value;
        const duration = +inputDuration.value;

        // Если тренировка - Running, создать обьект Running
        if (type === 'running') {
            const temp = +inputTemp.value;

            // Проверка валидности данных
            if (!areNumbers(distance, duration, temp) || !areNumbersPositive(distance, duration, temp)) {
                return alert('Введите положительное число');
            }

            workout = new Running([lat, lng], distance, duration, temp);
        }

        // Если тренировка - Cycling, создать обьект Cycling
        if (type === 'cycling') {
            const climb = +inputClimb.value;

            // Проверка валидности данных
            if (!areNumbers(distance, duration, climb) || !areNumbersPositive(distance, duration, climb)) {
                return alert('Введите положительное число');
            }

            workout = new Cycling([lat, lng], distance, duration, climb);
        }

        // Добавить новый обьект в массив тренировок
        this._workouts.push(workout);
        console.log(workout);

        // Отобразить тренировку на карте
        this.displayWorkout(workout);

        // Отобразить тренировку в списке

        // Спрятать форму и очистить поля ввода данных
        inputDistance.value = inputDuration.value = inputTemp.value = inputClimb.value = '';
    }
    displayWorkout(workout) {
        L.marker(workout.coords)
            .addTo(this.map)
            .bindPopup(L.popup({
                autoClose: false,
                closeOnClick: false,
                className: `${workout.type}-popup`
            }))
            .setPopupContent('Тренировка')
            .openPopup();
    }
}

const app = new App();


