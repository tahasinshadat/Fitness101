export const firebaseConfig = {
    apiKey: "AIzaSyD_exs5Gzs9OG8VBnk7PvZsrPCjULKMna4",
    authDomain: "fir-login-project-221aa.firebaseapp.com",
    projectId: "fir-login-project-221aa",
    storageBucket: "fir-login-project-221aa.appspot.com",
    messagingSenderId: "880454223855",
    appId: "1:880454223855:web:1f42abb058b95a65ced81a",
    measurementId: "G-Q1Q7LS555N"
}

export function getFoodAPI(userInputVal) {
    return `https://api.spoonacular.com/recipes/complexSearch?query=%22${userInputVal}%22&addRecipeInformation=true&apiKey=a834f2a6b58545049b02148bee1c978e`;
}

export const options = {
    method: 'GET',
    headers: {
        'X-RapidAPI-Key': 'f2374c1df8msh0628c9f48ee3710p12bd74jsn2e2411896308',
        'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
    }
}