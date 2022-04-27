import React from "react";
import Snackbar from '@material-ui/core/Snackbar';
import { SnackbarContent } from "@material-ui/core";


export default function EventSnackBar({showEvent, close, address, amount, type}) {

    return (
        <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        open={showEvent}
        autoHideDuration={4000}
        onClose={close}
      >
        {type==='failure' ? 
          <SnackbarContent
          style={{backgroundColor: 'red',}}
          message={
          <span id="client-snackbar">
              The transaction failed.
          </span>}
         />
        :
          <SnackbarContent
            style={{backgroundColor: 'green',}}
            message={
            <span id="client-snackbar">
                {`${address.slice(0,5)}...${address.slice(-5,-1)} ${type}: ${amount} AVAX`}
            </span>}
          />}
      </Snackbar>
    )
}