import { AppConfig } from 'blockstack';
import { didConnect } from 'react-blockstack';
import { addressToString } from '@blockstack/stacks-transactions';
import { getStacksAccount } from './StacksAccount';

export const appConfig = new AppConfig(['store_write', 'publish_data']);

async function afterSTXAddressPublished() {
  console.log('STX address published');
}

export const connectOptions = session => {
  return {
    finished: ({ userSession }) => {
      didConnect({ userSession });

      const userData = userSession.loadUserData();
      const { address } = getStacksAccount(userData.appPrivateKey);
      console.log(JSON.stringify({ address: addressToString(address) }));
      userSession
        .putFile(
          'stx.json',
          JSON.stringify({ address: addressToString(address) }),
          { encrypt: false }
        )
        .then(r => afterSTXAddressPublished())
        .catch(r => {
          console.log('STX address NOT published, retrying');
          console.log(r);
          userSession.deleteFile('stx.json').then(() => {
            userSession
              .putFile(
                'stx.json',
                JSON.stringify({ address: addressToString(address) }),
                { encrypt: false }
              )
              .then(r => afterSTXAddressPublished())
              .catch(r => {
                console.log('STX address NOT published');
                console.log(r);
              });
          });
        });
    },
    appDetails: {
      name: 'Speed Spend',
      icon: 'https://speed-spend.netlify.app/speedspend.png',
    },
    userSession: session,
  };
};
