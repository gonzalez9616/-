var textP = document.getElementById('text')
let db = firebase.firestore()


let user
let selectedChannel = 'main'
const maxMessages = 10;

fetchMessagesInit()

let provider = new firebase.auth.GoogleAuthProvider();

function userSignIn() {
    firebase.auth()
        .signInWithPopup(provider)
        .then((result) => {
            //Worked
            user = result.user;
            document.getElementById('userGreet').innerText = "Welcome, " + user.displayName + "!!!!"
        }).catch((error) => {
            //Failed
            console.log("Failed auth: " + error.code)
            console.log(error)
        });

}


function sendMessage() {
    let userInputBox = document.getElementById('messageBox')
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

function fetchMessagesInit() {
    let messages = db.collection("channels").doc(selectedChannel).collection("messages")

    let query = messages.orderBy("created", "desc").limit(maxMessages); //most recent message first, then the last x

    query.get() //First get to catch up
        .then((snapshot) => {
            displayMessageData(snapshot)
        })

    query.onSnapshot((snapshot) => {
        displayMessageData(snapshot)
    })
}

function displayMessageData(snapshot) {
    let displayMessages = document.getElementById('displayMessages')
    let text = ""
    snapshot.forEach(function(doc) {
        let data = doc.data()

        if (data.created) {
            let date = new Date(data.created.seconds * 1000)
            let timestamp = date.toTimeString()
            let formatted = timestamp.split(" ")[0]
            let asString = formatted + " " + data.displayName + ": " + data.content
            text = asString + "\n" + text
        }
    });

    displayMessages.innerText = text;
}
