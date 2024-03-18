import { getFoodAPI } from "../backend/public/data.js";

let foodapi;
export function displayLikedFoods(usersCollection, userId, userFavoriteFoodCache, likedFoodDisplayContainer) {

    if (userId in userFavoriteFoodCache) {
        const userFavorites = userFavoriteFoodCache[userId];
        if (Object.keys(userFavorites.IDS).length === 0) likedFoodDisplayContainer.innerHTML = '<p>No Liked Foods</p>';
        else {
            for (let i = 0; i < userFavorites.NAMES.length; i++) {
                foodapi = getFoodAPI(userFavorites.NAMES[i]);
                renderLikedFoods(foodapi, likedFoodDisplayContainer, userFavorites.IDS, userId, usersCollection);
            }
        }

    } else {
        // Fetch the user's document from Firestore
        usersCollection.doc(userId).get().then((doc) => {
            if (doc.exists) {
                const user = doc.data();
                const userFavorites = user.favoriteFoods || { IDS: {}, NAMES: [] };
                // Update the local cache
                userFavoriteFoodCache[userId] = userFavorites;

                if (Object.keys(userFavorites.IDS).length === 0) {
                    likedFoodDisplayContainer.innerHTML = '<p>No Liked Foods</p>';
                } else {
                    for (let i = 0; i < userFavorites.NAMES; i++) {
                        foodapi = getFoodAPI(userFavorites.NAMES[i]);
                        renderLikedFoods(foodapi, likedFoodDisplayContainer, userFavorites.IDS, userId, usersCollection);
                    }
                }

            } else {
                console.log("User document not found.");
            }
        }).catch((error) => {
            console.error("Error getting user document:", error);
        });
    }

}

function renderLikedFoods(API, likedFoodDisplayContainer, IDS, user_ID, usersCollection) {
    fetch(API)
		.then(function(response) {
			return response.json();
		})
		.then(function(data) {
			let globalData = data.results;
            // console.log(globalData)
            for (let i = 0; i < globalData.length; i++) {
                const foodID = globalData[i].id
                if (IDS[foodID] == foodID) {
                    // Setup
                    let newDiv = document.createElement("div");
                    newDiv.classList.add('col-md-12');
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
                    heartIcon.className = "material-icons cyan-text";
    
                    heartIcon.addEventListener('click', () => {
                        // Reference to the user's document in Firestore
                        const userDocRef = usersCollection.doc(user_ID);
                    
                        // Check if the heart icon has the "red-heart" class
                        const isHearted = heartIcon.classList.contains('cyan-text');
                    
                        userDocRef.update({
                            [`favoriteFoods.IDS.${foodId}`]: isHearted ? firebase.firestore.FieldValue.delete() : foodId
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
                    likedFoodDisplayContainer.appendChild(newDiv);
                    
                }

            }

	    })
        .catch(error => {
            console.log('Error with API: ', error);
            likedFoodDisplayContainer.innerHTML = 'Error Rendering Your Liked Foods';
        })

}	

const barColors = ['red', 'orange', 'green', 'blue', 'purple', 'pink'];

export function createDoughnutChart(chartId, labels, data) {
    const ctx = document.getElementById(chartId).getContext("2d");
    new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: labels,
            datasets: [
            {
                backgroundColor: data.map((_, index) => barColors[index % barColors.length]),
                data: data,
            },
            ],
        },
        options: {
            plugins: {
                legend: {
                    display: true,
                    position: 'right',
                },
            },
            elements: {
                arc: {
                    borderWidth: 1,
                },
            },
            title: {
                display: false,
                // text: chartTitle,
            },
        },
    });
}

// Function to save meal data to Firestore
export function saveMealData(userId, mealData, usersCollection) {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1; // Months are 0-based
    const day = today.getDate();

    // Reference the user's meal data for the current day
    const mealRef = usersCollection.doc(userId).collection('meals')
        .doc(`${year}-${month < 10 ? '0' : ''}${month}-${day < 10 ? '0' : ''}${day}`);

    // Get the existing meals array or create an empty array if it doesn't exist
    mealRef.get()
        .then((doc) => {
            const mealsArray = doc.exists ? doc.data().meals || [] : [];

            // Add the new meal to the meals array
            mealsArray.push(mealData);

            // Update the meals field with the modified array
            return mealRef.set({ meals: mealsArray }, { merge: true });
        })
        .then(() => {
            console.log('Meal data saved successfully.');
        })
        .catch((error) => {
            console.error('Error saving meal data:', error);
        });
}

// Function to fetch the meals array for the current date & add them into multiple arrays
export async function getMealsForCurrentDate(userId, usersCollection) {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    const currentDate = `${year}-${month < 10 ? '0' : ''}${month}-${day < 10 ? '0' : ''}${day}`;

    const mealRef = usersCollection.doc(userId).collection('meals').doc(currentDate);

    try {
        const doc = await mealRef.get();
        if (doc.exists) {
            const mealsData = doc.data().meals || [];
            let foodNames = [];
            let calories = [];
            let protein = [];
            let fat = [];
            let carbs = [];

            mealsData.forEach(meal => {
                foodNames.push(meal.foodName);
                calories.push(meal.calories);
                protein.push(meal.protein);
                fat.push(meal.fat);
                carbs.push(meal.carbs);
            });

            return [foodNames, calories, protein, fat, carbs];
        } else {
            // console.log('No meal data found for the current date.');
            return [[], [], [], [], []]; // Return empty arrays if no data
        }
    } catch (error) {
        console.error('Error fetching meal data:', error);
        throw error;
    }
}

export function updateDescriptions([calVals, proteinVals, fatVals, carbVals], [calID, proteinID, fatID, carbID]) {
    const calories = document.getElementById(calID);
    const protein = document.getElementById(proteinID);
    const fat = document.getElementById(fatID);
    const carbs = document.getElementById(carbID);

    calories.innerHTML = `Calories: ${addValsInArray(calVals)}`;
    protein.innerHTML = `Protein: ${addValsInArray(proteinVals)}`;
    fat.innerHTML = `Fat: ${addValsInArray(fatVals)}`;
    carbs.innerHTML = `Carbohydrates: ${addValsInArray(carbVals)}`;
}

function addValsInArray(arr) {
    return arr.reduce((accumulator, currentVal) => accumulator + currentVal, 0)
}

export function displayPreviousMeal(containerId, [foodName, calVal, proteinVal, fatVal, carbVal]) {
    const container = document.getElementById(containerId);
    container.innerHTML = ''; // Delete Previous Meals if there are any to stop any duplicates
    if (calVal.length == 0) {
        container.innerHTML = 'No Foods Logged/Eaten Today';
        return;
    }
    for (let i = 0; i < calVal.length; i++) {

        //SetUp
        let card = document.createElement('div');
        card.className = 'card';
        let content = document.createElement('div');
        content.className = 'card-content';
    
        // Content
        let title = document.createElement('span');
        title.className = 'card-title';
        title.innerHTML = foodName[i];
        let hr = document.createElement('hr');
        let ul = document.createElement('ul');

        // Stats
        let calories = document.createElement('li');
        calories.innerHTML = `Calories: ${calVal[i]}`;
        let protein = document.createElement('li');
        protein.innerHTML = `Protein: ${proteinVal[i]}`;
        let fat = document.createElement('li');
        fat.innerHTML = `Fat: ${fatVal[i]}`;
        let carbs = document.createElement('li');
        carbs.innerHTML = `Carbohydrates: ${carbVal[i]}`;
    
        // Appends
        ul.appendChild(calories);
        ul.appendChild(protein);
        ul.appendChild(fat);
        ul.appendChild(carbs);
        content.appendChild(title);
        content.appendChild(hr);
        content.appendChild(ul);
        card.appendChild(content);
        container.appendChild(card);
    }

}

// Function to save weight data to Firestore
export function saveWeightData(userId, weightData, usersCollection) {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1; // Months are 0-based
    const day = today.getDate();

    // Reference the user's weight data for the current day
    const weightRef = usersCollection.doc(userId).collection('weight')
        .doc(`${year}-${month < 10 ? '0' : ''}${month}-${day < 10 ? '0' : ''}${day}`);

    // set data
    weightRef.set(weightData)
        .then(() => {
            console.log('Weight data saved successfully!');
        })
        .catch(error => {
            console.error(`Error saving weight data:`, error);
        })
        
}

