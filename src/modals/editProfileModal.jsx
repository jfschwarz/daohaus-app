import React, { useState, useEffect } from 'react';
import {
  Button,
  Flex,
  Input,
  Heading,
  Stack,
  HStack,
  Icon,
  Tooltip,
  Box,
  Link,
  Image,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { RiInformationLine, RiErrorWarningLine } from 'react-icons/ri';
import { AiOutlinePlus } from 'react-icons/ai';
import Modal from './genericModal';
import TextBox from '../components/TextBox';
import { useInjectedProvider } from '../contexts/InjectedProviderContext';
import { useOverlay } from '../contexts/OverlayContext';
import { profileFields, uploadFields } from '../content/profile-fields';
import { getDid, getProfile, updateProfile, storeProfile } from '../utils/3box';

const EditProfileModal = () => {
  const { address } = useInjectedProvider();
  const { setGenericModal, successToast } = useOverlay();
  const { register, handleSubmit, errors } = useForm();
  const [did, setDid] = useState();
  const [profile, setProfile] = useState();

  const authenticate = async () => {
    const localDid = await getDid(address);
    setDid(localDid);
  };

  const onSubmit = async values => {
		console.log("Values")
		console.log(values)
		console.log("After")
    const localProfile = {
      ...profile,
      ...values,
    };
    console.log(localProfile);
    const result = await updateProfile(did, localProfile);
    console.log(result);
		setProfile(localProfile)
    successToast({ title: 'Updated IDX profile.' });
    setGenericModal({});
  };

  // TODO catch avatar and banner upload
  // TODO emoji catcher
  // TODO figure out unauthenticated fetch

  useEffect(() => {
    const fetchIdxProfile = async () => {
      let local = await getProfile(did);
			if (!local) {
				local = await storeProfile(did)
			}
			// Might make sense to link to mainnet
      setProfile(local);
			console.log("Profile")
			console.log(did)
			console.log(local)
    };
    // const fetchGenericProfile = async () => {
    //   const local = await getProfile(did?.ceramic, `${address}@eip155:1`);
		// 	console.log("Profile")
		// 	console.log(local)
    //   setProfile(local);
    // };
    console.log('Did');
    console.log(did);
    if (did) {
      fetchIdxProfile();
    }
  }, [did, address]);

  const fields = profileFields(register);

  const HelperTextComponent = ({ text }) => {
    return (
      <Tooltip label={text} hasArrow placement='right'>
        <Box>
          <Icon as={RiInformationLine} w='15px' h='15px' />
        </Box>
      </Tooltip>
    );
  };

  return (
    <Modal modalId='editProfile' size='xl'>
      <Stack>
        <TextBox variant='label' color='secondary.100'>
          Basic Profile
        </TextBox>
        <Heading size='lg'>Update Basic Profile</Heading>
        <TextBox value='body' size='xs' maxW='80%'>
          Editing here will update your profile everywhere{' '}
          <Link
            href='https://self.id'
            target='_blank'
            rel='noreferrer noopener'
          >
            IDX
          </Link>{' '}
          is used.
        </TextBox>
      </Stack>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Flex wrap='wrap' justify='space-between' my={4} position='relative'>
          {!did ?
            <Flex
              display={profile ? 'none' : 'flex'}
              w='106%'
              h='105%'
              top='-5'
              left='-5'
              backdropFilter='blur(6px)'
              position='absolute'
              zIndex={5}
              justify='center'
              align='center'
            >
              <TextBox w='40%' textAlign='center'>
                Connect to update your profile
              </TextBox>
            </Flex> : <></>
          }

          {did?.did && (
            <HStack w='100%' justify='space-between'>
              {profile &&
                uploadFields.map(upload => {
                  const url = profile[upload.id]?.original?.src.replace(
                    'ipfs://',
                    'https://ipfs.infura.io/ipfs/',
                  );
                  return (
                    <Stack
                      key={upload.id}
                      w={upload.id === 'background' ? upload.w : undefined}
                    >
                      <HStack>
                        <TextBox size='xs'>{upload.name}</TextBox>
                        {upload.helperText && (
                          <HelperTextComponent text={upload.helperText} />
                        )}
                      </HStack>
                      {profile[upload.id] ? (
                        <Image
                          w={upload.id === 'image' ? upload.w : undefined}
                          h='50px'
                          borderRadius={upload.borderRadius}
                          src={url}
                          objectFit='cover'
                          _hover={{ cursor: 'pointer' }}
                          onClick={() => undefined}
                        />
                      ) : (
                        <Flex
                          h='50px'
                          w={upload.w}
                          minW={upload.minW}
                          justify={upload.justify}
                          align='center'
                          border='1px'
                          borderStyle='dotted'
                          borderColor='whiteAlpha.800'
                          borderRadius={upload.borderRadius}
                          pl={upload.pl}
                          _hover={{ cursor: 'pointer' }}
                        >
                          <Icon
                            as={AiOutlinePlus}
                            h='25px'
                            w='25px'
                            color='primary.100'
                          />
                        </Flex>
                      )}
                    </Stack>
                  );
                })}
            </HStack>
          )}

          {fields.map(field => (
            <Stack
              key={field.id}
              width={field.fullWidth ? '100%' : '45%'}
              my={2}
            >
              <HStack>
                <TextBox size='xs'>{field.name}</TextBox>
                {field.helperText && (
                  <HelperTextComponent text={field.helperText} />
                )}
              </HStack>

              <Input
                name={field.id}
                placeholder={field.placeholder}
                defaultValue={profile && profile[field.id]}
                ref={!field.register ? register : undefined}
                {...field.register}
              />
              {errors[field.id] && (
                <HStack>
                  <Icon
                    as={RiErrorWarningLine}
                    w='15px'
                    h='15px'
                    color='primary.100'
                  />
                  <TextBox size='xs' color='primary.100'>
                    {errors[field.id].message}
                  </TextBox>
                </HStack>
              )}
            </Stack>
          ))}
        </Flex>

        <Flex justify='space-between'>
          <Button onClick={() => setGenericModal({})} variant='outline'>
            Cancel
          </Button>
          {did ? (
            <Button type='submit'>Submit</Button>
          ) : (
            <Button onClick={authenticate}>Connect</Button>
          )}
        </Flex>
      </form>
    </Modal>
  );
};

export default EditProfileModal;
