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
      register: register('name', {
        maxLength: {
          value: 150,
          message: 'Name must be less than 150 characters',
        },
      }),
    },
    {
      id: 'description',
      name: 'Bio',
      placeholder: 'My little DAO bio',
      helperText: 'Testing',
      fullWidth: true,
      // check for max length?
      register: register('description', {
        maxLength: {
          value: 420,
          message: 'Name must be less than 420 characters',
        },
      }),
    },
    {
      id: 'emoji',
      name: 'Spirit Emoji',
      placehorder: '💡',
      helperText: 'Testing',
      register: register('emoji', {
        maxLength: { value: 2, message: 'Not a valid emoji' },
      }),
    },
    {
      id: 'homeLocation',
      name: 'Location',
      placeholder: 'Malta',
      helperText: 'Testing',
      register: register('homeLocation', {
        maxLength: {
          value: 140,
          message: 'Location must be less than 420 characters',
        },
      }),
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
