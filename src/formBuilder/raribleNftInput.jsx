import React, { useState, useEffect } from 'react';
import { Box, Image, Text } from '@chakra-ui/react';

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
  const link = watch('nftListing');

  useEffect(() => {
    if (link && link.length > 0) {
      const [raribleId] = link.match(/(?<=(token\/))(0x.*?)(?=(\/|\?))/);
      getRaribleMetaData(raribleId, daochain).then(result => {
        setTitle(result.name);
      });
      setNftId(raribleId);
    }
  }, [link, daochain]);

  return (
    <FieldWrapper>
      <LinkInput {...props} />
      <Text>{title}</Text>
    </FieldWrapper>
  );
};

export default RaribleNftInput;
