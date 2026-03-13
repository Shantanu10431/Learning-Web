const axios = require('axios');

async function checkLiveSignup() {
    console.log('Hitting live Vercel endpoint...');
    try {
        const res = await axios.post('https://learning-web-lac.vercel.app/api/auth/signup', {
            name: "Test Debug",
            email: "debugxyz@test.com",
            password: "password",
            role: "student"
        });
        console.log("SUCCESS:", res.data);
    } catch (err) {
        console.error("FAIL:", err.response?.data || err.message);
    }
}

checkLiveSignup();
