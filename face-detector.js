const myImage = document.getElementById('img');
const faceDiv = document.getElementById('faces');

myImage.onload = () => {
  const faceDetector = new window.FaceDetector();
  faceDetector.detect(myImage)
    .then((faces) => {
      faces.map((face) => {
        const box = face.boundingBox;
        faceDiv.setAttribute('style',`position: absolute; top: ${box.top}; left: ${box.left};right: ${box.right};bottom: ${box.bottom};border: 1px yellow`);
      })
    }).catch(console.error);
};

myImage.src = 'http://localhost:8000/image';
