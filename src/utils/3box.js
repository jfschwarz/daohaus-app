import Ceramic from '@ceramicnetwork/http-client';
import { IDX } from '@ceramicstudio/idx';
import { ThreeIdConnect, EthereumAuthProvider } from '@3id/connect';
import { EthereumAuthProvider as LinkingProvider } from '@ceramicnetwork/blockchain-utils-linking';
import { Caip10Link } from '@ceramicnetwork/stream-caip10-link';
import ThreeIdResolver from '@ceramicnetwork/3id-did-resolver';
import { DID } from 'dids';

const aliases = {};
const ceramicInstance = new Ceramic('https://ceramic-clay.3boxlabs.com');

export const ceramic = () => {
  try {
    const resolver = {
      ...ThreeIdResolver.getResolver(ceramicInstance),
    };
    const did = new DID({ resolver });
    ceramicInstance.did = did;
    return ceramicInstance;
  } catch (err) {
    console.log(err);
  }
};

// Conundrum how to force profile creation
// fetch and update on mainnet
//
// Does metamask need to be on mainnet?
export const getDid = async address => {
  try {
    const localCeramic = ceramic();
    const threeIdConnect = new ThreeIdConnect();
    const authProvider = new EthereumAuthProvider(window.ethereum, address);
    await threeIdConnect.connect(authProvider);
    const provider = await threeIdConnect.getDidProvider();
    await localCeramic.did.setProvider(provider);
    const result = await localCeramic.did.authenticate();
    return localCeramic.did;
  } catch (err) {
    console.log(err);
  }
};

const exampleCryptoAccounts = async (did, idx) => {
  const accounts = await idx.get('cryptoAccounts');
  console.log('Accounts');
  console.log(accounts);
  console.log('After Accounts');
  if (!accounts[`${window.ethereum.selectedAddress}:1`]) {
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x1' }],
    });
    const localCeramic = new Ceramic('https://ceramic-clay.3boxlabs.com');
    console.log('hey');
    const link = await Caip10Link.fromAccount(
      localCeramic,
      `${window.ethereum.selectedAddress}@eip155:1`,
    );
    console.log(link);
    const authProvider = new LinkingProvider(
      window.ethereum,
      window.ethereum.selectedAddress,
    );
    console.log(authProvider);
    await link.setDid(did, authProvider);
    console.log('id set');
  }
};

export const getProfile = async did => {
  const localCeramic = new Ceramic('https://ceramic-clay.3boxlabs.com');
  localCeramic.setDID(did);
  try {
    const idx = new IDX({ ceramic: localCeramic, aliases });
    const result = await idx.get('basicProfile');
    await exampleCryptoAccounts(did, idx);
    return result;
  } catch (err) {
    console.error(`Trouble fetching basicProfile: ${err}`);
  }
};

export const storeProfile = async (did, profile) => {
  const localCeramic = new Ceramic('https://ceramic-clay.3boxlabs.com');
  localCeramic.setDID(did);
  try {
    const idx = new IDX({ ceramic: localCeramic, aliases });
    // Profile has to be set
    const result = await idx.set('basicProfile', {
      name: 'Example',
    });
    return result;
  } catch (err) {
    console.error('Trouble intializing IDX');
  }
};

export const updateProfile = async (did, profile) => {
  try {
    const localCeramic = new Ceramic('https://ceramic-clay.3boxlabs.com');
    localCeramic.setDID(did);
    const idx = new IDX({ ceramic: localCeramic, aliases });
    const result = await idx.set('basicProfile', profile);
    console.log(result);
    return result;
  } catch (err) {
    console.log(err);
  }
};

export const fetchProfile = async address => {
  try {
    const response = await fetch(
      `https://ipfs.3box.io/profile?address=${address}`,
    );
    if (response.status === 'error') {
      console.log('Profile does not exist');
    }

    const boxProfile = response.json();
    return boxProfile;
  } catch (error) {
    console.log(error);
  }
};

export const cacheProfile = (newProfile, memberAddress) => {
  const profileCache = JSON.parse(
    window.sessionStorage.getItem('3BoxProfiles'),
  );
  const newCache = JSON.stringify({
    ...profileCache,
    [memberAddress]: newProfile,
  });
  try {
    window.sessionStorage.setItem('3BoxProfiles', newCache);
  } catch (error) {
    console.log('Session storage is full');
    console.log('clearing session storage');
    sessionStorage.clear();
  }
};

export const getCachedProfile = memberAddress => {
  const profileData = JSON.parse(window.sessionStorage.getItem('3BoxProfiles'));
  return profileData[memberAddress] ? profileData[memberAddress] : false;
};

export const ensureCacheExists = () => {
  const cacheExists = window.sessionStorage.getItem('3BoxProfiles');
  if (cacheExists) {
    return true;
  }
  try {
    window.sessionStorage.setItem('3BoxProfiles', JSON.stringify({}));
  } catch (error) {
    console.log('Sessions storage is full');
    console.log('clearing sessions storage');
    sessionStorage.clear();
  }
};

export const handleGetProfile = async memberAddress => {
  ensureCacheExists();
  const cachedProfile = getCachedProfile(memberAddress);
  if (cachedProfile) {
    return cachedProfile;
  }
  const newProfile = await fetchProfile(memberAddress);
  if (newProfile) {
    cacheProfile(newProfile, memberAddress);
  }
  return newProfile;
};
