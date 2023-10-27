// Function to display the user's profile picture
export function displayProfilePicture(url) {
    const userPFP = document.getElementById('user-PFP');
    if (url) {
        userPFP.src = url;
        userPFP.className = 'account-image-pfp';
        userPFP.alt = "Profile Picture";
        userPFP.style.display = 'block';
        document.getElementById('hide-if-pfp-exists').style.display = 'none';
    } else {
        // If no image is available, hide the image element
        userPFP.style.display = 'none';
    }
}