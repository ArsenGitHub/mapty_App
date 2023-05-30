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
  // Предопределяем переменные map и eventMap как "приватные поля"
  #map;
  #mapEvent;

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
    // Использование geolocaton API
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

  // Очищает инпуты, ставит маркеры
  _newWorkout(e) {
    e.preventDefault();

    const { lat, lng } = this.#mapEvent.latlng;
    const clickCoordinates = [lat, lng];

    // Очищаем инпуты формы, после ее отправки
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        '';
    // Создаем маркер на карте, после события отправки формы
    L.marker(clickCoordinates)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          //При добавл. нов. маркера
          autoClose: false,
          // При клике на другой участок
          closeOnClick: false,
          maxWidth: 250,
          maxHeight: 100,
          className: 'running-popup',
          content: '<p>Workout</p>',
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
