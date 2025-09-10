import { notification, Table } from "antd";
import { useEffect, useState } from "react";
import { getUserApi } from "../util/api";

const UserPage = () => {
  const [dataSource, setDataSource] = useState([]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getUserApi();

        if (res && !res.message) {
          // Nếu trả về danh sách user hợp lệ
          setDataSource(res);
        } else {
          // Nếu có message thì báo lỗi
          notification.error({
            message: "Unauthorized",
            description: res.message || "Không có quyền truy cập",
          });
        }
      } catch (error) {
        notification.error({
          message: "Error",
          description: error.message,
        });
      }
    };

    fetchUser();
  }, []);

  const columns = [
    {
      title: "Id",
      dataIndex: "_id",
    },
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "Name",
      dataIndex: "name",
    },
    {
      title: "Role",
      dataIndex: "role",
    },
  ];

  return (
    <div style={{ padding: 30 }}>
      <Table
        bordered
        dataSource={dataSource}
        columns={columns}
        rowKey="_id"
      />
    </div>
  );
};

export default UserPage;
