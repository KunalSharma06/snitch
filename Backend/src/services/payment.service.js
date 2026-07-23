// import Razorpay from 'razorpay';
// import { config } from '../config/config.js';

// const razorpayInstance = new Razorpay({
//   razorpay_key_id: config.RAZORPAY_KEY_ID,
//   razorpay_key_secret: config.RAZORPAY_KEY_SECRET,
// })

// export const createOrder = async ({ amount, currency = 'INR' }) => {
//   const options = {
//     amount: amount * 100,
//     currency
//   }
//   const order = await razorpayInstance.orders.create(options);
//   return order;
// }