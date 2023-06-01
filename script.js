'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

// Класс со всем функционалом прил-я
class App {
  #map;
  #mapEvent;
  #workouts = [];

  constructor() {
    // Получаем геопозицию + _loadMap(отображение карты), событие клик на карте.on + _showForm(отображение формы)
    this._getPosition();
    //  Событие отправки формы, очищает инпуты, ставит маркеры
    form.addEventListener('submit', this._newWorkout.bind(this));
    // Изменение инпута cadence на elevation и наоборот
    inputType.addEventListener('change', this._toggleElvationFielf);
  }
  // Получаем координаты, при удачной попытке выз-ся метод _loadMap
  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert('Can not get your location');
        }
      );
    }
  }

  // Прогрузка карты
  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    const myCoordinates = [latitude, longitude];

    // Leaflet API
    this.#map = L.map('map').setView(myCoordinates, 14);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    // Прослушиваем клик на карту
    this.#map.on('click', this._showForm.bind(this));
  }

  // Отображаем форму, назначаем значение mapEvent
  _showForm(mapE) {
    this.#mapEvent = mapE;
    // Отображаем форму
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  // Изменение инпута cadence на elevation и наоборот
  _toggleElvationFielf() {
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
  }

  // Создает новый обьект с тренировкой и ставит маркер
  _newWorkout(e) {
    e.preventDefault();

    // Функция для проверки валидности инпутов
    const checkValid = (...arg) => {
      return arg.every(val => val > 0);
    };

    // Координаты клика ч/з mapEvent Leafleat
    const { lat, lng } = this.#mapEvent.latlng;
    const clickCoordinates = [lat, lng];

    // Данные из инпутов формы
    const typeVal = inputType.value;
    const distanceVal = +inputDistance.value;
    const durationVal = +inputDuration.value;
    const cadenceOrElevatVal =
      typeVal === 'running' ? +inputCadence.value : +inputElevation.value;

    // Проверяем на валидность
    if (!checkValid(distanceVal, durationVal, cadenceOrElevatVal))
      return alert('All inputs must be filled in and be greater than 0');

    // Создаем обьект(экземпляр) с тренировкой
    const workout =
      typeVal === 'running'
        ? new Running(
            distanceVal,
            durationVal,
            clickCoordinates,
            cadenceOrElevatVal
          )
        : new Cycling(
            distanceVal,
            durationVal,
            clickCoordinates,
            cadenceOrElevatVal
          );

    // Массив со всеми тренями
    this.#workouts.push(workout);

    // Отображаем маркер с попапом
    this.renderWorkoutMarker(workout);

    // Очищаем инпуты формы, после ее отправки
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        '';
  }

  //Создает маркер на карте
  renderWorkoutMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          //При добавл. нов. маркера
          autoClose: false,
          // При клике на другой участок
          closeOnClick: false,
          maxWidth: 250,
          maxHeight: 100,
          className: `${inputType.value}-popup`,
          content: `<p>${workout.distance}</p>`,
        })
      )
      .openPopup();
  }
}

// Классы для работы с данными
class Workout {
  // Публичные(внешние) поля
  date = new Date();
  // В качестве id просто возьмем кусок даты
  id = (Date.now() + '').slice(-10);

  constructor(distance, duration, coords) {
    this.distance = distance;
    this.duration = duration;
    this.coords = coords; // [lat, lng]
  }
}

class Running extends Workout {
  constructor(distance, duration, coords, cadence) {
    super(distance, duration, coords);
    this.cadence = cadence;
    //Вызываем сразу же при создании экземпляра
    this.calcPace();
  }

  // Мин/метр
  calcPace() {
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends Workout {
  constructor(distance, duration, coords, elevationGain) {
    super(distance, duration, coords);
    this.elevationGain = elevationGain;
    //Вызываем сразу же при создании экземпляра
    this.calcSpeed();
  }

  // Скорость в км/ч
  calcSpeed() {
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

// Создаем экземпляр класса App
const app = new App();
