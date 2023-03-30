// Generates HTML elements for settings stored in Chrome's sync storage, 
// and appends them to a container element with the ID "options".
// The settings are sorted by their "sort_order" property, and for each setting, 
// an HTML element is created based on the setting's "type" property. 

async function generateSettingElements() {
    const container = document.getElementById('options')
    const settings = await chrome.storage.sync.get(null)
    Object.entries(settings)
        .filter(([_, s]) => s && s.configurable)
        .sort(([_, s1], [__, s2]) => s1.sort_order - s2.sort_order)
        .forEach(async ([key, s]) => container.appendChild(await createSettingElement(key, s)))
}


async function createSettingElement(key, setting) {
    var element = {}
    

    // If the type is "boolean", a checkbox input element is created and sets the checked attribute 
    // if the setting value is true. 
    switch (setting.type) {
        case 'boolean': {
            element = document.createElement('input')
            element.setAttribute('type', 'checkbox')
            if (setting.value)
                element.setAttribute('checked', 'checked')
            element.addEventListener('click', async e => {
                setting.value = e.target.checked
                await setSettingValue(key, setting)
            })
            break
        }


        // If the type is "slider", a range input element is created and sets the min, max, and value 
        // attributes accordingly. 
    
        case 'slider': {
            element = document.createElement('slider')
            const input = document.createElement('input')
            input.setAttribute('type', 'range')
            input.setAttribute('min', setting.min)
            input.setAttribute('max', setting.max)
            input.setAttribute('value', setting.value)
            input.classList.add('slider')
            input.addEventListener('click', async e => {
                setting.value = e.target.value
                await setSettingValue(key, setting)
            })
            element.appendChild(input)
            break
        }
        default: {
            return
        }
    }

    // Each element is then wrapped in a label element, with a span element for the setting's name and another span 
    // element for the setting's description.
    const label = document.createElement('label')
    label.appendChild(element)
    const labelText = document.createElement('span')
    labelText.innerHTML = setting.name
    label.appendChild(labelText)

    // The resulting element is then appended to a list item element, 
    // which is appended to the container element. 

    const description = document.createElement('span')
    description.innerHTML = setting.description

    const container = document.createElement('li')
    container.appendChild(label)
    container.appendChild(description)

    return container
}

// When the checkbox or range input is clicked, the "setSettingValue" function is called, 
// which updates the setting's value in Chrome's sync storage.
async function setSettingValue(key, value) {
    await chrome.storage.sync.set({ [key]: value })
}


// the function is called at the end of the code snippet to generate the UI elements for the settings.
generateSettingElements()