window.onload = () => {
    var myImage = new Image();
    myImage.src = 'http://localhost:8000';
    var faceDiv = document.getElementById('faces');

    var faceDetector = new window.FaceDetector();
    faceDetector.detect(myImage)
        .then((faces) => {
            faces.map((face) => {
                var box = face.boundingBox
                faceDiv.setAttribute('style',`position: absolute; top: ${box.top}; left: ${box.left};right: ${box.right};bottom: ${box.bottom};border: 1px yellow`)
            })
        }).catch(console.log)
}
