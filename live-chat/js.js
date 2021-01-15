let db = firebase.firestore()


let user
let displayData = {

}
let selectedChannel = 'main'
const maxMessages = 10;

fetchMessagesInit()

let provider = new firebase.auth.GoogleAuthProvider();



let userInputBox, displayUser, signInBlock, channelSelect

function onLoad() {
    displayUser = document.getElementById('displayUser')
    signInBlock = document.getElementById('signInBlock')
    userInputBox = document.getElementById('messageInputBox')
    channelSelect = document.getElementById('channelSelect')
    userInputBox.addEventListener("keydown", function(key) {
        if (key && key.key === 'Enter') {
            sendMessage()
        }
    })
}

function userSignIn() {
    firebase.auth()
        .signInWithPopup(provider)
        .then((result) => {
            //Worked
            user = result.user;

            displayUser.innerText = "Signed In As: " + user.displayName
            signInBlock.style.display = 'none'
            displayUser.style.display = 'block'
            displayMessagesData()
        }).catch((error) => {
            //Failed
            console.log("Failed auth: " + error.code)
            console.log(error)
        });

}

function sendMessage() {
    let userInput = userInputBox.value
    if (!user) {
        alert('Sign in first')
    } else if (userInput.length > 0) {
        let messages = db.collection("channels").doc(selectedChannel).collection("messages")
        messages.add({
            created: firebase.firestore.FieldValue.serverTimestamp(),
            content: userInput,
            uId: user.uid,
            displayName: user.displayName,
        })

        userInputBox.value = ""
    }
}

async function fetchMessagesInit() {
    let channels = db.collection("channels")
    let channelsSnapshot = await channels.get()

    channelsSnapshot.forEach((data) => {
        let option = document.createElement("option")
        option.innerText = data.id;
        option.value = data.id;
        channelSelect.appendChild(option)
    })

    channelSelect.value = selectedChannel

    swapSelectedChannel()
}

function swapSelectedChannel() {
    selectedChannel = channelSelect.value;

    let thisChannel = selectedChannel

    let channels = db.collection("channels")
    let messages = channels.doc(thisChannel).collection("messages")

    let query = messages.orderBy("created", "desc").limit(maxMessages + 1); //most recent message first, then the last x

    if (!displayData[selectedChannel]) {
        displayData[selectedChannel] = {
            data: null,
            onsnapshot: false,
        }
        query.get() //First get to catch up
            .then((snapshot) => {
                displayMessageSnapshot(snapshot, thisChannel)
            })

    }

    if (!displayData[thisChannel].onsnapshot) {
        displayData[thisChannel].onsnapshot = true

        query.onSnapshot((snapshot) => {
            displayMessageSnapshot(snapshot, thisChannel)
        })
    }

    displayMessagesData()
}

function displayMessageSnapshot(snapshot, channel) {

    let messages = []
    snapshot.forEach(function(doc) {
        let data = doc.data()

        if (data.created && data.content && data.content.length > 0) {
            let date = new Date(data.created.seconds * 1000)
            let timestamp = date.toTimeString()
            let formatted = timestamp.split(" ")[0]
            let asString = formatted + " " + data.displayName + ": " + data.content
            messages.splice(0, 0, {
                content: asString,
                uId: data.uId,
            })
        }
    });

    while (messages.length > maxMessages) {
        messages.shift()
    }

    displayData[channel].data = messages
    displayMessagesData()
}

function displayMessagesData() {
    let messages = displayData[selectedChannel] && displayData[selectedChannel].data

    if (!messages) {
        return
    }

    let displayMessages = document.getElementById('displayMessages')
    displayMessages.innerHTML = ""

    messages.forEach(function(value) {
        let div = document.createElement("div")
        let p = document.createElement("p")

        p.setAttribute("class", "messageContent")
        if (user && value.uId === user.uid) {
            div.setAttribute("class", "ourMessage")
            p.style.backgroundColor = "#454545"
        } else {
            div.setAttribute("class", "message")
            p.style.backgroundColor = "#3b3b3b"
        }
        p.innerText = value.content

        div.appendChild(p)
        displayMessages.appendChild(div)
    })
}
