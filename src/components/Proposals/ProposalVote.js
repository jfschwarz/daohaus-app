import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Box, Button, Flex, Icon, Skeleton, Tooltip } from '@chakra-ui/core';
import ContentBox from '../Shared/ContentBox';
import TextBox from '../Shared/TextBox';
import { FaThumbsUp, FaThumbsDown } from 'react-icons/fa';
import { RiErrorWarningLine, RiQuestionLine } from 'react-icons/ri';
import { isAfter, isBefore } from 'date-fns';
import { useTheme } from '../../contexts/CustomThemeContext';
import { motion } from 'framer-motion';

import {
  useMemberWallet,
  useDaoGraphData,
  useDao,
  useUser,
  useTxProcessor,
  useProposals,
  useWeb3Connect,
} from '../../contexts/PokemolContext';

import ContentBox from '../Shared/ContentBox';
import TextBox from '../Shared/TextBox';
import { MinionService } from '../../utils/minion-service';

const MotionBox = motion.custom(Box);

const ProposalVote = ({ proposal, setProposal }) => {
  const [theme] = useTheme();
  const [user] = useUser();
  const [dao] = useDao();
  const [wallet] = useMemberWallet();
  const [daoData] = useDaoGraphData();
  const [proposals] = useProposals();
  const [web3Connect] = useWeb3Connect();
  const [txProcessor, updateTxProcessor] = useTxProcessor();
  const [nextProposalToProcess, setNextProposal] = useState(null);
  const currentlyVoting = (proposal) => {
    return (
      isBefore(Date.now(), new Date(+proposal?.votingPeriodEnds * 1000)) &&
      isAfter(Date.now(), new Date(+proposal?.votingPeriodStarts * 1000))
    );
  };

  const txCallBack = (txHash, details) => {
    if (txProcessor && txHash) {
      txProcessor.setTx(txHash, user.username, details);
      txProcessor.forceUpdate = true;
      console.log('force update changed');
      updateTxProcessor({ ...txProcessor });
      // close model here
      // onClose();
      // setShowModal(null);
    }
    if (!txHash) {
      console.log('error: ', details);
    }
  };

  const cancelProposal = async (id) => {
    try {
      await dao.daoService.moloch.cancelProposal(id, txCallBack);
    } catch (err) {
      console.log('user rejected or transaction failed', err);
    }
  };

  const unlock = async (token) => {
    console.log('unlock ', token);
    try {
      await dao.daoService.token.unlock(token, txCallBack);
    } catch (err) {
      console.log(err);
    }
  };

  const sponsorProposal = async (id) => {
    console.log('sponsor ', id);
    try {
      await dao.daoService.moloch.sponsorProposal(id, txCallBack);
    } catch (err) {
      console.log('user rejected or transaction failed', err);
    }
  };

  const submitVote = async (proposal, vote) => {
    try {
      await dao.daoService.moloch.submitVote(
        proposal.proposalIndex,
        vote,
        txCallBack,
      );
    } catch (e) {
      console.error(`Error processing proposal: ${e.toString()}`);
    }
  };

  const processProposal = async (proposal) => {
    try {
      if (proposal.whitelist) {
        await dao.daoService.moloch.processWhitelistProposal(
          proposal.proposalIndex,
          txCallBack,
        );
      } else if (proposal.guildkick) {
        console.log('guildkick process');

        await dao.daoService.moloch.processGuildKickProposal(
          proposal.proposalIndex,
          txCallBack,
        );
      } else {
        await dao.daoService.moloch.processProposal(
          proposal.proposalIndex,
          txCallBack,
        );
      }
    } catch (e) {
      console.error(`Error processing proposal: ${e.toString()}`);
    }
  };

  const executeMinion = async (proposal) => {
    // TODO: will nedd to check if it has been executed yet
    const setupValues = {
      minion: proposal.minionAddress,
    };
    const minionService = new MinionService(
      web3Connect.web3,
      user.username,
      setupValues,
    );

    try {
      minionService.executeAction(proposal.proposalId, txCallBack);
    } catch (err) {
      console.log('error: ', err);
    }
  };

  useEffect(() => {
    const proposalsToProcess = proposals
      .filter((p) => p.status === 'ReadyForProcessing')
      .sort((a, b) => a.gracePeriodEnds - b.gracePeriodEnds);

    // console.log(proposalsToProcess);
    if (proposalsToProcess.length > 0) {
      setNextProposal(proposalsToProcess[0]);
    }
  }, [proposals]);

  // TODO disable Process button if another proposal needs processing?

  return (
    <>
      <ContentBox>
        {proposal?.status === 'Unsponsored' && !proposal?.proposalIndex && (
          <Flex justify='center' direction='column'>
            <Flex justify='center' mb={4}>
              <Box>
                <TextBox>
                  Deposit to Sponsor{' '}
                  <Tooltip
                    hasArrow
                    shouldWrapChildren
                    placement='bottom'
                    label='Deposits discourage spam, and are returned after a proposal is processed. Minus the reward for processing, if one has been selected'
                  >
                    <Icon as={RiQuestionLine} />
                  </Tooltip>
                </TextBox>
                <TextBox variant='value'>
                  {daoData?.proposalDeposit /
                    10 ** daoData?.depositToken.decimals}{' '}
                  {daoData?.depositToken?.symbol}
                  <Tooltip
                    shouldWrapChildren
                    placement='bottom'
                    label={
                      'Insufficient Funds: You only have ' +
                      wallet?.tokenBalance +
                      ' ' +
                      daoData?.depositToken?.symbol
                    }
                  >
                    <Icon color='red.500' as={RiErrorWarningLine} />
                  </Tooltip>
                </TextBox>
              </Box>
            </Flex>
            <Flex justify='space-around'>
              {+wallet?.allowance * 10 ** daoData?.depositToken?.decimals >
                +daoData?.proposalDeposit || +daoData?.proposalDeposit === 0 ? (
                <Button onClick={() => sponsorProposal(proposal.proposalId)}>
                  Sponsor
                </Button>
              ) : (
                <Button
                  onClick={() => unlock(daoData.depositToken.tokenAddress)}
                >
                  Unlock
                </Button>
              )}
              {proposal?.proposer === user?.username.toLowerCase() && (
                <Button
                  variant='outline'
                  onClick={() => cancelProposal(proposal.proposalId)}
                >
                  Cancel
                </Button>
              )}
            </Flex>
          </Flex>
        )}
        {(proposal?.status !== 'Unsponsored' || proposal?.proposalIndex) &&
          proposal?.status !== 'Cancelled' && (
            <>
              <Flex mb={6} w='100%'>
                {currentlyVoting(proposal) ? (
                  <>
                    <Flex w='48%' justify='space-around'>
                      <Flex
                        p={3}
                        borderWidth='1px'
                        borderColor='green.500'
                        borderStyle='solid'
                        borderRadius='40px'
                        justiy='center'
                        align='center'
                      >
                        <Icon
                          as={FaThumbsUp}
                          color='green.500'
                          w='25px'
                          h='25px'
                          _hover={{ cursor: 'pointer' }}
                          onClick={() => submitVote(proposal, 1)}
                        />
                      </Flex>
                      <Flex
                        p={3}
                        borderWidth='1px'
                        borderColor='red.500'
                        borderStyle='solid'
                        borderRadius='40px'
                        justiy='center'
                        align='center'
                      >
                        <Icon
                          as={FaThumbsDown}
                          color='red.500'
                          w='25px'
                          h='25px'
                          transform='rotateY(180deg)'
                          _hover={{ cursor: 'pointer' }}
                          onClick={() => submitVote(proposal, 2)}
                        />
                      </Flex>
                    </Flex>
                    <Flex justify='flex-end' align='center' w='50%'>
                      <Box as='i' fontSize='xs'>
                        {+proposal?.noVotes > +proposal?.yesVotes &&
                          'Not Passing'}
                        {+proposal?.yesVotes > +proposal?.noVotes &&
                          'Currently Passing'}
                        {+proposal?.yesVotes === 0 &&
                          +proposal?.noVotes === 0 &&
                          'Awaiting Votes'}
                      </Box>
                    </Flex>
                  </>
                ) : (
                  <>
                    <Flex justify='center' align='center' w='100%'>
                      <Skeleton isLoaded={proposal?.status}>
                        <TextBox fontSize='xl' variant='value'>
                          {proposal?.status === 'Failed' && 'Failed'}
                          {proposal?.status === 'Passed' && 'Passed'}
                          {(proposal?.status === 'GracePeriod' ||
                            proposal?.status === 'ReadyForProcessing') &&
                            proposal.yesVotes > proposal.noVotes &&
                            'Passed'}
                          {(proposal?.status === 'GracePeriod' ||
                            proposal?.status === 'ReadyForProcessing') &&
                            proposal.noVotes > proposal.yesVotes &&
                            'Failed'}
                        </TextBox>
                      </Skeleton>
                    </Flex>
                  </>
                )}
              </Flex>
              <Flex
                w='100%'
                h='20px'
                borderRadius='999px'
                backgroundColor='whiteAlpha.500'
                overflow='hidden'
                justify='space-between'
              >
                {+proposal?.yesVotes > 0 && (
                  <MotionBox
                    h='100%'
                    backgroundColor='green.500'
                    borderRight={
                      proposal?.noVotes > 0
                        ? '1px solid white'
                        : '0px solid transparent'
                    }
                    animate={{
                      width: [
                        '0%',
                        `${(+proposal?.yesVotes /
                          (+proposal.yesVotes + +proposal.noVotes)) *
                          100}%`,
                      ],
                    }}
                    transition={{ duration: 0.5 }}
                  />
                )}
                {+proposal?.noVotes > 0 && (
                  <MotionBox
                    h='100%'
                    backgroundColor='red.500'
                    animate={{
                      width: [
                        '0%',
                        `${(+proposal?.noVotes /
                          (+proposal.yesVotes + +proposal.noVotes)) *
                          100}%`,
                      ],
                    }}
                    transition={{ duration: 0.5 }}
                  />
                )}
              </Flex>
              <Flex justify='space-between' mt={3}>
                <Skeleton isLoaded={proposal?.yesVotes}>
                  <TextBox variant='value'>
                    {proposal?.yesVotes || '0'} Yes
                  </TextBox>
                </Skeleton>
                <Skeleton isLoaded={proposal?.noVotes}>
                  <TextBox variant='value'>
                    {proposal?.noVotes || '0'} No
                  </TextBox>
                </Skeleton>
              </Flex>
            </>
          )}

        {proposal?.status === 'ReadyForProcessing' &&
          (nextProposalToProcess.proposalId === proposal?.proposalId ? (
            <Flex justify='center' pt='10px'>
              <Flex direction='column'>
                <Button onClick={() => processProposal(proposal)}>
                  Process
                </Button>
              </Flex>
            </Flex>
          ) : (
            <Flex justify='center' pt='10px'>
              <Flex direction='column'>
                <Button
                  as={Link}
                  to={`/dao/${dao?.address}/proposals/${nextProposalToProcess.proposalId}`}
                  variant='outline'
                  onClick={() => setProposal(nextProposalToProcess)}
                >
                  Proposal {nextProposalToProcess.proposalId} Needs Processing
                  Next
                </Button>
              </Flex>
            </Flex>
          ))}
        {proposal?.status === 'Passed' && proposal?.minionAddress && (
          <Flex justify='center' pt='10px'>
            <Flex direction='column'>
              <Button onClick={() => executeMinion(proposal)}>
                Execute Minion
              </Button>
            </Flex>
          </Flex>
        )}
      </ContentBox>
    </>
  );
};

export default ProposalVote;
