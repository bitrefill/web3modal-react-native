import 'react-native-get-random-values';
import '@walletconnect/react-native-compat';
import '@ethersproject/shims';
import './config/animations';
import { ExplorerCtrl } from './controllers/ExplorerCtrl';

export { Web3Modal } from './components/Web3Modal';
export { Web3Button } from './components/Web3Button';
export { useWeb3Modal } from './hooks/useWeb3Modal';
export { IProvider, IProviderMetadata } from './types/coreTypes';
export { useWalletConnect } from './hooks/useWalletConnect';

export const getWalletImageUrl = ExplorerCtrl.getWalletImageUrl;
