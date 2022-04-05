window.snapshotMatchers = {
  toMatchSnapshot: () => {
    return {
      compare: (actual) => {
        let message = '';
        let pass = false;
        if (actual.type === 'new') {
          message = '没有定义快照';
        } else if (actual.type === 'changed') {
          message = '快照不一致';
        } else if (actual.type === 'passed') {
          message = '快照一致';
          pass = true;
        }
        return {
          pass,
          message: `${message} #${actual.type}-${actual.uploadFileName}#`,
        };
      },
    };
  },
};

fetch('/visual-test/init-snapshot', {
  method: 'POST',
});

window.snapshotIt = function (caseDescription, specDefinitions) {
  let count = 0;
  const snapshot = function (done, canvas, snapshotDescription) {
    canvas.toBlob((blob) => {
      const formData = new FormData();
      snapshotDescription = snapshotDescription || ++count;
      const file = new File([blob], `${caseDescription}-${snapshotDescription}.png`, {
        type: 'image/png',
      });
      formData.append('file', file);
      formData.append('snapshotDescription', snapshotDescription);
      formData.append('caseDescription', caseDescription);
      fetch('/visual-test/upload', {
        method: 'POST',
        body: formData,
      })
        .then((data) => data.json())
        .then((result) => {
          expect(result).toMatchSnapshot();
        })
        .finally(() => {
          done();
        });
    }, 'image/png');
  };

  it(caseDescription, (done) => {
    specDefinitions.call(this, snapshot.bind(this, done), done);
  });
};

window.xsnapshotIt = function (description) {
  xit(description, () => {});
};
