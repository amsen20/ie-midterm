const resultElm = document.getElementById("prediction-result");
const savedAnsElm = document.getElementById("saved-answer");
const errorElm = document.getElementById("error");

const submitBtn = document.getElementById("submit");
const saveBtn = document.getElementById("save");
const clearBtn = document.getElementById("clear");
const clearRadioBtn = document.getElementById("clearRadio");

const RadioElms = document.getElementsByName("Gender");

const regex = /^[a-z ][a-z ]+$/;
const isNameValid = regex.test.bind(regex);

let timeOutId;

const notifyError = (msg) => {
    if(timeOutId)
        clearTimeout(timeOutId);
    errorElm.innerText = msg;
    errorElm.style.visibility = 'visible';
    timeOutId = setTimeout(() => {
        errorElm.style.visibility = 'hidden';
    }, 3000);
    console.log(msg);
};

const modifyRes = (gender, prob) => {
    resultElm.innerText = gender + "\n" + prob;
};

let loadedKey = '';
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

const saveName = (name, value) => {
    window.localStorage.setItem(name, value);
    checkStorage(name);
};

const getNameOrError = (e, func) => {
    e.preventDefault();
    const name = document.forms['gender-form']['Name'].value;
    if(! isNameValid(name))
        notifyError("Name is not valid! (name should be lowercase letters and spaces)");
    else
        return func(name);
};

submitBtn.onclick = (e) => getNameOrError(e, (name) => {
    console.log("salam");
    setName(name);
});

saveBtn.onclick = (e) => getNameOrError(e, (name) => {
    const radioVal = document.forms['gender-form']['Gender'].value;
        if (radioVal) {
            saveName(name, radioVal);
            return;
        }
    if(! resultElm.innerText) {
        notifyError("Please submit or choose a gender!");
        return;
    }
    saveName(name, resultElm.innerText.split('\n')[0])

});

clearRadioBtn.onclick = (e) => {
    e.preventDefault();
    for (const radioElm of RadioElms)
        radioElm.checked = false;
};

clearBtn.onclick = (e) => {
    console.log(loadedKey);
    if(loadedKey)
        window.localStorage.removeItem(loadedKey);
    checkStorage('');
};