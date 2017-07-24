import fs = require('fs');
import path = require('path');
import Q = require('q');
import tl = require('vsts-task-lib/task');
import vsts = require('vso-node-api');

export class SecureFileHelpers {
    serverConnection: vsts.WebApi;

    constructor() {
        let serverUrl: string = tl.getVariable('System.TeamFoundationCollectionUri');
        let serverCreds: string = tl.getEndpointAuthorizationParameter('SYSTEMVSSCONNECTION', 'ACCESSTOKEN', false);
        let authHandler = vsts.getPersonalAccessTokenHandler(serverCreds);

        this.serverConnection = new vsts.WebApi(serverUrl, authHandler);
    }

    /**
     * Download secure file contents to a temporary location for the build
     * @param secureFileId
     */
    async downloadSecureFile(secureFileId: string, additionalPath: string) {
        let tempDownloadPath: string = this.getSecureFileTempDownloadPath(secureFileId, additionalPath);

        console.log('Creating write stream at ' + tempDownloadPath);
        let file: NodeJS.WritableStream = fs.createWriteStream(tempDownloadPath);

        console.log('Downloading secure file contents with id: ' + secureFileId + ' to: ' + tempDownloadPath);
        let stream = (await this.serverConnection.getTaskAgentApi().downloadSecureFile(
            tl.getVariable('SYSTEM.TEAMPROJECT'), secureFileId, tl.getSecureFileTicket(secureFileId), false)).pipe(file);
        let defer = Q.defer();
        stream.on('finish', () => {
            defer.resolve();
        });
        await defer.promise;
        console.log('Downloaded secure file contents to: ' + tempDownloadPath);
        return tempDownloadPath;
    }

    /**
     * Returns the temporary download location for the secure file
     * @param secureFileId
     */
    getSecureFileTempDownloadPath(secureFileId: string, additionalPath: string) {
        console.log('In getSecureFileTempDownloadPath, ' + secureFileId);
        let fileName: string = tl.getSecureFileName(secureFileId);
        console.log('Filename: ' + fileName);
        let tempDownloadPath: string = tl.resolve(tl.getVariable('Build.Repository.LocalPath'), additionalPath, fileName);
        console.log(tempDownloadPath);
        return tempDownloadPath;
    }
}
