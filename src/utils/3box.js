import Ceramic from '@ceramicnetwork/http-client';
import { IDX } from '@ceramicstudio/idx';
import { ThreeIdConnect, EthereumAuthProvider } from '@3id/connect';
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

export const getDid = async address => {
  try {
    const localCeramic = ceramic();
    const threeIdConnect = new ThreeIdConnect();
    const authProvider = new EthereumAuthProvider(window.ethereum, address);
    await threeIdConnect.connect(authProvider);
    const provider = await threeIdConnect.getDidProvider();
    await localCeramic.did.setProvider(provider);
    const result = await localCeramic.did.authenticate();
    return {
      did: result,
      ceramic: localCeramic,
    };
  } catch (err) {
    console.log(err);
  }
};

export const getProfile = async (localCeramic, userDid) => {
  try {
    if (userDid) {
      console.log(userDid);
      try {
        const noAuthCeramic = ceramic();
        const idx = new IDX({ ceramic: noAuthCeramic, aliases });
        const result = await idx.get('basicProfile', userDid);
        return result;
      } catch (err) {
        console.log(err);
      }
    } else {
      try {
        const idx = new IDX({ ceramic: localCeramic, aliases });
        const result = await idx.get('basicProfile');
        return result;
      } catch (err) {
        console.log(err);
      }
    }
  } catch (err) {
    console.log(err);
  }
};

export const updateProfile = async (localCeramic, profile) => {
  try {
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
