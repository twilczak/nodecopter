const myImage = document.getElementById('img');

window.setInterval(() => {
      myImage.src = `http://localhost:8000/image?q=${(new Date()).valueOf()}`;
      detect();
    }, 500);

function detect() {
    removeFaceElements();
    const faceDetector = new window.FaceDetector();
    faceDetector.detect(myImage)
        .then((faces) => {
          console.log(faces);
          faces.map((face) => {
            addFaceElement(face)
          })
        }).catch(console.error);
}

function addFaceElement(face) {
  const faceElement = document.createElement('div');
  const {boundingBox, landmarks} = face;
  const {top, left} = boundingBox;
  faceElement.setAttribute('class', 'face');
  faceElement.setAttribute('style', getFaceElementStyle(boundingBox));

  getEyeLocations(landmarks)
    .map(getEyeBox)
    .forEach(eye => addEyeElement(faceElement, eye, top, left));

  document.body.appendChild(faceElement)
}

function removeFaceElements() {
  const elements = document.querySelectorAll('.face, .eye');
  elements.forEach(element => { element.parentNode.removeChild(element); });
}

function getFaceElementStyle({top, left, width, height} = {top: '0', left: '0', width: '100px', height: '100px' }) {
  return `position: absolute; top: ${Math.trunc(top)}; left: ${Math.trunc(left)}; width: ${Math.trunc(width)}px; height: ${Math.trunc(height)}px; border: 3px solid white;`;
}

function addEyeElement(face, eye, top, left) {
  const eyeElement = document.createElement('div');
  eyeElement.setAttribute('class', 'eye');
  eyeElement.setAttribute('style', getEyeElementStyle(eye, top, left));
  face.appendChild(eyeElement);
}

function getEyeLocations(landmarks) {
  return landmarks.filter( landmark => landmark.type === 'eye' ).map(eye => eye.locations);
}

function getEyeBox(locations) {
  const xs = locations.map(location => location.x);
  const ys = locations.map(location => location.y);
  const maxX = Math.trunc(Math.max(...xs));
  const maxY = Math.trunc(Math.max(...ys));
  const minX = Math.trunc(Math.min(...xs));
  const minY = Math.trunc(Math.min(...ys));

  return {
    top: minY,
    left: minX,
    height: maxY - minY,
    width: maxX - minX
  }
}

function getEyeElementStyle({top, left, height, width}, faceTop, faceLeft) {
  return `position: absolute; top: ${top - faceTop}px; left: ${left - faceLeft}px; height: ${height}; width: ${width}; background-color: black; border-3px solid black;`;
}
