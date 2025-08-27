import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu } from 'antd';
import { HomeOutlined, UsergroupAddOutlined, SettingOutlined } from '@ant-design/icons';
import { AuthContext } from '../context/auth.context'; 

const Header = () => {
  const navigate = useNavigate();
  const { auth, setAuth } = useContext(AuthContext);

  const [current, setCurrent] = useState('home');

  const onClick = (e) => {
    console.log('click', e);
    setCurrent(e.key);
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    setAuth({
      isAuthenticated: false,
      user: { email: "", name: "" }
    });
    setCurrent("home");
    navigate("/");
  };

  const items = [
    {
      label: <Link to="/">Home Page</Link>,
      key: 'home',
      icon: <HomeOutlined />,
    },
    ...(auth.isAuthenticated
      ? [
          {
            label: <Link to="/user">Users</Link>,
            key: 'user',
            icon: <UsergroupAddOutlined />,
          },
        ]
      : []),
    {
      label: `Welcome ${auth?.user?.email ?? ""}`,
      key: 'SubMenu',
      icon: <SettingOutlined />,
      children: [
        ...(auth.isAuthenticated
          ? [
              {
                label: <span onClick={handleLogout}>Logout</span>,
                key: 'logout',
              },
            ]
          : [
              {
                label: <Link to="/login">Login</Link>,
                key: 'login',
              },
            ]),
      ],
    },
  ];

  return (
    <Menu
      onClick={onClick}
      selectedKeys={[current]}
      mode="horizontal"
      items={items}
    />
  );
};

export default Header;
