// Uses the chrome.tabs API to interact with the currently active tab in the current window.
// It is listening for the DOMContentLoaded event, which is fired when the initial HTML document has 
// been completely loaded and parsed. 
// Once the event is fired, it creates a new instance of a View class and passes it the document's body 
// element. 

document.addEventListener('DOMContentLoaded', async() => {
    const view = new View(document.body)

    // It then uses chrome.tabs.query to get the active tab in the current window and sends a message to that 
    // tab with the message "getElementContent".
    const tab = await chrome.tabs.query({ active: true, currentWindow: true })

    
    // The tab is expected to respond with an object that contains a summary of the content of the page. 
    // This summary is passed to the view.update method and the loading class is removed from the body. 
    // If the tab does not respond within a certain time frame, the view.update method is called
    // with an object that contains a failure message.
    chrome.tabs.sendMessage(tab[0].id, 'getElementContent', summary => {
        document.body.classList.remove('loading')
        view.update(summary || {success: false, message: 'The page took too long to load. Please try again.'})
    })
})



