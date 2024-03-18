export function displayLoadingScreen() {
    // Create the loading screen element
    const loadingScreen = document.createElement('div');
    loadingScreen.className = 'loading-screen';

    // Create the spinner and text container
    const loader = document.createElement('div');
    loader.className = "loader";

    // Create the loading text element
    const loadingText = document.createElement('h3');
    loadingText.innerHTML = "&nbsp&nbspLoading..."
    loadingText.className = 'text-white';

    // Create the loading spinner element
    const loadingSpinner = document.createElement('div');
    loadingSpinner.className = 'loading-spinner';

    // Append spinner and text to loader container
    loader.appendChild(loadingSpinner);
    loader.appendChild(loadingText);

    // Append the loading spinner to the loading screen
    loadingScreen.appendChild(loader);

    // Append the loading screen to the specified element
    const element = document.querySelector('body');
    element.appendChild(loadingScreen);
}

export function removeLoadingScreen() {
    // Find and remove the loading screen element
    const element = document.querySelector('body');
    const loadingScreen = element.querySelector('.loading-screen');
    if (loadingScreen) {
        element.removeChild(loadingScreen);
    }
}