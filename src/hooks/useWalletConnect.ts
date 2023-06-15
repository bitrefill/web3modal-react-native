import { useCallback } from 'react';
import { AccountCtrl } from '../controllers/AccountCtrl';
import { ClientCtrl } from '../controllers/ClientCtrl';
import { ConfigCtrl } from '../controllers/ConfigCtrl';
import { ExplorerCtrl } from '../controllers/ExplorerCtrl';
import { WcConnectionCtrl } from '../controllers/WcConnectionCtrl';
import { useConfigure, type ConfigureProps } from '../hooks/useConfigure';
import type { Listing } from '../types/controllerTypes';
import { ExplorerUtil } from '../utils/ExplorerUtil';
import { useSnapshot } from 'valtio';

export const useWalletConnect = ({
  projectId,
  relayUrl,
  providerMetadata,
  themeMode,
}: ConfigureProps) => {
  useConfigure({ projectId, relayUrl, providerMetadata, themeMode });

  const { pairingUri } = useSnapshot(WcConnectionCtrl.state);
  const wallets = useSnapshot(ExplorerCtrl.state.wallets);
  const accountState = useSnapshot(AccountCtrl.state);
  const clientState = useSnapshot(ClientCtrl.state);

  const connectToWallet = useCallback(
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

  return {
    connectToWallet,
    isConnected: accountState.isConnected,
    address: accountState.address,
    provider: clientState.initialized ? ClientCtrl.provider() : undefined,
    uri: pairingUri,
    wallets,
  };
};
