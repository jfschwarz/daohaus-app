import React, { useState, useEffect } from 'react';
import { Box, Image, Text, AspectRatio } from '@chakra-ui/react';

import { useParams } from 'react-router';
import { getRaribleMetaData } from '../utils/rarible';
import FieldWrapper from './fieldWrapper';
import LinkInput from './linkInput';

const RaribleNftInput = props => {
  const { localForm } = props;
  const { watch } = localForm;

  const { daochain } = useParams();
  const [nftId, setNftId] = useState();
  const [title, setTitle] = useState();
  const [uri, setUri] = useState();
  const link = watch('nftListing');

  useEffect(() => {
    if (link && link.length > 0) {
      const [raribleId] = link.match(/(?<=(token\/))(0x.*?)(?=(\/|\?))/);
      setNftId(raribleId);
    }
  }, [link, daochain]);

  useEffect(() => {
    if (nftId) {
      getRaribleMetaData(nftId, daochain).then(result => {
        if (result) {
          setTitle(result.name);
          setUri(result.image?.url?.BIG);
        }
      });
    }
  }, [nftId, daochain]);

  return (
    <FieldWrapper>
      <LinkInput {...props} />
      <Box width='100%' m='auto'>
        <Text mb={3}>{title}</Text>
        <AspectRatio
          ratio={1}
          width='100%'
          className='aspect-box'
          sx={{
            '&>img': {
              objectFit: 'contain',
            },
          }}
        >
          <Image src={uri} />
        </AspectRatio>
      </Box>
    </FieldWrapper>
  );
};

export default RaribleNftInput;
