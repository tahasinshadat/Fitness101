import { firebaseConfig } from '../secure.js';
import { displayProfilePictureForNav } from '../pfpDisplay.js';


// inititalize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const firestore = firebase.firestore();



// Function to get username from Firestore
async function getUsernameFromFirestore(userId) {
    return usersCollection.doc(userId).get()
        .then(doc => {
            if (doc.exists) {
                return doc.data().UUID.username;
            } else {
                return null;
            }
        })
        .catch(error => {
            console.error("Error getting username from Firestore:", error);
            return null;
        });
}



async function createReply(user, message) {
    const replyThread = document.createElement('div');
    replyThread.classList.add('reply-thread');

    const arrow = document.createElement('div');
    arrow.classList.add('arrow');

    const replyCard = document.createElement('div');
    replyCard.classList.add('reply-card');

    if (user == currentUserUsername) {
        replyCard.classList.add('blue'); // Make the currentUsers messages and replies blue to indicate it's theirs
    }

    const dFlex = document.createElement('div');
    dFlex.classList.add('d-flex');

    const userIcon = document.createElement('i');
    userIcon.classList.add('material-icons');
    userIcon.textContent = 'account_circle';

    const username = document.createElement('h5');
    username.classList.add('reply-username');
    username.textContent = user;

    const replyText = document.createElement('p');
    replyText.classList.add('reply-text', 'black-text');
    replyText.textContent = message;

    // Build the structure
    dFlex.appendChild(userIcon);
    dFlex.appendChild(username);

    replyCard.appendChild(dFlex);
    replyCard.appendChild(replyText);

    replyThread.appendChild(arrow);
    replyThread.appendChild(replyCard);

    return replyThread;
}



const threadBody = document.getElementById('Thread-Body');
async function createThread(user, title, message, replies) {
    const threadId = generateUniqueId(); // Generate a unique thread ID

    // Create elements
    const card = document.createElement('div');
    card.classList.add('card', 'chat-card');
    if (user == currentUserUsername) {
        card.classList.add('blue', 'lighten-5'); //  To indicate that it's their own Thread
    }

    const mainContent = document.createElement('div');
    mainContent.classList.add('main-content');

    const cardContent = document.createElement('div');
    cardContent.classList.add('card-content');

    const chatHeader = document.createElement('div');
    chatHeader.classList.add('chat-header');

    const userIcon = document.createElement('i');
    userIcon.classList.add('material-icons');
    userIcon.textContent = 'account_circle';

    const username = document.createElement('h4');
    username.classList.add('chat-username');
    username.textContent = user;

    const chatMessage = document.createElement('div');
    chatMessage.classList.add('chat-message');

    const cardTitle = document.createElement('span');
    cardTitle.classList.add('card-title', 'chat-title');
    cardTitle.textContent = title;

    const messageText = document.createElement('p');
    messageText.classList.add('chat-text');
    messageText.textContent = message;

    const hr = document.createElement('hr');

    const form = document.createElement('form');
    form.classList.add('mx-5', 'px-5');

    const inputField = document.createElement('div');
    inputField.classList.add('input-field', 'd-flex');

    const commentIcon = document.createElement('i');
    commentIcon.classList.add('material-icons', 'prefix', 'left');
    commentIcon.textContent = 'comment';

    const input = document.createElement('input');
    input.classList.add('validate', 'black-text');
    input.type = 'text';
    input.id = 'reply';

    const label = document.createElement('label');
    label.setAttribute('for', 'reply');
    label.textContent = 'Reply to ' + user;

    const btn = document.createElement('button');
    btn.className = 'btn waves-effect waves-light red lighten-1 mx-1 REPLY-BTN';
    btn.textContent = 'Reply';


    // Add event listener to the reply button
    btn.addEventListener('click', async function(event) {
        event.preventDefault(); 
        const replyMessage = input.value; // Get the reply text from the input field
        if (replyMessage == '') return;

        const originalUser = user;
        const replyingUser = currentUserUsername;

        // Get the existing thread UID and use it to update the replies array within it
        const threadUid = await pushThreadToFirestore(originalUser, title, message); // *******************************************************************************************************
        if (threadUid) {
            // Once we get the UID add the reply to that Thread's reply array
            pushReplyToFirestore(threadUid, originalUser, replyingUser, replyMessage);
            input.value = '';
        }
    });


    // Build the structure
    chatHeader.appendChild(userIcon);
    chatHeader.appendChild(username);

    chatMessage.appendChild(cardTitle);
    chatMessage.appendChild(messageText);

    inputField.appendChild(commentIcon);
    inputField.appendChild(input);
    inputField.appendChild(label);
    inputField.appendChild(btn);

    form.appendChild(inputField);

    cardContent.appendChild(chatHeader);
    cardContent.appendChild(chatMessage);
    cardContent.appendChild(hr);

    mainContent.appendChild(cardContent);
    if (replies.length > 0) {
        for (let i = 0; i < replies.length; i++) {
            const reply = await createReply(replies[i].replyingUser, replies[i].message)
            mainContent.appendChild(reply)
        }
    }
    mainContent.appendChild(form);

    card.appendChild(mainContent);
    threadBody.appendChild(card);
}



// Function to generate a unique ID
function generateUniqueId() {
    return Math.random().toString(36).substr(2, 9);
}



// Reference to Firestore collection
const messagesCollection = firestore.collection('messages');
let scrollPosition;

// Function to push a reply to the replies array in Firestore
async function pushReplyToFirestore(threadDocId, originalUser, replyingUser, reply) {
    try {
        const threadDocRef = messagesCollection.doc(threadDocId);

        // Get the current timestamp
        const timestamp = new Date();

        // Construct the reply object
        const replyObject = {
            user: originalUser, // Store the User whom you are replying to (idk why, I feel like it will be useful for scalability in the future)
            replyingUser: replyingUser,  // Store the user who is rpelying + their message and the time they replied
            message: reply,
            timestamp: timestamp
        };

        // Update the Firestore document using arrayUnion with the reply object
        await threadDocRef.update({
            replies: firebase.firestore.FieldValue.arrayUnion(replyObject)
        });

        // console.log('Reply added to Firestore successfully.');

        // Set the position of where the user replied so when the page updates with the new reply, I can scroll the user back to the message they just replied to
        localStorage.setItem("scrollPosition", window.scrollY);
        location.reload();

    } catch (error) {
        console.error('Error adding reply to Firestore:', error);
    }
}



// Function to create new data on Firestore or update if already exists
async function pushThreadToFirestore(user, title, content) {
    try {
        // Check if a thread with the same user, title, and content already exists
        const querySnapshot = await messagesCollection
            .where('user', '==', user)
            .where('title', '==', title)
            .where('content', '==', content)
            .get();

        // If a thread with the same user, title, and content exists
        if (!querySnapshot.empty) {
            // Get the first (and only) document in the query results (the existing thread)
            const existingThread = querySnapshot.docs[0];
            console.log('Thread with the same user, title, and content already exists. Updating...');
            return existingThread.id; // Return the ID of the existing thread --> so it can be used in another function to be updated
        }

        // If no thread with the same user, title, and content exists, create a new thread
        const newThreadRef = await messagesCollection.add({
            user: user, // Set the user field
            title: title, // Set the title field
            content: content, // Set the content field
            replies: [], // Initialize replies as an empty array
            timestamp: firebase.firestore.FieldValue.serverTimestamp() // Set the timestamp using server's time
        });

        // console.log('Thread added to Firestore successfully.');
        return newThreadRef.id; // Return the ID of the newly created thread

    } catch (error) {
        console.error('Error adding/updating thread to Firestore:', error);
        return null; // Return null in case of error
    }
}



// Event Listener to add to chat form
document.addEventListener('DOMContentLoaded', function() {
    const threadTitle = document.getElementById('thread-title');
    const threadContent = document.getElementById('thread-content');

    const modal = document.querySelector('.modal');
    M.Modal.init(modal); // Initialize the modal

    const postBtn = document.getElementById('postBtn');
    postBtn.onclick = (event) => {
        event.preventDefault();
        const user = currentUserUsername; 
        console.log(threadTitle.value)
        console.log(threadContent.value)
        pushThreadToFirestore(user, threadTitle.value, threadContent.value);
        threadTitle.value = ''; 
        threadContent.value = '';
        M.Modal.getInstance(modal).close();
        setTimeout( () => {
            window.location.reload();
        }, 1000);
    }
});



// If the user replied, it will refresh the page to load the new reply, and then scroll to the message they replied to because it would be annoying if the user had to scroll all the way back down again just because this page isn't dynamic / constantly updating
function scrollToReplyIfReplied() {
    scrollPosition = localStorage.getItem("scrollPosition");
    console.log(scrollPosition);
    if (scrollPosition != null) {
        setTimeout( () => {window.scrollTo(0, scrollPosition)}, 1000);
        localStorage.setItem("scrollPosition", null);
    }
}



// Function to fetch messages from Firestore and render them all
async function renderAllThreads() {
    try {
        const querySnapshot = await messagesCollection.orderBy('timestamp').get();
        querySnapshot.forEach((doc) => {
            const threadData = doc.data();
            createThread(threadData.user, threadData.title, threadData.content, threadData.replies);
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
    }
}



// Reference to Firestore collection 'users'
const usersCollection = firestore.collection('users');
let currentUserUsername  = null; // Variable to store the username

// Check for if the user is logged in or out:
auth.onAuthStateChanged(user =>{
    if (user == null) {
        window.location.href = "../index.html";
        currentUserUsername = null; // Reset the username
    } else {
        console.log('user logged in');
        const userId = user.uid;
        getUsernameFromFirestore(userId)
            .then(username => {
                if (username) {
                    currentUserUsername = username; // Store the username
                    renderAllThreads(); // Render after getting the username to show the users messages as blue and every other message as gray
                    // console.log('Username:', currentUserUsername);
                    scrollToReplyIfReplied();
                } else {
                    // console.log('Username not found.');
                }
            });

        // Get the user's profile picture URL from Firestore
        const userDocRef = usersCollection.doc(userId);
        userDocRef.get().then(doc => {
            if (doc.exists) {
                const userData = doc.data();
                const profilePictureUrl = userData.profilePicture;
                displayProfilePictureForNav(profilePictureUrl);
            } else {
                // User doesn't have a profile picture yet
                displayProfilePictureForNav(null);
            }
        }).catch(error => {
            console.error('Error getting user data:', error);
        });
    }
});