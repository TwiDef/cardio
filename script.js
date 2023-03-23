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
    clickNumber = 0;

    constructor(coords, distance, duration) {
        this.coords = coords;
        this.distance = distance; // km
        this.duration = duration; // m
    }
    _setDescription() {
        if (this.type === 'running') {
            this.description = `Пробежка ${new Intl.DateTimeFormat('ru-Ru').format(this.date)}`;
        } else {
            this.description = `Велотренировка ${new Intl.DateTimeFormat('ru-Ru').format(this.date)}`;
        }
    }
    click() {
        this.clickNumber++;
    }
}

class Running extends Workout {
    type = 'running';
    constructor(coords, distance, duration, temp) {
        super(coords, distance, duration);
        this.temp = temp;
        this.calculatePace();
        this._setDescription();
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
        this._setDescription();
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
        this._getLocalStorageData();
        form.addEventListener('submit', this._newWorkout.bind(this));
        inputType.addEventListener('change', this._toggleClimbField);
        containerWorkouts.addEventListener('click', this._moveToWorkout.bind(this));
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

        // Отображение тренировок из Local storage
        this._workouts.forEach(workout => {
            this._displayWorkout(workout);
        });
    }
    _showForm(e) {
        this._mapEvent = e;
        form.classList.remove('hidden');
        inputDistance.focus();
    }
    _hideForm() {
        inputDistance.value = inputDuration.value = inputTemp.value = inputClimb.value = '';
        form.classList.add('hidden');
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
        this._displayWorkout(workout);

        // Отобразить тренировку в списке
        this._displayWorkoutOnSidebar(workout);

        // Спрятать форму и очистить поля ввода данных
        this._hideForm();

        // Добавить в Local Storage
        this._addWorkoutsToLocalStorage();
    }
    _displayWorkout(workout) {
        L.marker(workout.coords)
            .addTo(this.map)
            .bindPopup(L.popup({
                autoClose: false,
                closeOnClick: false,
                className: `${workout.type}-popup`
            }))
            .setPopupContent(`${workout.type === 'running' ? '🏃' : '🚵‍♂️'} ${workout.description}`)
            .openPopup();
    }
    _displayWorkoutOnSidebar(workout) {
        let html = `
        <li class="workout workout--${workout.type}" data-id="${workout.id}">
            <h2 class="workout__title">${workout.description}</h2>
            <div class="workout__details">
                <span class="workout__icon">${workout.type === 'running' ? '🏃' : '🚵‍♂️'}</span>
                <span class="workout__value">${workout.distance}</span>
                <span class="workout__unit">км</span>
            </div>
            <div class="workout__details">
                <span class="workout__icon">⏱</span>
                <span class="workout__value">${workout.duration}</span>
                <span class="workout__unit">мин</span>
            </div>
        `;
        if (workout.type === 'running') {
            html += `
                <div class="workout__details">
                    <span class="workout__icon">📏⏱</span>
                    <span class="workout__value">${workout.pace.toFixed(2)}</span>
                    <span class="workout__unit">мин/км</span>
                </div>
                <div class="workout__details">
                    <span class="workout__icon">👟⏱</span>
                    <span class="workout__value">${workout.temp}</span>
                    <span class="workout__unit">шаг/мин</span>
                </div>
            </li>
            `;
        }
        if (workout.type === 'cycling') {
            html += `
                <div class="workout__details">
                    <span class="workout__icon">📏⏱</span>
                    <span class="workout__value">${workout.speed.toFixed(2)}</span>
                    <span class="workout__unit">км/ч</span>
                </div>
                <div class="workout__details">
                    <span class="workout__icon">🏔</span>
                    <span class="workout__value">${workout.climb}</span>
                    <span class="workout__unit">м</span>
                </div>
            </li>
            `;
        }
        form.insertAdjacentHTML('afterend', html);
    }
    _moveToWorkout(e) {
        const workoutElement = e.target.closest('.workout');
        if (!workoutElement) return;

        const workout = this._workouts.find(item => item.id === workoutElement.dataset.id);
        this.map.setView(workout.coords, 13, {
            animate: true,
            pan: {
                duration: 1
            }
        });
        //workout.click();
    }
    _addWorkoutsToLocalStorage() {
        localStorage.setItem('workouts', JSON.stringify(this._workouts));
    }
    _getLocalStorageData() {
        const data = JSON.parse(localStorage.getItem('workouts'));

        if (!data) return;

        this._workouts = data;
        this._workouts.forEach(workout => {
            this._displayWorkoutOnSidebar(workout);
        });

    }

    reset() {
        localStorage.removeItem('workouts');
        location.reload();
    }
}

const app = new App();


