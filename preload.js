
// The chrome.runtime.onInstalled.addListener function is listening for the event when the extension 
// is installed and when it is triggered, it clears any existing data from the sync storage 
// and sets the default settings for the extension. 

// These default settings include a boolean value for 'show_icon', 'suppress_landing' 
// and a 'summary_size' which is a slider with a minimum value of 1, maximum of 3 
// and a default value of 2. 

// The extension will use these default values until the user modifies them in the options page.
// The chrome.storage.sync.set method sets the default settings in the sync storage area. 
// The settings are in the form of key-value pairs, where the key is the name of the setting and
// the value is an object that contains the properties of the setting, such as name, 
// description, type, value, sort_order, and configurable.


chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.clear()
    chrome.storage.sync.set({
        show_icon: {
            name: 'Show probe icon on all pages',
            description: 'Show probe summarization tool as a floating icon on all applicable pages.',
            type: 'boolean',
            value: true,
            sort_order: 1,
            configurable: false
        },

        // The suppress_landing setting is a boolean that controls whether the Probe icon should 
        // be hidden on landing and search pages. 

        // The sort_order and configurable properties are used to specify the order in which 
        // the settings should appear in the settings menu and whether the setting is configurable 
        // by the user or not respectively.

        suppress_landing: {
            name: 'Suppress the icon on landing and search pages',
            description: 'Hide probe floating icon on search pages and first page of every website (e.g., hidden on \'website.com\', but shown on \'website.com/article\')',
            type: 'boolean',
            value: true,
            sort_order: 2,
            configurable: false
        },


        //  The summary_size setting controls how many key sentences should be returned to summarize 
        // the page. The type of this setting is 'slider', and the min and max value are 1 and 3 
        // respectively. The value is 2, sort_order is 3 and configurable is true.

        summary_size: {
            name: 'Summary size',
            description: 'Controls how many key sentences should be returned to summarize the page',
            type: 'slider',
            min: 1,
            max: 3,
            value: 2,
            sort_order: 3,
            configurable: true
        }
    })
})