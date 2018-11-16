const host = 'http://localhost:8000';
const image = document.getElementById('img');
const refreshInterval = 250;
let posting = false;

window.setInterval(() => {
      image.src = `http://localhost:8000/image?q=${(new Date()).valueOf()}`;
      detect();
    }, refreshInterval);

function detect() {
    const faceDetector = new window.FaceDetector();

    const facesDetected = (faces) => {
      removeFaceElements();
      faces.map(face => {
        addFaceElement(face);
      });
    };

    faceDetector
      .detect(image)
      .then(facesDetected)
      .then(postActions)
      .catch(console.error);
}

function postActions() {
  const img = document.querySelector('#img').getBoundingClientRect();
  let face = document.querySelector('.face');
  let body = JSON.stringify({actions: []});
  if(face && !posting) {
    posting = true;
    console.log('posting ? ', posting);
    face = face.getBoundingClientRect();
    const actions = getActionsFromGeometry(img, face);
    console.log('posting actions', actions);
    body = JSON.stringify({actions});
    fetch(`${host}/postActions`, {method: 'POST', body})
      .then((response) => {
        console.log('post complete > ', response);
        posting = false;
      });
  }
}

function getActionsFromGeometry(img, face) {
  const actions = [];

  if(face.width <= 50) {
    actions.push('front');
  } else if(face.width >= 100) {
    actions.push('back')
  }

  if (face.y < 75) {
    actions.push('up');
  } else if (face.y + face.height >= img.height - 75) {
    actions.push('down');
  }

  if(face.x < (120)) {
    actions.push('left');
  } else if((face.x + face.width) > (img.width - 120)) {
    actions.push('right');
  }

  return actions;
}

function addFaceElement(face) {
  const faceElement = document.createElement('div');
  const {boundingBox, landmarks} = face;
  const {top, left} = boundingBox;
  faceElement.setAttribute('class', 'face');
  faceElement.setAttribute('style', getFaceElementStyle(boundingBox));

  const locations = getEyeLocations(landmarks)
    .reduce((accumulator, current) => accumulator.concat(current), []);
  const eyeBox = getEyeBox(locations);
  addEyeElement(faceElement, eyeBox, top, left);

  document.body.appendChild(faceElement)
}

function removeFaceElements() {
  const elements = document.querySelectorAll('.face, .eye');
  elements.forEach(element => { element.parentNode.removeChild(element); });
}

function getFaceElementStyle({top, left, width, height} = {top: '0', left: '0', width: '100px', height: '100px' }) {
  return `top: ${Math.trunc(top)}; left: ${Math.trunc(left)}; width: ${Math.trunc(width)}px; height: ${Math.trunc(height)}px;`;
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
  return `top: ${top - faceTop - 10}px; left: ${left - faceLeft - 20}px; height: ${height}; width: ${width};`;
}
