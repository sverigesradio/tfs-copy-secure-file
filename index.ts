import tl = require('vsts-task-lib/task');
import trm = require('vsts-task-lib/toolrunner');
import securefiles = require('./securefiles-to-builddir');

async function run() {
    let secureFileId: string;
    let additionalPath: string;
    let secureFileHelpers: securefiles.SecureFileHelpers;

    try {
      console.log('Starting file download');
      secureFileId = tl.getInput('secureFile', true);
      additionalPath = tl.getInput('additionalPath', true);
      secureFileHelpers = new securefiles.SecureFileHelpers();
      let privateKeyLocation: string = await secureFileHelpers.downloadSecureFile(secureFileId, additionalPath);
      console.log('Resolved location: ' + privateKeyLocation);
    } catch (err) {
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}

run();
