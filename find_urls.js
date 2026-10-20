fetch('https://app.sandbox.midtrans.com/snap/snap.js')
  .then(res => res.text())
  .then(text => {
    let idx = text.indexOf('A.init');
    console.log(text.slice(idx - 600, idx + 100));
  });
