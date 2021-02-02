// Config | PLEASE DO NOT USE MY CONFIG
var firebaseConfig = {
    apiKey: "AIzaSyASOZNuboYfzw1CV2gOKavjiZnH4pzoiG0",
    authDomain: "fir-basic-example.firebaseapp.com",
    projectId: "fir-basic-example",
    storageBucket: "fir-basic-example.appspot.com",
    messagingSenderId: "933564106583",
    appId: "1:933564106583:web:73ae94011620c244e12012",
    measurementId: "G-VWCJSBXKSJ"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

//Request firestore
let db = firebase.firestore()
//Request auth
let provider = new firebase.auth.GoogleAuthProvider();

//Setup vars
let user
let userData
let displayData = {
    messages: {},
    selectedChannel: 'main',
    snapshotDisconnectFunction: function() {},
};

//Const
const maxMessages = 30; //Max number of messages to load
// TODO: Change this to 30 and make scrolling up load more, display user logged in on bottom left, LiveChat on top + channel, and make channel selection ordered + better
const maxCombinedMessagesNum = 10; //The max number of messages that can be combined
const maxTimeDifBetweenCombinedMessages = 60 * 5; //Max time between combined messages

//Define on load
let userInputBox, displayUser, displayMessages, motdInput, signInBlock, channelSelect, displayAllUsers, mainContentDiv
function onLoad() {
    displayUser = document.getElementById('displayUser')
    displayMessages = document.getElementById('displayMessages')
    motdInput = document.getElementById("motdInput")
    signInBlock = document.getElementById('signInBlock')
    userInputBox = document.getElementById('messageInputBox')
    channelSelect = document.getElementById('channelSelect')
    displayAllUsers = document.getElementById('displayAllUsers')
    mainContentDiv = document.getElementsByClassName("mainContent")[0]

    //To add focus to typing if not typing in correct box
    document.addEventListener("keydown", function(key) {
        if (document.body === document.activeElement) {
            //Change focus if regular key
            if (key.code.includes("Key")) {
                //Random stackoverflow function because focusing at the end of the text is such a huge issue ahghghghgh
                function placeCaretAtEnd(el) {
                    if (typeof window.getSelection != "undefined"
                        && typeof document.createRange != "undefined") {
                        var range = document.createRange();
                        range.selectNodeContents(el);
                        range.collapse(false);
                        var sel = window.getSelection();
                        sel.removeAllRanges();
                        sel.addRange(range);
                    } else if (typeof document.body.createTextRange != "undefined") {
                        var textRange = document.body.createTextRange();
                        textRange.moveToElementText(el);
                        textRange.collapse(false);
                        textRange.select();
                    }
                }

                userInputBox.focus();
                placeCaretAtEnd(userInputBox);
            }
        }
    })

    userInputBox.addEventListener("keydown", function(key) {
        if (key && key.key === 'Enter' && !key.getModifierState('Shift')) {
            sendMessage()
        }
    })

    motdInput.addEventListener("keydown", function(key) {
        if (key && key.key === 'Enter' && !key.getModifierState('Shift')) {
            document.activeElement.blur();
        }
    })

    let motdCounter = 0;
    motdInput.addEventListener("focusout", function() {
        let lastValue = motdInput.value;
        motdCounter++;
        let lastCounter = motdCounter;
        setTimeout(function() {
            if (motdCounter === lastCounter) {
                if (lastValue === motdInput.value) {
                    //5 second interval of no change = change database\
                    if (userData.motd === motdInput.value) {
                        return
                    }
                    db.collection("users").doc(user.uid).update({
                        motd: motdInput.value
                    })
                }
            }
        }, 5 * 1000)
    })

    mainContentDiv.addEventListener("scroll", function() {
        lastPos = mainContentDiv.scrollTop
        scrollingWithContent = (mainContentDiv.scrollTop) > (mainContentDiv.scrollHeight - mainContentDiv.offsetHeight - 15)
    })
    scrollDown()
    fixDumbCss()
}

function fixDumbCss() {
    let baseContentDiv = document.getElementsByClassName("baseDiv")[0]
    let topContentDiv = document.getElementsByClassName("topContent")[0]
    let leftContentDiv = document.getElementsByClassName("leftContent")[0]
    let rightContentDiv = document.getElementsByClassName("rightContent")[0]
    let centerContentDiv = document.getElementsByClassName("centerContent")[0]
    let height = Math.floor(window.innerHeight - topContentDiv.clientHeight) + "px"
    centerContentDiv.style.height = height
    rightContentDiv.style.height = height
    rightContentDiv.style.top = topContentDiv.clientHeight + "px"

    centerContentDiv.style.width = Math.floor(window.innerWidth - rightContentDiv.clientWidth - leftContentDiv.clientWidth) + "px"

    window.requestAnimationFrame(fixDumbCss)
}

let scrollingWithContent = true, lastPos = 0
function scrollDown() {
    if (scrollingWithContent) {
        window.requestAnimationFrame(function() {
            mainContentDiv.scrollTo(0, mainContentDiv.scrollHeight)
        })
    } else {
        mainContentDiv.scrollTo(0, lastPos)
    }
}

function removeSignInBlock() {
    displayUser.innerText = "Signed In As: " + user.displayName
    motdInput.value = userData.motd
    signInBlock.style.display = 'none'
    displayUser.style.display = 'block'
}

function userSignIn() {
    firebase.auth()
        .signInWithPopup(provider)
        .then((result) => {
            //Worked
            user = result.user;

            let doc = db.collection("users").doc(user.uid)

            doc.get().then((snapshot => {
                if (snapshot.exists) {
                    //Already has user data
                    userData = snapshot.data();
                    removeSignInBlock()
                } else {
                    //Need to make user data
                    let newData = {
                        displayName: user.displayName,
                        displayImage: user.photoURL,
                        status: 0,
                        motd: "",
                        admin: false,
                    }
                    doc.set(newData).then(() => {
                        userData = newData
                        removeSignInBlock()
                    }).catch(issue => {
                        console.log("Throttling issue likely: " + issue)
                    })
                }
            })).catch(issue => {
                console.log("Throttling issue likely: " + issue)
            })

            fetchMessagesInit()
            fetchUsersInit()
        }).catch((error) => {
        //Failed
        console.log("Failed auth: " + error.code)
        console.log(error)
    });

}

function sendMessage() {
    let userInput = userInputBox.innerText
    if (!user) {
        alert('Sign in first')
    } else if (userInput.length > 0 && userInput.trim().length > 0) {
        let messages = db.collection("channels").doc(displayData.selectedChannel).collection("messages")
        messages.add({
            created: firebase.firestore.FieldValue.serverTimestamp(),
            content: userInput,
            uId: user.uid,
            displayName: user.displayName,
            displayImage: user.photoURL,
        })
    }

    userInputBox.innerText = ""

    setTimeout(function() {
        userInputBox.innerText = "" //Fix weird issue that chrome has with whitespace, idk why
    }, 0)
}


function displayUserSnapshot(snapshot) {
    displayAllUsers.innerHTML = ""
    snapshot.forEach((doc) => {
        let data = doc.data()
        let div = document.createElement("div")

        let size = 50;

        let img = document.createElement("img")
        img.src = data.displayImage;
        img.width = size;
        img.height = size;
        img.style.float = "left"
        img.style.borderRadius = (size / 2) + "px"

        let innerDiv = document.createElement("div")
        innerDiv.style.height = size + "px"
        innerDiv.style.float = "left"

        let p = document.createElement("p")
        p.innerText = data.displayName
        p.style.fontSize = (size * 0.5) + "px"
        p.style.margin = '0px';
        p.style.paddingLeft = "8px"
        p.style.textAlign = "left"

        let p2 = document.createElement("p")
        p2.innerText = (data.motd.length > 0 && data.motd) || "..."
        p2.style.fontSize = (size * 0.33) + "px"
        p2.style.margin = '0px';
        p2.style.paddingLeft = "20px"
        p2.style.textAlign = "left"
        p2.style.color = "#9f9f9f"

        div.style.paddingTop = "5px"
        innerDiv.append(p, p2)
        div.append(img, innerDiv)
        displayAllUsers.appendChild(div)
    })
}

async function fetchUsersInit() {
    let users = db.collection("users").orderBy("displayName", "asc").limit(100)
    let usersSnapshot = await users.get()
    displayUserSnapshot(usersSnapshot)

    users.onSnapshot((snapshot) => {
        displayUserSnapshot(snapshot)
    })
}


async function fetchMessagesInit() {
    let channels = db.collection("channels")
    let channelsSnapshot = await channels.get()

    channelsSnapshot.forEach((data) => {
        let option = document.createElement("button")
        let id = data.id;
        option.innerText = id;
        option.onclick = function() {
            updateSelectedChannel(id)
        }
        channelSelect.appendChild(option)
    })

    updateSelectedChannel(true)
}

function updateSelectedChannel(newValue) {
    if (newValue !== true) {
        if (displayData.selectedChannel === newValue) {
            return
        } else {
            displayData.selectedChannel = newValue
        }
    }

    displayData.snapshotDisconnectFunction() //Disconnect previous snapshot if it exists

    let channels = db.collection("channels")
    let messages = channels.doc(displayData.selectedChannel).collection("messages")

    let queryBase = messages.orderBy("created", "desc") //most recent message first, then the last x

    if (!displayData.messages[displayData.selectedChannel]) {
        displayData.messages[displayData.selectedChannel] = []
        queryBase.limit(maxMessages).get() //First get to catch up
            .then((snapshot) => {
                redisplayAllMessages()
                snapshot.forEach(function(doc) {
                    addNewMessage(doc.id, doc.data(), true)
                })
            })
    } else {
        redisplayAllMessages()
    }

    let firstCall = true;
    displayData.snapshotDisconnectFunction = queryBase.limit(1).onSnapshot((snapshot) => {
        if (firstCall) {
            firstCall = false;
            return
        }
        snapshot.forEach(function(doc) {
            addNewMessage(doc.id, doc.data())
        })
    })

    lastHeight = 0
}

function addNewMessage(docId, data, atBeginning) {
    if (data.created && data.content && data.content.length > 0) {
        let date = new Date(data.created.seconds * 1000)
        let timestamp = date.toTimeString()
        let formatted = timestamp.split(" ")[0]

        let reformattedData = {
            id: docId,
            uId: data.uId,
            displayName: data.displayName,
            displayImage: data.displayImage,
            content: data.content,
            seconds: data.created.seconds,
        }

        let messages = displayData.messages[displayData.selectedChannel]
        if (!atBeginning) {
            messages.push(reformattedData)
        } else {
            messages.splice(0, 0, reformattedData)
        }

        displayMessage(reformattedData, atBeginning)
    }
}

function displayMessage(data, atBeginning) {
    const size = 42;

    let div = document.createElement("div")
    div.setAttribute("class", "message")

    let img = document.createElement("img")

    img.src = data.displayImage;
    img.width = size;
    img.height = size;
    img.style.float = "left"
    img.style.borderRadius = (size / 2) + "px"

    let right = document.createElement("div")
    right.setAttribute("class", "messageContainer")

    let headerContainer = document.createElement("div")
    headerContainer.style.fontSize = "0px" //Why this is needed, who knows

    let name = document.createElement("p")
    name.setAttribute("class", "messageHeader")
    name.innerText = data.displayName;

    let time = document.createElement("p")
    time.setAttribute("class", "messageTimestamp")
    time.innerText = "Today at 4:22 PM";

    let content = document.createElement("p")
    content.setAttribute("class", "messageContent")
    content.innerText = data.content

    headerContainer.append(name, time)
    right.append(headerContainer, content)
    div.append(img, right)

    if (!atBeginning) {
        displayMessages.appendChild(div)
    } else {
        displayMessages.insertBefore(div, displayMessages.firstChild);
    }

    scrollDown()
}

function redisplayAllMessages() {
    displayMessages.innerHTML = ""

    let messages = displayData.messages[displayData.selectedChannel]
    if (messages) {
        messages.forEach(function(data) {
            displayMessage(data, false)
        })
    }
}
