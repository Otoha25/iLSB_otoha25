document.getElementById('button').addEventListener('click', () => {
    //document.getElementById('keywords').innerHTML += '3'
    console.log("click")
}, false)


function handleMessage (request,  sender,  sendResponse){
    console.log('recommend')
    document.getElementById("title").innerHTML = request.key
}

browser.runtime.onMessage.addListener(handleMessage)
