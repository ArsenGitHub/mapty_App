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

// Предопределяем переменные map и eventMap
let map, mapEvent;

// Использование geolocaton API
if (navigator.geolocation) {
  //Наши координаты
  navigator.geolocation.getCurrentPosition(
    function (position) {
      const { latitude } = position.coords;
      const { longitude } = position.coords;
      const myCoordinates = [latitude, longitude];

      // Leaflet API
      map = L.map('map').setView(myCoordinates, 14);

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      map.on('click', function (mapE) {
        mapEvent = mapE;

        // Отображаем форму
        form.classList.remove('hidden');
        inputDistance.focus();
      });
    },
    function () {
      alert('Can not get your location');
    }
  );
}

// Прослушиваем событие отправки формы
form.addEventListener('submit', function (e) {
  e.preventDefault();

  const { lat, lng } = mapEvent.latlng;
  const clickCoordinates = [lat, lng];

  // Очищаем инпуты формы, после ее отправки
  inputDistance.value =
    inputDuration.value =
    inputCadence.value =
    inputElevation.value =
      '';
  // Создаем маркер на карте, после события отправки формы
  L.marker(clickCoordinates)
    .addTo(map)
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
});

// Меняем отображение инпута cadence на elevation и наоборот
inputType.addEventListener('change', function () {
  inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
});
