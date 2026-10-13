// Development-only canvas recorder for creating the site gameplay clip.
const button = document.createElement('button');
button.textContent = '● Record gameplay';
Object.assign(button.style, { position: 'fixed', top: '70px', right: '20px', zIndex: 999, padding: '10px 16px', border: '2px solid #34312e', borderRadius: '8px', background: '#f1e8cf', color: '#c44d43', font: 'bold 16px sans-serif', cursor: 'pointer' });
document.body.append(button);
let recorder, chunks = [];
button.addEventListener('click', () => {
  if (recorder?.state === 'recording') { recorder.stop(); button.textContent = '● Record gameplay'; return; }
  const canvas = document.querySelector('#game canvas');
  if (!canvas) return;
  chunks = [];
  const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm';
  recorder = new MediaRecorder(canvas.captureStream(30), { mimeType });
  recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
  recorder.onstop = () => {
    const url = URL.createObjectURL(new Blob(chunks, { type: mimeType }));
    const link = document.createElement('a'); link.href = url; link.download = 'mathgame-gameplay.webm'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  };
  recorder.start(); button.textContent = '■ Stop recording';
});
