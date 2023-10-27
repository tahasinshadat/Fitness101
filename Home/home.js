import { firebaseConfig } from '../secure.js';

// inititalize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const firestore = firebase.firestore();
const usersCollection = firestore.collection('users');

// Check for if the user is logged in or out:
auth.onAuthStateChanged(user =>{
    if (user == null) {
        window.location.href = "../index.html";
    } else {
        console.log('user logged in');

        usersCollection.doc(user.uid).get().then((doc) => {
            if (doc.exists) {

                const userData = doc.data();

                const today = new Date();
                const year = today.getFullYear();
                const month = today.getMonth() + 1; // Months are 0-based
                const day = today.getDate();
                const todaysDate = `${year}-${month < 10 ? '0' : ''}${month}-${day < 10 ? '0' : ''}${day}`;

                if (userData.analytics) {

                    // If its a new day and they log in
                    if (todaysDate !== userData.analytics.lastlogin) {
                        // update lastlogin to be todays Date
                        // update totalDaysLoggedIn to increase by 1
                        const updatedAnalyticsData = {
                            ...userData.analytics, // Spread the properties from userData.analytics
                            lastlogin: todaysDate, // Update the date
                            totalDaysLoggedIn: userData.analytics.totalDaysLoggedIn + 1 // Increment the log in count
                        };

                        usersCollection.doc(user.uid).update({ analytics: updatedAnalyticsData })
                            .then(() => {
                                console.log('Analytics data updated for the new day.');
                            })
                            .catch(error => {
                                console.error('Error updating analytics data:', error);
                            });
                    }

                } else {
                    
                    // "analytics" object doesn't exist, create it with default values
                    const defaultAnalyticsData = {
                        totalWorkouts: 0,
                        totalDaysLoggedIn: 1,
                        totalPosts: 0,
                        lastlogin: todaysDate
                    };
                    usersCollection.doc(user.uid).update({ analytics: defaultAnalyticsData })
                        .then(() => {
                            console.log('Analytics data created with default values.');
                        })
                        .catch((error) => {
                            console.error('Error creating analytics data:', error);
                        });

                }
                
            } else {
                console.error('User document not found.');
            }
        }).catch((error) => {
            console.error("Error getting username:", error);
        });
    }
});