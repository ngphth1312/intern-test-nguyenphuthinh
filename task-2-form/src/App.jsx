import { useState } from 'react'
import styles from './App.module.css'
import SnackBarAlert from './components/SnackBarAlert';
import { Stack, Paper, Button, TextField, MenuItem } from '@mui/material'
import Grid from '@mui/material/Grid2';
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useForm, Controller } from 'react-hook-form';
import { DateTimePicker } from '@mui/x-date-pickers';


function App() {
  const items = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']; //This array is the unique number of each Gas Pump

  const {register, handleSubmit, control, formState, setError} = useForm();
  const { errors } = formState;

  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("");

  function formatDateTime(value) {
    try {
      // Parse the ISOString date time into a Date object
      const date = new Date(value);

      // Extract and format date components according to your custom format
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0"); // Add leading zero if needed
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");

      const result = `${hours}:${minutes} - ngày ${day}/${month}/${year}`;
      return result;
    } catch (error) {
      console.error("Error parsing ISOString date:", error);
      return null; // Return None on parsing errors
    }
  }

  const onSubmit = (data) => {
    try{
      //calling some API
      //if status === success
      console.log(JSON.stringify(data));
      setAlertMessage("Đã nhập thành công giao dịch tại thời gian: " + (formatDateTime(data.time)));
      setAlertSeverity("success");
      setAlertOpen(true);

    } catch(e){
      setAlertMessage("Lỗi không xác định khi submit form");
      setAlertSeverity("error");
      setAlertOpen(true);
    }
  }

  //Use states:
  const [alertOpen, setAlertOpen] = useState(false);
  const handleAlertClose = (event, reason) => {
    if(reason === 'clickaway')
      return;
    setAlertOpen(false);
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className={styles.container}>
        <SnackBarAlert
          message={alertMessage}
          open={alertOpen}
          onClose={handleAlertClose}
          severity={alertSeverity}
        />
        <Paper className={styles.content_wrapper}>
          <form style={{ width: "100%" }} onSubmit={handleSubmit(onSubmit)}>
            <Grid
              sx={{
                padding: "20px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.2)",
              }}
              className={styles.content_header_container}
              container
              spacing={2}
            >
              <Grid size={6}>
                <Button
                  sx={{ paddingLeft: 0, paddingRight: 0 }}
                  variant="text"
                  startIcon={<ArrowBackIcon />}
                >
                  Đóng
                </Button>
                <h1 className={styles.txt_title}>Nhập giao dịch</h1>
              </Grid>
              <Grid style={{ display: "flex", alignItems: "center" }} size={6}>
                <Button
                  sx={{ marginLeft: "auto", borderRadius: 5 }}
                  variant="contained"
                  type="submit"
                >
                  Cập nhật
                </Button>
              </Grid>
            </Grid>
            <Stack style={{ width: "100%", marginTop: 30 }} spacing={2}>
              <Controller
                control={control}
                name="time"
                rules={{
                  required: "* Vui lòng nhập thời gian",
                }}
                render={({ field, fieldState }) => (
                  <>
                    <DateTimePicker
                      label="Thời gian"
                      ref={field.ref}
                      value={field.value}
                      name={field.name}
                      onBlur={field.onBlur}
                      onChange={(date) => field.onChange(date)}
                      format="DD/MM/YYYY hh:mm a"
                      sx={{ width: "100%" }}
                    />
                    <span style={{ color: "#f00", margin: 5, fontSize: 14 }}>
                      {fieldState.error?.message}
                    </span>
                  </>
                )}
              />
              <TextField
                size="medium"
                type="number"
                required
                label="Số lượng"
                sx={{ width: "100%" }}
                slotProps={{
                  htmlInput: { min: 0, step: 0.01 },
                }}
                {...register("amount", {
                  required: "Please fill out this field",
                })}
              />
              <div style={{ width: "100%" }}>
                <TextField
                  defaultValue={""}
                  label="Trụ"
                  sx={{ width: "100%" }}
                  required
                  select
                  {...register("numOfPlump")}
                  error={!!errors.numOfPlump}
                  helperText={
                    errors.numOfPlump ? errors.numOfPlump.message : ""
                  }
                >
                  {items.map((item, index) => (
                    <MenuItem key={index} value={item}>
                      {item}
                    </MenuItem>
                  ))}
                </TextField>
              </div>
              <TextField
                size="medium"
                type="number"
                required
                label="Doanh thu"
                sx={{ width: "100%" }}
                slotProps={{
                  htmlInput: { min: 0 },
                }}
                {...register("revenue", {
                  required: "Please fill out this field",
                })}
                error={!!errors.revenue}
                helperText={errors.revenue ? errors.revenue.message : ""}
              />
              <TextField
                size="medium"
                type="number"
                required
                label="Đơn giá"
                sx={{ width: "100%" }}
                slotProps={{
                  htmlInput: { min: 0 },
                }}
                {...register("unitPrice", {
                  required: "Please fill out this field",
                })}
                error={!!errors.unitPrice}
                helperText={errors.unitPrice ? errors.unitPrice.message : ""}
              />
            </Stack>
          </form>
        </Paper>
      </div>
    </LocalizationProvider>
  );
}

export default App;
