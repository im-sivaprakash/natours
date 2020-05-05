import '@babel/polyfill';
import { login, logout } from './login';
import { updateData } from './updateData';
import { showAlert } from './alert';
import { bookTour } from './stripe';

const mapbox = document.getElementById('map');
const loginform = document.querySelector('.form--login');
const logOutbutton = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userDataSettings = document.querySelector('.form-user-settings');
const bookBtn = document.getElementById('book-tour');

if (mapbox) {
  const loc = JSON.parse(document.getElementById('map').dataset.locations);
  mapboxgl.accessToken =
    'pk.eyJ1Ijoic2l2YS1zdG9pYyIsImEiOiJjazhidzZrdW0wZ2dwM2xtamxybWRiYWF5In0.z4qEYuRNLRTNKM4tkKKQyg';
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/siva-stoic/ck8bz0kpz0hmh1io0k20rkswm',
  });
}

if (loginform) {
  document.querySelector('.form').addEventListener('submit', (e) => {
    e.preventDefault();
    console.log('hello');

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (logOutbutton) logOutbutton.addEventListener('click', logout);

if (userDataSettings)
  userDataSettings.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.updator-btn').textContent = 'Updateing..';

    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;

    await updateData({ passwordCurrent, password, passwordConfirm }, 'password');

    document.querySelector('.updator-btn').textContent = 'Save Password';

    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });

if (userDataForm) {
  userDataForm.addEventListener('submit', (e) => {
    e.preventDefault();

    console.log(document.getElementById('photo').files[0]);

    const form = new FormData();

    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);

    console.log(form, 'form data');

    updateData(form, 'Data');
  });
}

if (bookBtn) {
  bookBtn.addEventListener('click', (e) => {
    console.log('hio');
    e.target.textContent = 'Processing...';

    const { tourId } = e.target.dataset;

    bookTour(tourId);
  });
}

const alertMessage = document.querySelector('body').dataset.alert;
if (alertMessage) showAlert('success', alertMessage, 20);
