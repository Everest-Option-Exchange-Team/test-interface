import React from "react";
import Slide from '@material-ui/core/Slide';
import { useSnackbar } from 'notistack';

export default function EventSnackBar({showEvent, transactionHash, blockNumber, type}) {
  
  const { enqueueSnackbar, } = useSnackbar();

  // if not show snackbar, exit functional component
  if (!showEvent) {
    return (<></>);
  };

  let msg, variant;
  // possible types: failure, sent, mined
  switch (type) {
    case 'failure':
      msg = "Your transaction was rejected";
      variant = 'warning';
      break
    case 'sent':
      msg = "Your transaction was sent to the Blockchain ⛓";
      variant = 'success';
      break
    case 'mined':
      msg = `Your transaction 🧾 ${transactionHash.slice(0,5)}...${transactionHash.slice(-5,-1)}  was mined ⛏ with block ${blockNumber}.`;
      variant = 'success';
      break
    default:
      // not implemented
      break
  }


  enqueueSnackbar(msg, {
      variant: variant,
      preventDuplicate: true,
      anchorOrigin: {
          vertical: 'bottom',
          horizontal: 'left',
      },
      TransitionComponent: Slide,
    });
  
  // functional component needs to return something
  return (<></>);
}