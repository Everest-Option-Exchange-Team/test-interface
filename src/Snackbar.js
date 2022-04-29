import React from "react";
//import Snackbar from '@material-ui/core/Snackbar';
import Slide from '@material-ui/core/Slide';
//import { SnackbarContent } from "@material-ui/core";
import { useSnackbar } from 'notistack';

export default function EventSnackBar({showEvent, transactionHash, blockNumber, type}) {
  
  const { enqueueSnackbar, } = useSnackbar();

  if (!showEvent) {
    return (<></>);
  };

  let msg, variant;
  // possible types: failure, sent, mined, deposited, withdrew
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
      // variant = 'error';
      // msg = 'Something went wrong';
      break
  }
  // set showEvent to false, before snackbar shows up, because if events fire rapidly after another
  // the same snackbar shows up twice 

enqueueSnackbar(msg, {
    variant: variant,
    preventDuplicate: true,
    anchorOrigin: {
        vertical: 'bottom',
        horizontal: 'left',
    },
    TransitionComponent: Slide,
  });
return (<></>);

  // return (
  //     <Snackbar
  //     anchorOrigin={{
  //       vertical: 'bottom',
  //       horizontal: 'center',
  //     }}
  //     open={showEvent}
  //     autoHideDuration={3000}
  //     onClose={close}
  //   >
  //     <SnackbarContent
  //         style={{backgroundColor: color,}}
  //         message={
  //         <span id="client-snackbar">
  //             {msg}
  //         </span>}
  //       />
  //   </Snackbar>
  //   )
}