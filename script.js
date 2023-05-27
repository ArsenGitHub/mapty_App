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

// Использование geolocaton API
//Проверяем поддерживает ли браузер
if (navigator.geolocation) {
  //Получаем наши координаты
  navigator.geolocation.getCurrentPosition(
    function (position) {
      //Используем деструктуризацию для получения latitude, longitude
      const { latitude } = position.coords;
      const { longitude } = position.coords;

      const myCoordinates = [latitude, longitude];

      // Leaflet API
      const map = L.map('map').setView(myCoordinates, 14);

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      // Применяем прослушиватель из библиотеки Leaflet для определения координат при клике на карту
      map.on('click', function (mapEvent) {
        console.log(mapEvent);

        const { lat, lng } = mapEvent.latlng;
        const clickCoordinates = [lat, lng];

        // Создает маркер на карте
        L.marker(clickCoordinates)
          .addTo(map)
          // Создает попап на маркер, L.popap создает попап внутри попап
          .bindPopup(
            L.popup({
              //Убираем автозакрывание попап, при добавлении нового маркера
              autoClose: false,
              // автозакрывание попап при клике на другой участок
              closeOnClick: false,
              maxWidth: 250,
              maxHeight: 100,
              // Задаем класс для возможности изм-я стилей в CSS
              className: 'running-popup',
              content: '<p>Workout</p>',
            })
          )
          .openPopup();
      });
    },
    function () {
      alert('Can not get your location');
    }
  );
}
