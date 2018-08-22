const myImage = document.getElementById('img');
const faceDiv = document.getElementById('faces');

window.setInterval(() => {
    console.log('interval');
      myImage.src = `http://localhost:8000/image?q=${(new Date()).getMilliseconds()}`;
      detect();
    }, 1000);

function detect() {
    const faceDetector = new window.FaceDetector();
    faceDetector.detect(myImage)
        .then((faces) => {
            faces.map((face) => {
                const box = face.boundingBox;
                faceDiv.setAttribute('style',`position: absolute; top: ${box.top}; left: ${box.left};width: ${box.width};height: ${box.height};border: 1px solid yellow`);
            })
        }).catch(console.error);
}