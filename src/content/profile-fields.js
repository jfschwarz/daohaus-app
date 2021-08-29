const validUrl = /https?:\/\/(www.)?[-a-zA-Z0-9@:%._+~#=]{1,256}.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()!@:%_+.~#?&//=]*)/;
const validCountryCode = /^[A-Z]{2}$/;

export const uploadFields = [
  {
    id: 'image',
    name: 'Avatar',
    helperText: 'Testing',
    borderRadius: '50%',
    w: '50px',
    justify: 'center',
  },
  {
    id: 'background',
    name: 'Banner',
    helperText: 'Testing',
    justify: 'flex-start',
    minW: '350px',
    w: '70%',
    pl: '15px',
  },
];

export const profileFields = register => {
  return [
    {
      id: 'name',
      name: 'Name',
      placeholder: 'Michael Scott',
      helperText: 'Testing',
      fullWidth: true,
      // check for max length?
    },
    {
      id: 'description',
      name: 'Bio',
      placeholder: 'My little DAO bio',
      helperText: 'Testing',
      fullWidth: true,
      // check for max length?
    },
    {
      id: 'emoji',
      name: 'Spirit Emoji',
      placehorder: '💡',
      helperText: 'Testing',
      // check for max length?
    },
    {
      id: 'homeLocation',
      name: 'Location',
      placeholder: 'Malta',
      helperText: 'Testing',
      // check for max length?
    },
    {
      id: 'residenceCountry',
      name: '2-letter Country Code',
      placeholder: 'UK',
      helperText: 'Testing',
      register: register('residenceCountry', {
        validate: {
          countryCode: v => validCountryCode.test(v) || '2 Letter Country Code',
        },
      }),
    },
    {
      id: 'url',
      name: 'URL',
      placeholder: 'https://daohaus.eth',
      helperText: 'Testing',
      register: register('url', {
        validate: {
          isUrl: v => validUrl.test(v) || 'Please provide valid URL address',
        },
      }),
    },
  ];
};
