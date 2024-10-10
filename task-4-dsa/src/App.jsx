import { useState } from "react";
import styles from "./App.module.css";
import axios from "axios";
// import { tempFetchData } from "./tempData";

function App() {
  const [fetchButtonDisabled, setFetchButtonDisabled] = useState(false);
  const [calculateButtonDisabled, setCalculateButtonDisabled] = useState(true);
  const [postButtonDisabled, setPostButtonDisabled] = useState(true);

  const [fetchedData, setFetchedData] = useState({});
  const [resultArray, setResultArray] = useState([]);

  const FETCH_URL = "https://test-share.shub.edu.vn/api/intern-test/input";
  const POST_URL = "https://test-share.shub.edu.vn/api/intern-test/output";

  const calculateType1 = (calculateArr, l, r) => {
    if (l === r) return calculateArr[l];
    let sum = 0;

    for (let i = l; i <= r; i++) {
      sum += calculateArr[i];
    }
    return sum;
  };

  const calculateType2 = (calculateArr, l, r) => {
    if (l === r) return calculateArr[l];
    let sumEven = 0;
    let sumOdd = 0;

    //Calculate sum of even index
    for (let i = l; i <= r; i++) {
      if (i % 2 === 0) sumEven += calculateArr[i];
    }

    //Calculate sum of odd index
    for (let i = l; i <= r; i++) {
      if (i % 2 !== 0) sumOdd += calculateArr[i];
    }

    return sumEven - sumOdd;
  };

  const calculate = (fetchedData) => {
    const resultArr = [];

    for (let i = 0; i < fetchedData.query?.length; i++) {
      let result = 0;
      if (fetchedData.query[i].type === "1") {
        result = calculateType1(
          fetchedData.data,
          fetchedData.query[i].range[0], //l
          fetchedData.query[i].range[1] //r
        );
      } else if (fetchedData.query[i].type === "2") {
        result = calculateType2(
          fetchedData.data,
          fetchedData.query[i].range[0], //l
          fetchedData.query[i].range[1] //r
        );
      } else {
        console.log("Type không hợp lệ (không phải 1 hoặc 2)");
      }
      resultArr[i] = result;
    }

    setResultArray(resultArr);
    console.log("Kết quả: [" + resultArr + "]");
    setPostButtonDisabled(false);
  };

  const fetchData = async () => {
    try {
      const response = await axios.get(FETCH_URL);
      if (response.status >= 200 && response.status <= 300) {
        setFetchedData(response);
        setCalculateButtonDisabled(false);
        alert("Data fetch thành công, có thể bắt đầu tính toán");
      }
    } catch (err) {
      alert("Error when fetching data: " + err);
    }
  };

  const postResultToServer = async (resultArr, token) => {
    try {
      const response = await axios.post(POST_URL, resultArr, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status >= 200 && response.status <= 300) {
        alert("Kết quả được gửi thành công");

        //Clean up state (it is no use in this example, but I think it is a good practice based on my experience)
        setResultArray([]);
        setFetchedData({});
        setFetchButtonDisabled(false);
        setPostButtonDisabled(true);
        setCalculateButtonDisabled(true);
      }
    } catch (err) {
      alert("Lỗi khi gửi kết quả đến server" + err);
    }
  };

  return (
    <>
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <button
            onClick={() => fetchData()}
            disabled={fetchButtonDisabled}
            className={styles.button}
          >
            Lấy bộ dữ liệu
          </button>
          <button
            disabled={calculateButtonDisabled}
            onClick={() => calculate(fetchedData)}
            className={styles.button}
          >
            Bắt đầu tính toán
          </button>
          <button
            onClick={() => postResultToServer(resultArray, fetchedData.token)}
            disabled={postButtonDisabled}
            className={styles.button}
          >
            Trả về kết quả
          </button>
        </div>
      </div>
    </>
  );
}

export default App;
