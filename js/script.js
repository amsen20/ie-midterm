// Storing all elements in constants to access them easier.
const resultElm = document.getElementById("prediction-result");
const savedAnsElm = document.getElementById("saved-answer");
const errorElm = document.getElementById("error");

const submitBtn = document.getElementById("submit");
const saveBtn = document.getElementById("save");
const clearBtn = document.getElementById("clear");
const clearRadioBtn = document.getElementById("clearRadio");

const RadioElms = document.getElementsByName("Gender");

// Accepted regex for name.
const regex = /^[a-z ]+$/;
const isNameValid = regex.test.bind(regex);

// Error's timeout for displaying the error box.
let timeOutId;

// Whenever an error occurs, this function with error's message (msg) is called.
const notifyError = (msg) => {
    if(timeOutId)
        clearTimeout(timeOutId);
    errorElm.innerText = msg;
    errorElm.style.visibility = 'visible';
    timeOutId = setTimeout(() => {
        errorElm.style.visibility = 'hidden';
        timeOutId = null;
    }, 3000);
    console.log(msg);
};

// This function modifies result for prediction.
const modifyRes = (gender, prob) => {
    resultElm.innerText = gender + "\n" + prob;
};

// Last loaded name from local storage, it helps in clear function.
let loadedKey = '';
// This function checks if name is in storage or not, if it is, this function will display the answer.
const checkStorage = (name) => {
    const value = window.localStorage.getItem(name);
    if (! value) {
        savedAnsElm.innerText = "Nothing.";
        clearBtn.disabled = true;
        return;
    }
    clearBtn.disabled = false;
    loadedKey = name;
    savedAnsElm.innerText = value;
};

// This function sets name to its argument then is will send a request and call for storage related functions.
const setName = (name) => {
    resultElm.innerText = '';
    checkStorage(name);
    fetch("https://api.genderize.io/?" + new URLSearchParams({
        name: name
    }))
        .then(response => response.json())
        .then((response) => {
            const {gender, probability} = response;
            if (!gender) {
                notifyError("Name not found!");
            } else
                modifyRes(gender, probability);
        })
        .catch((error) => {
            notifyError("Some problems happened! (details: " + error.toString() + ")");
        });
};

// Saves name in local storage and then display it using checkStorage function.
const saveName = (name, value) => {
    window.localStorage.setItem(name, value);
    checkStorage(name);
};

// A wrapper function for checking if name is accepted or not and preventing defaults.
const getNameOrError = (e, func) => {
    e.preventDefault();
    const name = document.forms['gender-form']['Name'].value;
    if(! isNameValid(name))
        notifyError("Name is not valid! (name should be lowercase letters and spaces)");
    else
        return func(name);
};

// Submit form button onclick event.
submitBtn.onclick = (e) => getNameOrError(e, setName);

// Save button onclick event.
// in order to save gender for a name, priority is selected gender by user.
// if user doesn't choose a gender, predicted value(if exists) is saved.
saveBtn.onclick = (e) => getNameOrError(e, (name) => {
    const radioVal = document.forms['gender-form']['Gender'].value;
        if (radioVal) {
            saveName(name, radioVal);
            return;
        }
    if(! resultElm.innerText || resultElm.innerText === 'Please Submit!') {
        notifyError("Please submit or choose a gender!");
        return;
    }
    saveName(name, resultElm.innerText.split('\n')[0])

});

// Clears options if any checked.
clearRadioBtn.onclick = (e) => {
    e.preventDefault();
    for (const radioElm of RadioElms)
        radioElm.checked = false;
};

// Clears saved name (if exists).
clearBtn.onclick = (e) => {
    console.log(loadedKey);
    if(loadedKey)
        window.localStorage.removeItem(loadedKey);
    checkStorage('');
};