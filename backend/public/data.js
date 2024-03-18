export const firebaseConfig = {
    apiKey: process.env.FB_API_KEY,
    authDomain: process.env.FB_AUTH_DOMAIN,
    projectId: process.env.FB_PROJECT_ID,
    storageBucket: process.env.FB_STORAGE_BUCKET,
    messagingSenderId: process.env.FB_MESSAGING_SENDER_ID,
    appId: process.env.FB_APP_ID,
    measurementId: process.env.FB_MEASUREMENT_ID
}

export function getFoodAPI(userInputVal) {
    return `https://api.spoonacular.com/recipes/complexSearch?query=%22${userInputVal}%22&addRecipeInformation=true&apiKey=${process.env.FOOD_API_KEY}`;
}

export const options = {
    method: 'GET',
    headers: {
        'X-RapidAPI-Key': process.env.EXERCISE_API_KEY,
        'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
    }
}