export const firebaseConfig = {
    apiKey: window.env.FB_API_KEY,
    authDomain: window.env.FB_AUTH_DOMAIN,
    projectId: window.env.FB_PROJECT_ID,
    storageBucket: window.env.FB_STORAGE_BUCKET,
    messagingSenderId: window.env.FB_MESSAGING_SENDER_ID,
    appId: window.env.FB_APP_ID,
    measurementId: window.env.FB_MEASUREMENT_ID
}

export function getFoodAPI(userInputVal) {
    return `https://api.spoonacular.com/recipes/complexSearch?query=%22${userInputVal}%22&addRecipeInformation=true&apiKey=${window.env.FOOD_API_KEY}`;
}

export const options = {
    method: 'GET',
    headers: {
        'X-RapidAPI-Key': window.env.EXERCISE_API_KEY,
        'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
    }
}