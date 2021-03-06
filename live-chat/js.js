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
    messages: {}, //Stored as messages[channel][number from top]
    reactions: {}, //Stored as reactions[messageId]
    descriptions: {}, //Stored as descriptions[channel]
    idToChannel: {}, //Stored as idToChannel[messageId] = channel
    selectedChannel: '',
    snapshotDisconnectFunction: function() {},
    reactSnapshotDisconnectFunction: function() {},
};
let pushData = {
    motdCounter: 0,
    reactions: {}
}

//Const
const reactEmojis = ['💛','👍','👎','😎','🎮']
const maxMessages = 30; //Max number of messages to load
const maxCombinedMessagesNum = 10; //The max number of messages that can be combined
const maxTimeDifBetweenCombinedMessages = 60 * 5; //Max time between combined messages

//Define on load
let userInputBox, displayMessages, motdInput, signInBlock, channelSelect, displayAllUsers, mainContentDiv, openedMessage, reactMenuContainer
function onLoad() {
    displayMessages = document.getElementById('displayMessages')
    motdInput = document.getElementById("motdInput")
    signInBlock = document.getElementById('signInBlock')
    userInputBox = document.getElementById('messageInputBox')
    channelSelect = document.getElementById('channelSelect')
    displayAllUsers = document.getElementById('displayAllUsers')
    mainContentDiv = document.getElementsByClassName("mainContent")[0]
    reactMenuContainer = document.getElementById('reactMenuContainer')

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

    //Update motd after not focused and 5 seconds of no change pass (to not use entire budget)
    motdInput.addEventListener("focusout", function() {
        let lastValue = motdInput.value;
        pushData.motdCounter++;
        let lastCounter = pushData.motdCounter;
        setTimeout(function() {
            if (pushData.motdCounter === lastCounter) {
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

    //Fix scroll when new content added
    mainContentDiv.addEventListener("scroll", function() {
        lastPos = mainContentDiv.scrollTop
        scrollingWithContent = (mainContentDiv.scrollTop) > (mainContentDiv.scrollHeight - mainContentDiv.offsetHeight - 15)
    })
    scrollDown()

    //Add reaction buttons to chooser
    for (let i = 0; i < reactEmojis.length; i++) {
        let elem = document.createElement('div')
        elem.setAttribute('class', 'messageReaction enlargedMessageReaction')
        const emoji = reactEmojis[i]
        elem.innerText = emoji
        elem.onclick = function() {
            setReactionToMessage(openedMessage, emoji, true)
            openReactMenu(false)
        }

        reactMenuContainer.append(elem)
    }

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
    document.getElementById('userProfileName').innerText = userData.displayName
    document.getElementById('userProfileImage').src = userData.displayImage
    motdInput.value = userData.motd
    signInBlock.style.display = 'none'
}

function handleAuthChange(newUser) {
    if (newUser) {
        //Worked
        user = newUser;

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
    } else {
        let container = document.getElementById('signInContainer')
        if (container) {
            container.style.display = "block"
        } else {
            window.requestAnimationFrame(function() {
                handleAuthChange(false)
            })
        }
    }
}

let init = false
setTimeout(function() {
    if (init) {return}
    handleAuthChange(firebase.auth().currentUser)
}, 500)
firebase.auth().onAuthStateChanged(function(user) {
    init = true
    handleAuthChange(user)
});

function userSignIn() {
    firebase.auth()
        .signInWithPopup(provider)
        .then((result) => {

        }).catch((error) => {
            //Failed
            console.log("Failed auth: " + error.code)
            console.log(error)
        });
}

function userSignOut() {
    firebase.auth().signOut().then(() => {
        window.location.reload()
    })
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

function createUserView(data) {
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
    p.setAttribute("class", "userDisplayName")
    p.innerText = data.displayName

    let p2 = document.createElement("p")
    p2.innerText = (data.motd.length > 0 && data.motd) || "..."
    p2.setAttribute("class", "userMotdDisplay")

    div.style.paddingTop = "5px"
    innerDiv.append(p, p2)
    div.append(img, innerDiv)
    displayAllUsers.appendChild(div)
}

function displayUserSnapshot(snapshot) {
    displayAllUsers.innerHTML = ""
    snapshot.forEach((doc) => {
        let data = doc.data()
        createUserView(data)
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
    let channelsSnapshot = await channels.orderBy("index").get()

    let elements = []

    channelsSnapshot.forEach((data) => {
        let option = document.createElement("button")
        let id = data.id;
        displayData.descriptions[id] = data.data().description
        option.innerText = "#" + id;
        option.onclick = function() {
            elements.forEach(function(node) {
                node.style.backgroundColor = "transparent";
            })
            option.style.backgroundColor = "rgba(255, 255, 255, 0.075)";
            updateSelectedChannel(id)
        }
        option.setAttribute("class", "channel")
        channelSelect.appendChild(option)
        elements.push(option)
    })

    elements[0].click()
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
    displayData.reactSnapshotDisconnectFunction() //Disconnect previous snapshot if it exists

    document.getElementById('displayChannel').innerText = "#" + displayData.selectedChannel
    document.getElementById('displayChannelDesc').innerText = displayData.descriptions[displayData.selectedChannel]

    let channel = db.collection("channels").doc(displayData.selectedChannel)
    let messages = channel.collection("messages")

    let queryBase = messages.orderBy("created", "desc") //most recent message first, then the last x

    if (!displayData.messages[displayData.selectedChannel]) {
        displayData.messages[displayData.selectedChannel] = []
        queryBase.limit(maxMessages).get() //First get to catch up
            .then((snapshot) => {
                redisplayAllMessages()
                snapshot.forEach(function(doc) {
                    addNewMessage(doc.id, doc.data(), true)
                    channel.collection("reactions").doc(doc.id).get().then(handleReactionSnapshot)
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

    displayData.reactSnapshotDisconnectFunction = channel.collection("reactions").orderBy("updated", "desc").limit(1).onSnapshot((snapshot) => {
        snapshot.forEach(function(doc) {
            handleReactionSnapshot(doc)
        })
    })

    lastHeight = 0
}

function getFormattedTimestamp(date, today) {

    let prefix = date.toLocaleDateString({
        day: 'numeric',
        month: 'numeric',
        year: 'numeric'
    })

    function adjustDate(value) {
        //Takes date and moves it to the beginning of the day
        let adjusted = new Date()
        adjusted.setTime(value.getTime())
        adjusted.setHours(0)
        adjusted.setMinutes(0)
        adjusted.setSeconds(0)
        return adjusted
    }

    let adjustedToday = adjustDate(today)
    let adjustedDate = adjustDate(date)

    let daysBetween = Math.floor((adjustedToday.getTime() - adjustedDate.getTime()) / 24 / 60 / 60 / 1000)

    if (daysBetween === 0) {
        prefix = "Today"
    } else if (daysBetween === 1) {
        prefix = "Yesterday"
    }

    let hours = date.getHours() % 12
    if (hours === 0) {
        hours = 12;
    }

    let timeS = hours + ":"

    let mins = date.getMinutes()
    if (mins < 10) {
        timeS += "0"
    }
    timeS += mins
    let adder = (date.getHours() >= 12) ? "PM" : "AM"
    timeS += " " + adder

    return prefix + " at " + timeS
}

function addNewMessage(docId, data, atBeginning) {
    if (data.created && data.content && data.content.length > 0) {
        let today = new Date();
        let date = new Date(data.created.seconds * 1000)

        let formatted = getFormattedTimestamp(date, today)

        let reformattedData = {
            id: docId,
            uId: data.uId,
            displayName: data.displayName,
            displayImage: data.displayImage,
            content: data.content,
            fTime: formatted,
            seconds: data.created.seconds,
        }

        let messages = displayData.messages[displayData.selectedChannel]
        if (!atBeginning) {
            messages.push(reformattedData)
        } else {
            messages.splice(0, 0, reformattedData)
        }
        displayData.reactions[docId] = {}
        displayData.idToChannel[docId] = displayData.selectedChannel

        displayMessage(reformattedData, atBeginning)
    }
}

function displayMessage(data, atBeginning) {
    const size = 40;

    let div = document.createElement("div")
    div.setAttribute("class", "message")
    div.setAttribute("id", "message-" + data.id)

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
    time.innerText = data.fTime;

    let contentDiv = document.createElement("div")

    let content = document.createElement("p")
    content.setAttribute("class", "messageContent")
    content.innerText = data.content

    contentDiv.appendChild(content)

    let reactButton = document.createElement('button')
    reactButton.setAttribute("class", "messageReactionAddButton")
    reactButton.innerText = "+😎"
    reactButton.onclick = function() {
        openReactMenu(data.id)
    }

    let react = document.createElement("div")
    react.setAttribute("class", "messageReactionContainer")

    headerContainer.append(name, time)
    right.append(headerContainer, contentDiv, react, reactButton)
    div.append(img, right)

    if (!atBeginning) {
        displayMessages.appendChild(div)
    } else {
        displayMessages.insertBefore(div, displayMessages.firstChild);
    }

    updateMessageReactions(data.id)
    scrollDown()
}

function createReactionDisplay(id, item, e, n, isSelected) {
    let elem = document.createElement("div")
    elem.setAttribute("class", "messageReaction" + (isSelected ? " selectedMessageReaction" : ""))

    let number = document.createElement("p")
    number.setAttribute("class", "messageReactionNumber")
    number.innerText = n

    let emoji = document.createElement("p")
    emoji.setAttribute("class", "messageReactionEmoji")
    emoji.innerText = e

    elem.onclick = function() {
        setReactionToMessage(id, e, !isSelected)
    }

    elem.append(number, emoji)
    item.appendChild(elem)
}

function updateMessageReactions(id) {
    const data = displayData.reactions[id]
    let div = document.getElementById("message-" + id)
    if (!div) { return }
    div = div.querySelector(".messageReactionContainer")
    div.innerHTML = ""
    let counts = []
    let selected = []
    let hasContent = false;
    if (data) {
        for (const uId in data) {
            const reactions = data[uId].split(",")
            for (let i = 0; i < reactions.length; i++) {
                const emoji = reactions[i]
                if (!counts[emoji]) {
                    counts[emoji] = 1;
                } else {
                    counts[emoji]++;
                }
                if (uId === user.uid) {
                    selected[emoji] = true;
                }
            }
        }
    }

    for (let i = 0; i < reactEmojis.length; i++) {
        const item = reactEmojis[i]
        if (counts[item]) {
            createReactionDisplay(id, div, item, counts[item], selected[item])
            hasContent = true;
        }
    }

    if (hasContent) {
        div.style.display = 'block'
    } else {
        div.style.display = 'none'
    }

    scrollDown()
}

function handleReactionSnapshot(reactSnap) {
    if (!reactSnap.exists) {
        return
    }
    let copy = {}
    const data = reactSnap.data()
    for (const copyKey in data) {
        if (copyKey !== 'updated') {
            copy[copyKey] = data[copyKey]
        }
    }
    displayData.reactions[reactSnap.id] = copy
    updateMessageReactions(reactSnap.id)
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

function openReactMenu(id) {
    if (id === false) {
        reactMenuContainer.parentElement.style.display = "none"
        return
    }

    reactMenuContainer.parentElement.style.display = "block"
    openedMessage = id;
}

function setReactionToMessage(id, emoji, show) {
    const uid = user.uid;
    let currentData = displayData.reactions[id]
    let dataChanged = false;

    if (!currentData[uid] || currentData[uid] === "") {
        if (show) {
            //Add content
            currentData[uid] = emoji
            dataChanged = true;
        }
    } else {
        let parsed = currentData[uid].split(",")
        if (show) {
            if (!parsed.includes(emoji)) {
                parsed.push(emoji)
                dataChanged = true;
            }
        } else {
            if (parsed.includes(emoji)) {
                let index = parsed.indexOf(emoji)
                parsed.splice(index, 1)
                dataChanged = true;
            }
        }
        currentData[uid] = parsed.join(",")
    }

    if (dataChanged) {
        updateMessageReactions(id)

        pushData[id] = currentData[uid]
        const lastCheck = currentData[uid]
        //Add delay for writing data in order to prevent high write speeds from spam clicking
        setTimeout(function() {
            if (pushData[id] === lastCheck) {
                db.collection("channels").doc(displayData.idToChannel[id]).collection("reactions").doc(id).set({
                    [uid]: lastCheck,
                    updated: firebase.firestore.FieldValue.serverTimestamp(),
                }, { merge: true })
            }
        }, 5 * 1000)
    }
}
