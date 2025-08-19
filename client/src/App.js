import logo from './logo.svg';
import './App.css';

function App() {
  const personalInfo = {
    name: "Đặng Minh Nhật",
    age: "21",
    studentID: "22110389",
    email: "dminhnhatn@gmail.com"
  }
  return (
    <div className="App">
      <header className="App-header">
        
        <h1>Thông tin cá nhân</h1>
        <p>Họ và tên: {personalInfo.name}</p>
        <p>Tuổi: {personalInfo.age}</p>
        <p>MSSV: {personalInfo.studentID}</p>
        <p>Email: {personalInfo.email}</p>

      </header>
    </div>
  );
}

export default App;
