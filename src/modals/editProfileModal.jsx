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
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { RiInformationLine, RiErrorWarningLine } from 'react-icons/ri';
import { AiOutlinePlus } from 'react-icons/ai';
import Modal from './genericModal';
import TextBox from '../components/TextBox';
import { useInjectedProvider } from '../contexts/InjectedProviderContext';
import { useOverlay } from '../contexts/OverlayContext';
import { profileFields, uploadFields } from '../content/profile-fields';
import { getDid, getProfile, updateProfile } from '../utils/3box';

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
    const localProfile = {
      ...profile,
      ...values,
    };
    console.log(localProfile);
    const result = await updateProfile(did.ceramic, localProfile);
    console.log(result);
    successToast({ title: 'Updated IDX profile.' });
    setGenericModal({});
  };

  // TODO catch avatar and banner upload
  // TODO emoji catcher
  // TODO figure out unauthenticated fetch

  useEffect(() => {
    const fetchIdxProfile = async () => {
      const local = await getProfile(did.ceramic);
      setProfile(local);
    };
    // const fetchGenericProfile = async () => {
    //   const local = await getProfile(did?.ceramic, `${address}@eip155:1`);
    //   setProfile(local);
    // };
    if (did?.did) {
      fetchIdxProfile();
    } else if (address) {
      // fetchGenericProfile();
    }
  }, [did, address]);

  const fields = profileFields(register);

  return (
    <Modal modalId='editProfile' size='xl'>
      <Stack>
        <TextBox variant='label' color='secondary.100'>
          Basic Profile
        </TextBox>
        <Heading size='lg'>Update Basic Profile</Heading>
        <TextBox value='body' size='xs'>
          Editing here will update your profile everywhere IDX is used.
        </TextBox>
      </Stack>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Flex wrap='wrap' justify='space-between' my={4} position='relative'>
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
          </Flex>

          <HStack w='100%' justify='space-between'>
            {uploadFields.map(upload => (
              <Stack key={upload.id}>
                <HStack>
                  <TextBox size='xs'>{upload.name}</TextBox>
                  {upload.helperText && (
                    <Tooltip
                      label={upload.helperText}
                      hasArrow
                      placement='right'
                    >
                      <Box>
                        <Icon as={RiInformationLine} w='15px' h='15px' />
                      </Box>
                    </Tooltip>
                  )}
                </HStack>
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
              </Stack>
            ))}
          </HStack>

          {fields.map(field => (
            <Stack
              key={field.id}
              width={field.fullWidth ? '100%' : '45%'}
              my={2}
            >
              <HStack>
                <TextBox size='xs'>{field.name}</TextBox>
                {field.helperText && (
                  <Tooltip label={field.helperText} hasArrow placement='right'>
                    <Box>
                      <Icon as={RiInformationLine} w='15px' h='15px' />
                    </Box>
                  </Tooltip>
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
          {did?.did ? (
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
