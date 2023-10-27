import { firebaseConfig } from '../secure.js';

// inititalize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const firestore = firebase.firestore();
let user_ID;

// Check for if the user is logged in or out:
auth.onAuthStateChanged(user =>{
    if (user == null) {
        window.location.href = "../index.html";
    } else {
        console.log('user logged in');
        user_ID = user.uid;
        copyFavoriteFoodToCache(user_ID);
        console.log(userFavoriteFoodCache);
    }
});

const usersCollection = firestore.collection('users');

// Initialize an empty local cache for the user's favorite foods
let userFavoriteFoodCache = {};

// Function to copy the user's favorite foods into the cache
function copyFavoriteFoodToCache(userId) {
    usersCollection.doc(userId).get().then((doc) => {
        if (doc.exists) {
            const userData = doc.data();
            userFavoriteFoodCache[userId] = userData.favoriteFoods || { IDS: {}, NAMES: [] };
        }
    }).catch((error) => {
        console.error("Error copying favorite foods to cache:", error);
    });
}










// API Stuff
let globalData;

let user_input = document.getElementById("userInput")
let foodSubmitBtn = document.getElementById("foodSubmit")

let foodapi;
let userInputVal;

foodSubmitBtn.onclick = (event) => {
	event.preventDefault()
	userInputVal = user_input.value
	// console.log(userInputVal)

	foodapi = `https://api.spoonacular.com/recipes/complexSearch?query=%22${userInputVal}%22&addRecipeInformation=true&apiKey=a834f2a6b58545049b02148bee1c978e`

	fetch(foodapi)
		.then(function(response) {
			return response.json();
		})
		.then(function(data) {
			globalData = data.results;
			// console.log(globalData);
			foodContainer.innerHTML = ""

            for (let i = 0; i < globalData.length; i++) {

                // Setup
                let newDiv = document.createElement("div");
                newDiv.classList.add('col-md-12', 'col-lg-6');
                let cardDiv = document.createElement('div');
                cardDiv.classList.add('card', 'z-depth-3');

                // Image + Icon
                let cardImgDiv = document.createElement("div");
                cardImgDiv.classList.add('card-image');
                let foodImg = document.createElement("img");
                foodImg.src = globalData[i].image;

                let heart = document.createElement("a");
                heart.classList.add('halfway-fab', 'btn-floating', 'pink', 'pulse');
                let heartIcon =  document.createElement("i");
                heartIcon.innerHTML = 'favorite';

                const foodId = globalData[i].id;
                if (userFavoriteFoodCache[user_ID].IDS[foodId] != undefined) heartIcon.className = "material-icons cyan-text";
                else heartIcon.className = "material-icons";

                heartIcon.addEventListener('click', () => {
                
                    // Reference to the user's document in Firestore
                    const userDocRef = usersCollection.doc(user_ID);
                
                    // Check if the heart icon has the "red-heart" class
                    const isHearted = heartIcon.classList.contains('cyan-text');
                
                    userDocRef.update({
                        [`favoriteFoods.IDS.${foodId}`]: isHearted ? firebase.firestore.FieldValue.delete() : foodId,
                        ['favoriteFoods.NAMES']: firebase.firestore.FieldValue.arrayUnion(userInputVal)
                    })
                    .then(() => {                        
                        // Toggle the "red-heart" class to change the color
                        if (isHearted) {
                            heartIcon.classList.remove('cyan-text');
                        } else {
                            heartIcon.classList.add('cyan-text');
                        }
                    })
                    .catch((error) => {
                        console.error('Error adding/removing foods from favorites:', error);
                    });
                });

                if (Math.random() < 0.15) {
                    let popular = document.createElement("a");
                    popular.classList.add('halfway-fab', 'btn-floating', 'blue', 'pulse', 'left');
                    let upIcon = document.createElement("i");
                    upIcon.classList.add('material-icons');
                    upIcon.innerHTML = 'trending_up';
                    popular.append(upIcon);
                    heart.append(heartIcon);
                    cardImgDiv.append(foodImg, popular, heart);
                } else {
                    heart.append(heartIcon);
                    cardImgDiv.append(foodImg, heart);
                }

                // Title + description
                let cardContent = document.createElement('div');
                cardContent.classList.add('card-content');
                let title = document.createElement('span');
                title.classList.add('card-title');
                title.innerHTML = globalData[i].title;
                let description = document.createElement('p');
                description.innerHTML = globalData[i].summary;

                cardContent.append(title, description);

                // Actions
                let cardAction = document.createElement("div");
                cardAction.classList.add('card-action');
                let details = document.createElement("a");
                details.classList.add('btn', 'waves-effect');
                details.innerHTML = 'Important Details';
                let create = document.createElement("a");
                create.classList.add('btn', 'waves-effect');
                create.innerHTML = 'How To Make';

                cardAction.append(details, create);

                // Action functionality
                let stepsDiv = document.createElement('div');
				let stepsData = globalData[i].analyzedInstructions[0].steps
				for (let j = 0; j < stepsData.length; j++) {  // Format Food Steps
					let stepNum = stepsData[j].number;
					let step = stepsData[j].step;
					let fullStep = document.createElement('p');
					fullStep.innerHTML = "<strong>" + stepNum + '</strong>' + ". " + step;
					stepsDiv.append(fullStep);
				}
                let openOrClosed = 0;
                create.onclick =  () => {
					if (openOrClosed == 0) {
                        description.innerHTML = stepsDiv.innerHTML; // replace description
                        openOrClosed2 = 0;
						details.innerHTML = "Important Details"; // update button
                        details.classList.remove('red', 'accent-1'); // remove style
						openOrClosed += 1;
                        create.classList.add('red', 'accent-1'); // update style 
						create.innerHTML = "Close"
					}
					else if (openOrClosed == 1) {
						description.innerHTML = globalData[i].summary; // revert description
						openOrClosed = 0;
                        create.classList.remove('red', 'accent-1'); // remove style
						create.innerHTML = "How To Make"
					}
				}

                let vegan = document.createElement("p")
				if (globalData[i].vegan == true) {
					vegan.innerHTML = "This dish is Vegan"
				} else {
					vegan.innerHTML = "This dish is not Vegan"
				}

				let vegetarian = document.createElement("p")
				if (globalData[i].vegetarian == true) {
					vegetarian.innerHTML = "This dish is Vegetarian"
				} else {
					vegetarian.innerHTML = "This dish is not Vegetarian"
				}

				let healthy = document.createElement("p")
				if (globalData[i].veryHealthy == true) {
					healthy.innerHTML = "This dish is very healthy"
				} else {
					healthy.innerHTML = "This dish is not healthy"
				}
                let detailsDiv = document.createElement('div');
                detailsDiv.append(vegan, vegetarian, healthy);
                let openOrClosed2 = 0;

                details.onclick =  () => {
					if (openOrClosed2 == 0) {
						description.innerHTML = detailsDiv.innerHTML;  // replace description
                        openOrClosed = 0;
						create.innerHTML = "How To Make";  // update button
                        create.classList.remove('red', 'accent-1'); // remove style
						openOrClosed2 += 1;
                        details.classList.add('red', 'accent-1'); // update style 
						details.innerHTML = "Close";
					}
					else if (openOrClosed2 == 1) {
						description.innerHTML = globalData[i].summary; // revert description
						openOrClosed2 = 0;
                        details.classList.remove('red', 'accent-1'); // remove style 
						details.innerHTML = "Important Details";
					}
				}

                cardDiv.append(cardImgDiv, cardContent, cardAction);
                newDiv.append(cardDiv);
                foodContainer.appendChild(newDiv);
            }
	    })
}




let popularFoodsContainer = document.getElementById('Popular-Picks-Container');
function popularPicks(pick) {
    foodapi = `https://api.spoonacular.com/recipes/complexSearch?query=%22${pick}%22&addRecipeInformation=true&apiKey=a834f2a6b58545049b02148bee1c978e`;
	fetch(foodapi)
		.then(function(response) {
			return response.json();
		})
		.then(function(data) {
			globalData = data.results;
            // Setup
            let newDiv = document.createElement("div");
            newDiv.classList.add('col-md-12', 'col-lg-6');
            let cardDiv = document.createElement('div');
            cardDiv.classList.add('card', 'z-depth-3');

            // Image + Icon
            let cardImgDiv = document.createElement("div");
            cardImgDiv.classList.add('card-image');
            let foodImg = document.createElement("img");
            foodImg.src = globalData[0].image;
            let heart = document.createElement("a");
            heart.classList.add('halfway-fab', 'btn-floating', 'blue', 'pulse');
            let heartIcon =  document.createElement("i");
            heartIcon.classList.add('material-icons');
            heartIcon.innerHTML = 'trending_up';

            heart.append(heartIcon);
            cardImgDiv.append(foodImg, heart);

            // Title + description
            let cardContent = document.createElement('div');
            cardContent.classList.add('card-content');
            let title = document.createElement('span');
            title.classList.add('card-title');
            title.innerHTML = globalData[0].title;
            let description = document.createElement('p');
            description.innerHTML = globalData[0].summary;

            cardContent.append(title, description);

            cardDiv.append(cardImgDiv, cardContent);
            newDiv.append(cardDiv);
            popularFoodsContainer.appendChild(newDiv);

	    })
}

popularPicks('shake');
popularPicks('tacos');