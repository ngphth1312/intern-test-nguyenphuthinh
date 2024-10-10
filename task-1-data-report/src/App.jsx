import { useState } from 'react'
import styles from './App.module.css'
import { Button, Input, Paper, Divider } from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import * as XLSX from "xlsx/xlsx.mjs";

function App() {
  //Use state
  const [uploadedFile, setUploadedFile] = useState();
  const [excelData, setExcelData] = useState([]);

  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [result, setResult] = useState(0);

  //Functions
  const onFileChange = (event) => {
    setResult(-1); //special value to not render the result before all input are valid
    const file = event.target.files[0];
    console.log(file);
    if (file) {
      setUploadedFile(file);
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: "array" });

      // Config to read the first sheet since the excel file only have 1 single sheet
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];

      const range = XLSX.utils.decode_range(worksheet["!ref"]);
      range.s.r = 8; // Start at the ninth row (index = 8)
      range.s.c = 0; // Start at the first column (index = 0)

      // Update the range reference in the worksheet
      worksheet["!ref"] = XLSX.utils.encode_range(range);

      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }); // 'header: 1' will return an array of arrays 
      setExcelData(jsonData);
    };

    reader.onerror = (err) => {
      console.log(err);
    };
    reader.readAsArrayBuffer(file);
  };

  const findIndexOfStartTime = (value, data) => {
    let n = data.length;
    let result = data.length;

    value = parseInt(value, 10);

    //Start looping from the end of the array
    for(let i = n - 1 ; i >= 0; i--){
      let currentHour = parseInt(data[i][2].slice(0, 2), 10);
      if(value == currentHour)
      {
        result = i;
        break;
      }
    }
    return result;
  }

  const findIndexOfEndTime = (value, data) => {
    let n = data.length;
    let result = data.length;

    value = parseInt(value, 10);

    //Start looping from the start of the array
    for (let i = 0; i < n; i++) {
      let currentHour = parseInt(data[i][2].slice(0, 2), 10);
      if (value > currentHour) {
        result = i;
        break;
      }
    }
    return result;
  };

  const formatVND = (value) => {
    if (value === 0) {
      return "0.000"; // Special case for zero value
    }

    if (value) {
      // Split integer and decimal parts (to handle values without decimals)
      const parts = value.toString().split(".");

      // Format the integer part with commas for thousands separation
      const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");

      return `${integerPart}`;
    }
    return "";
  }

  const startCalculate = () => {
    try{
      //Check if Start Time > The biggest time in excel data => total value = 0.000vnd
    if (startTime > parseInt(excelData[0][2].slice(0, 2), 10)) {
      setResult(0);
      console.log("Result = 0");
      return;
    }

    //Check if Start Time > The biggest time in excel data => total value = 0.000vnd
    if (endTime < parseInt(excelData[excelData.length - 1][2].slice(0, 2), 10)) {
      setResult(0);
      console.log("Result = 0");
      return;
    }

    let indexOfStartTimeInExcel = findIndexOfStartTime(startTime, excelData);
    let indexOfEndTimeInExcel = findIndexOfEndTime(endTime, excelData);

    console.log(
      `Index of start time: ${indexOfStartTimeInExcel}, Index of end time: ${indexOfEndTimeInExcel}`
    );

    //Slice the excel array to an array that needed to calculate
    const calculationArr = excelData.slice(
      indexOfEndTimeInExcel,
      indexOfStartTimeInExcel + 1
    );

    let sum = 0;
    for (let i = 0; i < calculationArr.length; i++) {
      sum += parseInt(calculationArr[i][8], 10);
    }
    console.log("Result = " + sum);
    setResult(sum);
    } catch(e){
      if(e.name === "TypeError")
        alert(
          "Không thể thực hiện tính toán, vui lòng kiểm tra lại file excel !!"
        );
      else
        alert("Đã có lỗi xảy ra, vui lòng thử lại sau !!");
    }
  };

   return (
     <>
       <div className={styles.container}>
         <Paper className={styles.content_wrapper} elevation={5}>
           <h1>Data Report</h1>
           <hr
             style={{ marginTop: 0, width: "100%" }}
             className={styles.header_separator}
           />
           <span className={styles.time_picker_container}>
             <label>
               Giờ bắt đầu:
               <input
                 className={styles.time_picker}
                 min={0}
                 max={23}
                 step={1}
                 type="number"
                 value={startTime}
                 onChange={(e) => {
                   setStartTime(e.target.value);
                   setResult(-1);
                 }}
               />
             </label>
             <label>
               Giờ kết thúc:
               <input
                 className={styles.time_picker}
                 type="number"
                 min={0}
                 max={23}
                 step={1}
                 value={endTime}
                 onChange={(e) => {
                   setEndTime(e.target.value);
                   setResult(-1);
                 }}
               />
             </label>
           </span>
           <Button
             className={styles.btn_upload}
             component="label"
             role={undefined}
             variant="contained"
             startIcon={<CloudUpload />}
           >
             Tải lên file báo cáo
             <Input
               style={{ display: "none" }}
               type="file"
               onChange={onFileChange}
               inputProps={{
                 accept: ".xlsx",
               }}
             />
           </Button>
           <div style={{height: 40}}>
             {uploadedFile && (
               <p className={styles.file_upload_message}>
                 File đã được tải lên: <u>{uploadedFile.name}</u>
               </p>
             )}
           </div>
           <hr className={styles.separator} />
           <div style={{ height: 60 }}>
             {result >= 0 &&
               startTime != "" &&
               endTime != "" &&
               excelData.length > 0 && (
                 <p>
                   Tổng thành tiền trong báo cáo ngày <b>{excelData[0][1]}</b>,
                   từ{" "}
                   <b>
                     {startTime} - {endTime}h
                   </b>
                   : {formatVND(result)}
                   <b> vnđ</b>
                 </p>
               )}
           </div>
           <Button
             disabled={
               startTime == "" ||
               endTime == "" ||
               parseInt(startTime) < 0 ||
               parseInt(endTime) > 23 ||
               parseInt(startTime) >= parseInt(endTime) ||
               excelData.length <= 0
                 ? true
                 : false
             }
             variant="contained"
             onClick={() => startCalculate(startTime, endTime)}
           >
             Tính Toán
           </Button>
         </Paper>
       </div>
     </>
   );
}

export default App
