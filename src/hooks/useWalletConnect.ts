import { useCallback } from 'react';
import { AccountCtrl } from '../controllers/AccountCtrl';
import { ClientCtrl } from '../controllers/ClientCtrl';
import { ConfigCtrl } from '../controllers/ConfigCtrl';
import { ExplorerCtrl } from '../controllers/ExplorerCtrl';
import { WcConnectionCtrl } from '../controllers/WcConnectionCtrl';
import { useConfigure } from '../hooks/useConfigure';
import type { Listing } from '../types/controllerTypes';
import { ExplorerUtil } from '../utils/ExplorerUtil';
import { useSnapshot } from 'valtio';
import type { SessionTypes } from '@walletconnect/types';
import { setDeepLinkWallet } from '../utils/StorageUtil';
import { defaultSessionParams } from '../constants/Config';
import type { IProviderMetadata, ISessionParams } from '../types/coreTypes';

interface WCProps {
  projectId: string;
  providerMetadata: IProviderMetadata;
  relayUrl?: string;
  sessionParams?: ISessionParams;
}

export const useWalletConnect = ({
  projectId,
  relayUrl,
  providerMetadata,
  sessionParams = defaultSessionParams,
}: WCProps) => {
  useConfigure({ projectId, relayUrl, providerMetadata });

  const { pairingUri } = useSnapshot(WcConnectionCtrl.state);
  const wallets = useSnapshot(ExplorerCtrl.state.wallets);
  const accountState = useSnapshot(AccountCtrl.state);
  const clientState = useSnapshot(ClientCtrl.state);

  const connectToWalletService = useCallback(
    (walletInfo: Listing) => {
      if (pairingUri) {
        ConfigCtrl.setRecentWalletDeepLink(
          walletInfo.mobile?.native || walletInfo.mobile?.universal
        );
        ExplorerUtil.navigateDeepLink(
          walletInfo.mobile.universal,
          walletInfo.mobile.native,
          pairingUri
        );
      }
    },
    [pairingUri]
  );

  const onSessionCreated = async (session: SessionTypes.Struct) => {
    ClientCtrl.setSessionTopic(session.topic);
    const deepLink = ConfigCtrl.getRecentWalletDeepLink();
    try {
      if (deepLink) {
        await setDeepLinkWallet(deepLink);
        ConfigCtrl.setRecentWalletDeepLink(undefined);
      }
      AccountCtrl.getAccount();
    } catch (error) {}
  };

  const onSessionError = async () => {
    ConfigCtrl.setRecentWalletDeepLink(undefined);
  };

  const onConnect = async () => {
    const provider = ClientCtrl.provider();
    try {
      if (!provider) throw new Error('Provider not initialized');

      if (!accountState.isConnected) {
        const session = await provider.connect(sessionParams);
        if (session) {
          onSessionCreated(session);
          return session;
        }
      }
    } catch (error) {
      onSessionError();
    }
    return undefined;
  };

  return {
    connectToWalletService,
    isConnected: accountState.isConnected,
    address: accountState.address,
    provider: clientState.initialized ? ClientCtrl.provider() : undefined,
    uri: pairingUri,
    wallets,
    connect: onConnect,
    resetSession: ClientCtrl.resetSession,
  };
};
