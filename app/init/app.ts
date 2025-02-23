// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import DatabaseManager from '@database/manager';
import {getAllServerCredentials} from '@init/credentials';
import {initialLaunch} from '@init/launch';
import ManagedApp from '@init/managed_app';
import PushNotifications from '@init/push_notifications';
import GlobalEventHandler from '@managers/global_event_handler';
import NetworkManager from '@managers/network_manager';
import SessionManager from '@managers/session_manager';
import WebsocketManager from '@managers/websocket_manager';
import {registerScreens} from '@screens/index';
import {registerNavigationListeners} from '@screens/navigation';

let alreadyInitialized = false;
let serverCredentials: ServerCredential[];

export async function initialize() {
    if (!alreadyInitialized) {
        alreadyInitialized = true;
        serverCredentials = await getAllServerCredentials();
        const serverUrls = serverCredentials.map((credential) => credential.serverUrl);

        await DatabaseManager.init(serverUrls);
        await NetworkManager.init(serverCredentials);

        GlobalEventHandler.init();
        ManagedApp.init();
        SessionManager.init();
    }
}

export async function start() {
    await initialize();
    await WebsocketManager.init(serverCredentials);

    PushNotifications.init(serverCredentials.length > 0);

    registerNavigationListeners();
    registerScreens();
    initialLaunch();
}
