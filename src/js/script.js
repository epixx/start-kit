import alert from './alert.js';

const button = document.querySelector('.j-button');

button.addEventListener('click', (event) => {
  alert(event);
});
