import React from 'react'
import { Snackbar, Alert } from '@mui/material'

const SnackBarAlert = ({ message, open, onClose, severity }) => {
  return (
    <div>
        <Snackbar
            message={message}
            open={open}
            onClose={onClose}
            autoHideDuration={3000}
            anchorOrigin={{
                vertical: "top",
                horizontal: "right",
            }}
        >
            <Alert
                onClose={onClose}
                severity={severity}
                sx={{width: "100%"}}
            >
                {message}
            </Alert>
        </Snackbar>
    </div>
  )
}

export default SnackBarAlert