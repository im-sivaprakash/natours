import axios from 'axios';
import { showAlert } from './alert';
const stripe = Stripe('ppk_test_vKJXjFcdexmhKTBcTMZvqLDj00a6HEFE5V');

export const bookTour = async (tourId) => {
  try {
    // 1) Get checkout session from API
    const session = await axios({
      method: 'GET',
      url: `http://127.0.0.1:8000/api/v1/bookings/checkout-session/${tourId}`,
    });
    console.log(JSON.stringify(session));
    // 2) Create checkout form + chanre credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
